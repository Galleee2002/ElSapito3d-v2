import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseKey) missingVars.push("VITE_SUPABASE_ANON_KEY");

  const isProduction = import.meta.env.PROD;
  const envHint = isProduction
    ? "Configura estas variables en Vercel: Settings → Environment Variables"
    : "Crea un archivo .env en la raíz del proyecto";

  const errorMessage = `❌ ERROR DE CONFIGURACIÓN ❌\n\nLas siguientes variables de entorno son requeridas: ${missingVars.join(
    ", "
  )}\n\n${envHint}\n\nPuedes obtener estas credenciales en: https://app.supabase.com`;

  if (typeof window !== "undefined") {
    alert(errorMessage);
  }

  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
