import { X, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const variantStyles: Record<ToastVariant, { icon: JSX.Element; accent: string }> =
  {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-[#0E9F6E]" aria-hidden="true" />,
      accent: "border-[#0E9F6E]",
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-[#DC2626]" aria-hidden="true" />,
      accent: "border-[#DC2626]",
    },
  };

const Toast = ({ message, variant, onDismiss }: ToastProps) => {
  const { icon, accent } = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-2xl border-2 bg-white p-4 shadow-lg",
        accent
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{icon}</span>
        <p
          className="flex-1 text-sm sm:text-base text-[var(--color-border-blue)]"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "text-[var(--color-border-blue)]/60 transition-colors",
            "hover:text-[var(--color-border-blue)] focus:outline-none",
            "focus:ring-2 focus:ring-[var(--color-bouncy-lemon)] focus:ring-offset-2 rounded-full"
          )}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;



