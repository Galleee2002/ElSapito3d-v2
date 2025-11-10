import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { Toast } from "@/components";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  dismissToast: (id: string) => void;
}

const TOAST_DURATION = 4000;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Record<string, number>>({});

  const clearToastTimeout = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutsRef.current[id];
    }
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      clearToastTimeout(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearToastTimeout]
  );

  const addToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, variant }]);

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION);

      timeoutsRef.current[id] = timeoutId;
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: addToast,
      showSuccess: (message: string) => addToast(message, "success"),
      showError: (message: string) => addToast(message, "error"),
      dismissToast,
    }),
    [addToast, dismissToast]
  );

  const toastContainer =
    typeof document !== "undefined"
      ? createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex flex-col items-center gap-3 px-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
            <AnimatePresence initial={false}>
              {toasts.map((toast) => (
                <Toast
                  key={toast.id}
                  message={toast.message}
                  variant={toast.variant}
                  onDismiss={() => dismissToast(toast.id)}
                />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastContainer}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe utilizarse dentro de un ToastProvider");
  }
  return context;
};
