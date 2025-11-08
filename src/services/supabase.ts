import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseKey) missingVars.push("VITE_SUPABASE_ANON_KEY");

  const errorMessage = `❌ ERROR DE CONFIGURACIÓN ❌\n\nLas siguientes variables de entorno son requeridas: ${missingVars.join(
    ", "
  )}\n\nPor favor crea un archivo .env en la raíz del proyecto con:\nVITE_SUPABASE_URL=tu_url_de_supabase\nVITE_SUPABASE_ANON_KEY=tu_clave_anonima\n\nPuedes obtener estas credenciales en: https://app.supabase.com`;

  alert(errorMessage);

  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
