import { Link } from "react-router-dom";
import { FOCUS_VISIBLE_SHADOW } from "@/constants";
import { cn } from "@/utils";

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const ButtonLink = ({
  to,
  children,
  className = "",
  ariaLabel,
}: ButtonLinkProps) => {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full border-[3px] border-[var(--color-border-blue)] px-4 sm:px-5 py-1.5 sm:py-2 font-semibold text-sm sm:text-base text-[var(--color-border-blue)] bg-transparent hover:bg-[var(--color-bouncy-lemon)] transition-all duration-300 outline-none",
        FOCUS_VISIBLE_SHADOW,
        className
      )}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;

