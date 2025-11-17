import type { PostgrestError } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/services/supabase";

export const ensureSupabaseConfigured = (): void => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas."
    );
  }
};

export const handleSupabaseError = (error: PostgrestError | null): never => {
  if (!error) {
    throw new Error("Error desconocido al realizar la operación");
  }

  const message =
    error.message || "No pudimos completar la operación. Intenta nuevamente.";

  if (error.code === "PGRST116") {
    throw new Error("No se encontró el recurso solicitado");
  }

  if (error.code === "42501" || error.message?.includes("permission denied")) {
    throw new Error(
      "No tienes permisos para realizar esta acción. Verifica que estés autenticado correctamente."
    );
  }

  throw new Error(message);
};

