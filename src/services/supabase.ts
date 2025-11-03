import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseKey) missingVars.push("VITE_SUPABASE_ANON_KEY");

  throw new Error(
    `Las siguientes variables de entorno son requeridas: ${missingVars.join(
      ", "
    )}\n\n` +
      `Por favor crea un archivo .env en la raíz del proyecto con:\n` +
      `VITE_SUPABASE_URL=tu_url_de_supabase\n` +
      `VITE_SUPABASE_ANON_KEY=tu_clave_anonima\n\n` +
      `Puedes obtener estas credenciales en: https://app.supabase.com`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
