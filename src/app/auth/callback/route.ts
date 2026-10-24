import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase/server";

/** Finishes a magic-link sign-in, then opens the lead queue. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createUserClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  }
  // The proxy decides: the admin lands on the queue, anyone else on the login page.
  return NextResponse.redirect(new URL("/admin/leads", url.origin));
}
