import { supabase } from "./supabase";

export const getAdminApiHeaders = async (): Promise<HeadersInit> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Debes estar autenticado para realizar esta acción.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  };
};

export const getSupabaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || "";
};

