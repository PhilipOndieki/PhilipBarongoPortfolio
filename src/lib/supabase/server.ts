import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isAdminEmail, supabaseAnonKey, supabaseUrl } from "./env";

/** Supabase client that acts as the signed-in user (cookie session). */
export async function createUserClient(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component: the proxy refreshes the cookies instead.
        }
      },
    },
  });
}

/** Supabase client with the service role key. Bypasses RLS. Server only. */
export function createServiceClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) throw new Error("Supabase service settings are missing.");
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns the user client when the session belongs to the admin, else null. */
export async function getAdmin(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const supabase = await createUserClient();
  const { data } = await supabase.auth.getUser();
  return data.user && isAdminEmail(data.user.email) ? supabase : null;
}
