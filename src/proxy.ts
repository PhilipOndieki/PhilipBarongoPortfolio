import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Guards /admin. Refreshes the Supabase session cookie, then sends anyone who
 * is not the admin to /admin/login. API routes check the session again.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Supabase falls back to the site root when the callback URL is not on its
  // redirect list. Pass a sign-in code on to the callback instead of dropping it.
  if (!pathname.startsWith("/admin")) {
    if (searchParams.has("code") || searchParams.has("token_hash")) {
      const target = new URL("/auth/callback", request.url);
      target.search = request.nextUrl.search;
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  const isLogin = pathname === "/admin/login";
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    return isLogin ? response : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const allowed = Boolean(data.user) && isAdminEmail(data.user?.email);

  if (!allowed && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (allowed && isLogin) {
    return NextResponse.redirect(new URL("/admin/leads", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/"],
};
