import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { motionVariants, hoverVariants, tapVariants } from "@/constants";

type NavCtaSize = "sm" | "md" | "lg";

const sizeStyles: Record<NavCtaSize, string> = {
  sm: "px-3 py-1.5 text-xs lg:text-sm",
  md: "px-4 py-2 text-sm sm:text-base",
  lg: "px-5 py-3 text-base sm:text-lg",
};

interface NavCtaProps {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: NavCtaSize;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

const NavCta = ({
  to,
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
}: NavCtaProps) => {
  const isPrimary = variant === "primary";

  return (
    <motion.div
      whileHover={hoverVariants.scale}
      whileTap={tapVariants.scale}
      transition={motionVariants.spring}
    >
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "rounded-full block font-semibold transition-all duration-300",
          sizeStyles[size],
          "outline-none",
          isPrimary
            ? "text-[var(--color-contrast-base)] bg-white/90 border-2 border-[var(--color-border-blue)] hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]"
            : "text-white bg-[var(--color-toad-eyes)] border-2 border-[var(--color-toad-eyes)] hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white",
          className
        )}
        style={{ boxShadow: "none" }}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default NavCta;

