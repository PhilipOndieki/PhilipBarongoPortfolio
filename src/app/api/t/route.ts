import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const Body = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  kind: z.enum(["visit", "contact"]),
});

const DEDUPE_MS = 30 * 60 * 1000;

/**
 * Public tap logger. Stores only slug, kind and time. It always answers 204,
 * so it never reveals which slugs exist.
 */
export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  const text = await request.text().catch(() => "");
  if (text.length > 500) return done;

  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    return done;
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return done;
  const { slug, kind } = parsed.data;

  try {
    const db = createServiceClient();
    const { data: lead } = await db.from("leads").select("slug").eq("slug", slug).maybeSingle();
    if (!lead) return done;

    const since = new Date(Date.now() - DEDUPE_MS).toISOString();
    const { count } = await db
      .from("taps")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug)
      .eq("kind", kind)
      .gte("created_at", since);
    if (!count) await db.from("taps").insert({ slug, kind });
  } catch {
    // Tracking must never break the public site.
  }
  return done;
}
