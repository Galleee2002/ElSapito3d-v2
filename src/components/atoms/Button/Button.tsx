import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "hero";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  interactive?: boolean;
}

const variantStyles = {
  primary:
    "bg-[var(--color-bouncy-lemon)] border-2 border-[var(--color-bouncy-lemon)] text-[var(--color-contrast-base)]",
  secondary:
    "bg-white text-[var(--color-contrast-base)] border-2 border-[var(--color-border-base)] hover:bg-[var(--color-border-base)] hover:text-white",
  hero: "bg-[var(--color-bouncy-lemon)] text-[var(--color-contrast-base)] shadow-[0_20px_45px_rgba(255,236,61,0.35)]",
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled = false,
  interactive = true,
}: ButtonProps) => {
  const hoverProps = interactive
    ? { whileHover: { scale: 1.08 }, whileTap: { scale: 0.97 } }
    : { whileHover: undefined, whileTap: undefined };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...hoverProps}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-contrast-base)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-[0_10px_25px_rgba(43,43,43,0.12)] hover:shadow-[0_18px_40px_rgba(43,43,43,0.15)]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

export default Button;
