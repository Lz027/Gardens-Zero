// Gardens Zero — external Supabase backend.
// URL + publishable (anon) key are public values, safe to keep in code.
// NEVER put the service role key here.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const SUPABASE_PROJECT_ID = 'yotwfwyvovgjvleqllqb';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HnpRepofTyvH7ZzZfNOnRw_69Ci3_Wa';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function gardensFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }
    // New-format keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

function createGardensClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: gardensFetch(SUPABASE_PUBLISHABLE_KEY) },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}

let _supabase: ReturnType<typeof createGardensClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createGardensClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createGardensClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
