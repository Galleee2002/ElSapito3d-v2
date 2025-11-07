import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { motionVariants, hoverVariants, tapVariants } from "@/constants";

interface NavCtaProps {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

const NavCta = ({
  to,
  children,
  variant = "primary",
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
          "px-4 py-2 rounded-full block text-sm font-semibold",
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)] focus-visible:ring-offset-2",
          "transition-all duration-300",
          isPrimary
            ? "text-[var(--color-contrast-base)] bg-white/90 hover:bg-white border-2 border-[var(--color-border-blue)]"
            : "text-white bg-[var(--color-toad-eyes)] border-2 border-[var(--color-toad-eyes)] hover:brightness-110",
          className
        )}
        style={{
          boxShadow: isPrimary
            ? "0 2px 8px rgba(39,76,154,0.2)"
            : "0 2px 8px rgba(226,60,60,0.3)",
        }}
        onMouseEnter={(e) => {
          if (isPrimary) {
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(255,236,61,0.4), 0 2px 8px rgba(39,76,154,0.3)";
          } else {
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(226,60,60,0.6), 0 2px 8px rgba(226,60,60,0.4)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isPrimary
            ? "0 2px 8px rgba(39,76,154,0.2)"
            : "0 2px 8px rgba(226,60,60,0.3)";
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default NavCta;

