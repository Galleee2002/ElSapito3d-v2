import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}

const ArrowButton = ({
  direction,
  onClick,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: ArrowButtonProps) => {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10",
        "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center",
        "rounded-full bg-white/90 hover:bg-white",
        "shadow-lg ring-1 ring-black/5",
        "transition-all duration-200",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        "active:scale-95",
        direction === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4",
        className
      )}
    >
      <Icon size={20} className="text-[var(--color-text)]" />
    </button>
  );
};

export default ArrowButton;
