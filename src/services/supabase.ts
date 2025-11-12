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
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-client-info': 'elsa-3d-app',
      },
    },
    db: {
      schema: 'public',
    },
  }
);

// Manejar errores de refresh token silenciosamente
if (typeof window !== "undefined") {
  // Interceptar errores de consola relacionados con refresh token
  const originalError = console.error;
  console.error = (...args) => {
    const errorString = args.join(' ');
    const isRefreshTokenError = 
      errorString.includes('Invalid Refresh Token') ||
      errorString.includes('Refresh Token Not Found') ||
      (errorString.includes('/auth/v1/token?grant_type=refresh_token') && 
       errorString.includes('400'));
    
    // No mostrar errores de refresh token en la consola
    if (!isRefreshTokenError) {
      originalError.apply(console, args);
    }
  };

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (!session && event !== 'TOKEN_REFRESHED')) {
      // Limpiar datos de sesión inválidos cuando no hay sesión
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.includes('supabase.auth.token') || 
              (key.startsWith('sb-') && key.includes('auth'))) {
            const value = localStorage.getItem(key);
            if (value) {
              try {
                const parsed = JSON.parse(value);
                // Si el token está expirado o es inválido, limpiarlo
                if (!parsed || !parsed.access_token) {
                  localStorage.removeItem(key);
                }
              } catch {
                // Si no se puede parsear, es probable que esté corrupto
                localStorage.removeItem(key);
              }
            }
          }
        });
      } catch {
        // Ignorar errores al limpiar
      }
    }
  });
}
