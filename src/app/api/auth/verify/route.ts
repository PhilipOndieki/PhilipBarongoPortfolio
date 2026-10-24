import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  token: z
    .string()
    .trim()
    .regex(/^\d{6,10}$/),
});

/**
 * Signs in with the code from the login email. This works inside the iPhone
 * Home Screen app, where a link from Mail opens Safari instead.
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  const fail = NextResponse.json(
    { ok: false, message: "That code did not work. Check it, or send a new email." },
    { status: 400 },
  );
  if (!parsed.success || !isAdminEmail(parsed.data.email)) return fail;

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });
  if (error || !isAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    return fail;
  }
  return NextResponse.json({ ok: true });
}
