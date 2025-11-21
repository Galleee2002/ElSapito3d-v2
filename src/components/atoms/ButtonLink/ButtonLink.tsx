import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils";

interface ButtonLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

const ButtonLink = ({
  to,
  children,
  className,
  ariaLabel,
}: ButtonLinkProps) => {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full border-2 border-primary px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 font-bold text-base sm:text-lg text-border-base bg-transparent hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)] transition-all duration-300 outline-none shadow-[0_10px_25px_rgba(43,43,43,0.12)] hover:shadow-[0_18px_40px_rgba(43,43,43,0.15)]",
        "focus-visible-shadow",
        className
      )}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;
