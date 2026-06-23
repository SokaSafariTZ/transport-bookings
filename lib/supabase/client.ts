import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (anon key). Used for auth + reads guarded by RLS.
 * Falls back to null when env is not configured so the app still runs against
 * the in-memory seed driver.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

export const isSupabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
