import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { hoverVariants, tapVariants } from "@/constants";

interface PaymentsPanelToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

const PaymentsPanelToggle = ({
  onClick,
  isOpen,
}: PaymentsPanelToggleProps) => {
  return (
    <motion.button
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
        "bg-[var(--color-frog-green)]",
        "border-2 border-[var(--color-border-blue)]",
        "shadow-lg",
        "hover:shadow-xl",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)] focus:ring-offset-2",
        "sm:bottom-6 sm:left-6",
        "md:bottom-8 md:left-8",
        "lg:bottom-10 lg:left-10"
      )}
    >
      <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      {isOpen && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-toad-eyes)] rounded-full border-2 border-white"
        />
      )}
    </motion.button>
  );
};

export default PaymentsPanelToggle;

