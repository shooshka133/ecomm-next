import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Use the Next.js helper for proper cookie handling and OAuth support
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// For backwards compatibility (use createSupabaseClient() instead)
export const supabase = createSupabaseClient();
