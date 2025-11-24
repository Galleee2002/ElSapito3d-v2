import { Check } from "lucide-react";
import { cn } from "@/utils";

interface ColorChipProps {
  name: string;
  hex: string;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

const ColorChip = ({
  name,
  hex,
  selected = false,
  onSelect,
  disabled = false,
}: ColorChipProps) => {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={name}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200",
        "w-6 h-6",
        "shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-border-base)]",
        selected && "scale-110 shadow-md ring-2 ring-[var(--color-border-base)] ring-offset-1",
        !selected && "hover:scale-105 hover:shadow-md",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer"
      )}
      style={{ backgroundColor: hex }}
    >
      {selected && (
        <Check
          size={12}
          className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          strokeWidth={3}
        />
      )}
    </button>
  );
};

export default ColorChip;

