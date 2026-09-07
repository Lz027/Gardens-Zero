import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/backend-config";


/**
 * Builds a Supabase client that acts as the caller of an HTTP route,
 * using the bearer token on the incoming request. RLS applies as that user.
 */
export async function getRequestUser(
  request: Request,
): Promise<{ userId: string; supabase: SupabaseClient<Database> } | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const url = SUPABASE_URL;
  const key = SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;


  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { userId: data.user.id, supabase };
}
