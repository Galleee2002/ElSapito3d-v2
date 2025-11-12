import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseKey) missingVars.push("VITE_SUPABASE_ANON_KEY");

  const isProduction = import.meta.env.PROD;
  const envHint = isProduction
    ? "Configura estas variables en Vercel:\n1. Ve a Settings → Environment Variables\n2. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY\n3. Redesplega la aplicación\n\nVer CONFIGURACION_VERCEL.md para más detalles."
    : "Crea un archivo .env en la raíz del proyecto con:\nVITE_SUPABASE_URL=tu_url_de_supabase\nVITE_SUPABASE_ANON_KEY=tu_clave_anonima";

  const errorMessage = `❌ ERROR DE CONFIGURACIÓN ❌\n\nLas siguientes variables de entorno son requeridas: ${missingVars.join(
    ", "
  )}\n\n${envHint}\n\nPuedes obtener estas credenciales en: https://app.supabase.com`;

  console.error("❌ Variables de entorno faltantes:", missingVars);
  console.error("Entorno:", isProduction ? "Producción (Vercel)" : "Desarrollo");

  if (typeof window !== "undefined") {
    alert(errorMessage);
  }

  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkSupabaseSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error al verificar sesión de Supabase:", error);
      return false;
    }
    return Boolean(data.session);
  } catch (err) {
    console.error("Error inesperado al verificar sesión:", err);
    return false;
  }
};