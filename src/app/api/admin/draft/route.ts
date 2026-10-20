import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/supabase/server";

export const maxDuration = 60;

const Body = z.object({ leadId: z.string().uuid() });

const SYSTEM = `You write one short WhatsApp message from Philip Ondieki, a software engineer in Nairobi, to a local business that does not appear to have a website.

Rules:
- Write in plain, warm, simple English. No emojis. No exclamation marks. No hype words.
- Use only the facts given. Do not invent reviews, numbers, competitors or claims.
- Do not pretend to know the owner. Do not create urgency. Do not offer discounts or prices.
- Under 90 words before the sign-off.
- Structure, one idea per line or short paragraph:
  1. Confirm the business: "Hi, is this <name> at <area>?"
  2. Who Philip is, and that he could not find a website for the business.
  3. One concrete benefit of a website for this type of business.
  4. The portfolio link exactly as given.
  5. One soft question asking if he can share a quick idea.
  6. This exact line: "If now is not a good time, no problem at all, I won't message again."
  7. This exact sign-off on two lines: "Philip Ondieki" and "Software Engineer, Nairobi".
- Output only the message text.

Example of tone and length:

Hi, is this Itara Grills at Fourways?

I'm Philip, a web developer in Nairobi. I was looking at restaurants around Kiambu Road and couldn't find a website for Itara Grills.

A site with your menu, photos and a table booking or order button helps hungry people choose you on the spot. Some of my work: philipondieki.co.ke/?r=itara-grills

Can I share a quick idea for Itara Grills?

If now is not a good time, no problem at all, I won't message again.

Philip Ondieki
Software Engineer, Nairobi`;

export async function POST(request: Request) {
  const db = await getAdmin();
  if (!db) return NextResponse.json({ message: "Not signed in." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Unknown lead." }, { status: 400 });

  const { data: lead } = await db
    .from("leads")
    .select("id,slug,name,type,area,city,status")
    .eq("id", parsed.data.leadId)
    .maybeSingle();
  if (!lead) return NextResponse.json({ message: "Unknown lead." }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "The Claude API key is not set." }, { status: 500 });
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://philipondieki.co.ke")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const prompt = [
    `Business name: ${lead.name}`,
    `Business type: ${lead.type ?? "Business"}`,
    `Area: ${lead.area ?? lead.city ?? ""}, ${lead.city ?? ""}`,
    `Portfolio link: ${site}/?r=${lead.slug}`,
  ].join("\n");

  let message = "";
  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    message = res.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  } catch {
    return NextResponse.json(
      { message: "Claude could not write the message. Try again." },
      { status: 502 },
    );
  }
  if (!message) {
    return NextResponse.json({ message: "Claude returned an empty message." }, { status: 502 });
  }

  const patch: Record<string, string | number> = { message };
  if (lead.status === "new") {
    const { data: last } = await db
      .from("leads")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    patch.status = "queued";
    patch.sort_order = ((last?.sort_order as number | undefined) ?? 0) + 1;
  }
  const { error } = await db.from("leads").update(patch).eq("id", lead.id);
  if (error) return NextResponse.json({ message: "Could not save the message." }, { status: 500 });

  return NextResponse.json({ message });
}
