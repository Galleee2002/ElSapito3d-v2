import { motion } from "framer-motion";
import { cn } from "@/utils";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button = ({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  const baseStyles =
    "px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-bouncy-lemon)]/70 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[var(--color-border-blue)] border-2 border-[var(--color-border-blue)] text-white hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]",
    secondary:
      "bg-white text-[var(--color-contrast-base)] border-2 border-[var(--color-border-blue)] hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
