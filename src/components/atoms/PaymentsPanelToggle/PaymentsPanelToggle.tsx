import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { hoverVariants, tapVariants } from "@/constants";
import { useGreenBackground } from "@/hooks/useGreenBackground";

interface PaymentsPanelToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

const PaymentsPanelToggle = ({ onClick, isOpen }: PaymentsPanelToggleProps) => {
  const { isOnGreenBackground, buttonRef } = useGreenBackground();

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Cerrar panel de pagos" : "Abrir panel de pagos"}
      aria-expanded={isOpen}
      whileHover={hoverVariants.scale}
      whileTap={tapVariants.scale}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
      className={cn(
        "fixed bottom-4 left-4 z-[55]",
        "p-3 sm:p-4 rounded-full",
        "shadow-lg",
        "hover:shadow-xl",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-base)] focus:ring-offset-2",
        "sm:bottom-6 sm:left-6",
        "md:bottom-8 md:left-8",
        "lg:bottom-10 lg:left-10",
        isOnGreenBackground
          ? "bg-white text-[var(--color-contrast-base)]"
          : "bg-[var(--color-frog-green)] text-white"
      )}
    >
      <CreditCard
        className={cn(
          "w-6 h-6 sm:w-7 sm:h-7",
          isOnGreenBackground
            ? "text-[var(--color-contrast-base)]"
            : "text-white"
        )}
      />
      {isOpen && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={cn(
            "absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-toad-eyes)] rounded-full border-2",
            isOnGreenBackground
              ? "border-[var(--color-contrast-base)]"
              : "border-white"
          )}
        />
      )}
    </motion.button>
  );
};

export default PaymentsPanelToggle;
