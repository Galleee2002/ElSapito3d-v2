import { cn } from "@/utils/cn";
import { X } from "lucide-react";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
}

const CloseButton = ({ onClick, className, "aria-label": ariaLabel = "Cerrar" }: CloseButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center",
        "rounded-full bg-white hover:bg-gray-100",
        "shadow-lg ring-1 ring-black/5",
        "transition-all duration-200",
        "active:scale-95",
        className
      )}
    >
      <X size={20} className="text-[var(--color-text)]" />
    </button>
  );
};

export default CloseButton;

