import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

/** Finishes a magic-link sign-in, then opens the lead queue. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createUserClient();

  let email: string | undefined;
  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    email = data.user?.email;
  } else if (tokenHash && type) {
    const { data } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    email = data.user?.email;
  }

  if (!isAdminEmail(email)) {
    // Expired link, a link opened in another browser, or a non-admin email.
    return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
  }
  return NextResponse.redirect(new URL("/admin/leads", url.origin));
}
