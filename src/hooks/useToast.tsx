import { useMemo } from "react";
import { Toaster, toast as toastLib } from "react-hot-toast";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/utils";
import type { ReactNode } from "react";

interface ToastProviderProps {
  children: ReactNode;
}

const getToastStyles = (variant: "success" | "error" | "loading") => {
  if (variant === "success") {
    return {
      icon: <CheckCircle2 className="w-5 h-5 text-[#0E9F6E]" aria-hidden="true" />,
      accent: "border-[#0E9F6E]",
    };
  }
  if (variant === "error") {
    return {
      icon: <XCircle className="w-5 h-5 text-[#DC2626]" aria-hidden="true" />,
      accent: "border-[#DC2626]",
    };
  }
  return {
    icon: null,
    accent: "border-[var(--color-border-base)]/60",
  };
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        containerClassName="!bottom-6 !right-6 !pointer-events-none"
        toastOptions={{
          duration: 4000,
          className: "",
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            margin: 0,
          },
          success: {
            iconTheme: {
              primary: "transparent",
              secondary: "transparent",
            },
            className: "",
            style: {
              background: "transparent",
            },
          },
          error: {
            iconTheme: {
              primary: "transparent",
              secondary: "transparent",
            },
            className: "",
            style: {
              background: "transparent",
            },
          },
          loading: {
            iconTheme: {
              primary: "transparent",
              secondary: "transparent",
            },
            className: "",
            style: {
              background: "transparent",
            },
          },
        }}
      >
        {(t) => {
          const variant = t.type === "loading" ? "loading" : t.type === "success" ? "success" : "error";
          const { icon, accent } = getToastStyles(variant);

          return (
            <div
              className={cn(
                "pointer-events-auto w-full max-w-sm rounded-2xl border-2 bg-white p-4 shadow-lg transition-all duration-200",
                accent
              )}
              style={{
                transform: t.visible ? "translateX(0)" : "translateX(32px)",
                opacity: t.visible ? 1 : 0,
              }}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                {icon && <span className="mt-0.5">{icon}</span>}
                <p
                  className="flex-1 text-sm sm:text-base text-[var(--color-border-base)]"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {t.message as string}
                </p>
                <button
                  type="button"
                  onClick={() => toastLib.dismiss(t.id)}
                  className={cn(
                    "text-[var(--color-border-base)]/60 transition-colors rounded-full",
                    "hover:text-[var(--color-border-base)]",
                    "focus:outline-none"
                  )}
                  aria-label="Cerrar notificación"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        }}
      </Toaster>
    </>
  );
};


interface ToastPromiseOptions<T = unknown> {
  loading: string | React.ReactElement;
  success: string | React.ReactElement | ((data: T) => string | React.ReactElement);
  error: string | React.ReactElement | ((error: unknown) => string | React.ReactElement);
}

interface ToastContextValue {
  showToast: (message: string, variant: "success" | "error") => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showPromise: <T>(
    promise: Promise<T>,
    options: ToastPromiseOptions
  ) => Promise<T>;
  dismissToast: (id: string) => void;
  toast: typeof toastLib;
}

export const useToast = (): ToastContextValue => {
  return useMemo(
    () => ({
      showToast: (message: string, variant: "success" | "error") => {
        if (variant === "success") {
          toastLib.success(message);
        } else {
          toastLib.error(message);
        }
      },
      showSuccess: (message: string) => toastLib.success(message),
      showError: (message: string) => toastLib.error(message),
      showPromise: <T,>(
        promise: Promise<T>,
        options: ToastPromiseOptions<T>
      ) => {
        return toastLib.promise(promise, options);
      },
      dismissToast: (id: string) => toastLib.dismiss(id),
      toast: toastLib,
    }),
    []
  );
};
