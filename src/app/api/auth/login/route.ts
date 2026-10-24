import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(200) });

/** The same answer for every email, so the route never reveals the admin address. */
const NEUTRAL = { ok: true, message: "If this email can sign in, a login email is on its way." };

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid email." }, { status: 400 });
  }
  const { email } = parsed.data;
  if (!isAdminEmail(email)) return NextResponse.json(NEUTRAL);

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  if (error) {
    return NextResponse.json(
      { ok: false, message: "Could not send the email. Try again in a minute." },
      { status: 502 },
    );
  }
  return NextResponse.json(NEUTRAL);
}
