import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Server-side Supabase admin client using the service role key.
 * Created lazily on first use so env vars are guaranteed to be loaded.
 * Never expose this to the browser.
 */
let _admin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _admin;
}

// Keep backward-compat export — reads env at access time via getter
export const supabaseAdmin = {
  get auth() { return getSupabaseAdmin().auth; },
};
