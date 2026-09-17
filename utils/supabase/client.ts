import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ouhspvghkibefdxpbhsp.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_3OW5PKsiPeVn49gQV34lfQ_aTVr3LVK";

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
