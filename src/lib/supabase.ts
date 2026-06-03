import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client.
 * Uses VITE_ env vars (safe to expose — anon key only).
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);
