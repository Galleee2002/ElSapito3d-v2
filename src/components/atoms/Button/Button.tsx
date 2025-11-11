import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const variantStyles = {
  primary:
    "bg-[var(--color-border-blue)] border-2 border-[var(--color-border-blue)] text-white hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]",
  secondary:
    "bg-white text-[var(--color-contrast-base)] border-2 border-[var(--color-border-blue)] hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white",
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:whitespace-nowrap focus:outline-none",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

export default Button;
