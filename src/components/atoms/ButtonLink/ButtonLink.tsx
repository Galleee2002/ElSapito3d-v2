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
        "rounded-full border border-border-base/30 px-4 sm:px-5 py-1.5 sm:py-2 font-semibold text-sm sm:text-base text-border-base bg-transparent hover:bg-bouncy-lemon transition-all duration-300 outline-none",
        "focus-visible-shadow",
        className
      )}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;
