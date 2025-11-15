import { AlertCircle } from "lucide-react";
import { getMissingEnvVars, isSupabaseConfigured } from "@/services/supabase";

const SupabaseConfigError = () => {
  if (isSupabaseConfigured()) {
    return null;
  }

  const missingVars = getMissingEnvVars();
  const isProduction = import.meta.env.PROD;
  const envHint = isProduction
    ? "Configura estas variables en Vercel: Settings → Environment Variables"
    : "Crea un archivo .env en la raíz del proyecto";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div
        className="max-w-2xl w-full rounded-3xl border-4 border-[var(--color-toad-eyes)] bg-white p-6 sm:p-8 shadow-2xl"
        style={{
          boxShadow: "0 20px 60px rgba(192, 57, 43, 0.3)",
        }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertCircle
              size={48}
              className="text-[var(--color-toad-eyes)]"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[var(--color-toad-eyes)] mb-4"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Error de Configuración
            </h2>
            <div className="space-y-4">
              <div>
                <p
                  className="text-base sm:text-lg text-[var(--color-contrast-base)] mb-3"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Las siguientes variables de entorno son requeridas:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {missingVars.map((varName) => (
                    <li
                      key={varName}
                      className="text-base sm:text-lg font-mono font-semibold text-[var(--color-border-base)]"
                    >
                      {varName}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="bg-[var(--color-border-base)]/10 rounded-xl p-4 border-2 border-[var(--color-border-base)]/30"
              >
                <p
                  className="text-sm sm:text-base text-[var(--color-contrast-base)]"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  <strong>Instrucciones:</strong> {envHint}
                </p>
              </div>
              <div
                className="bg-[var(--color-frog-green)]/10 rounded-xl p-4 border-2 border-[var(--color-frog-green)]/30"
              >
                <p
                  className="text-sm sm:text-base text-[var(--color-contrast-base)]"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  <strong>Obtén tus credenciales en:</strong>{" "}
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-border-base)] underline hover:text-[var(--color-frog-green)]"
                  >
                    https://app.supabase.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--color-border-base)] text-white rounded-xl font-semibold hover:bg-[var(--color-border-base)]/90 transition-colors"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfigError;

