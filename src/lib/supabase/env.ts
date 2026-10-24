/** Public Supabase settings. Safe in the browser. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** The one email allowed into /admin. Server only. */
export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const admin = adminEmail();
  return Boolean(admin) && (email ?? "").trim().toLowerCase() === admin;
}
