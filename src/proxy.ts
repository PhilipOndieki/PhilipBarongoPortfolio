import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Guards /admin. Refreshes the Supabase session cookie, then sends anyone who
 * is not the admin to /admin/login. API routes check the session again.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  matcher: ["/admin/:path*"],
};
