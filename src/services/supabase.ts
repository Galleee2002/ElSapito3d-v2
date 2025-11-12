import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.trim() && supabaseKey.trim());
};

export const getMissingEnvVars = (): string[] => {
  const missing: string[] = [];
  if (!supabaseUrl || !supabaseUrl.trim()) missing.push("VITE_SUPABASE_URL");
  if (!supabaseKey || !supabaseKey.trim()) missing.push("VITE_SUPABASE_ANON_KEY");
  return missing;
};

export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
