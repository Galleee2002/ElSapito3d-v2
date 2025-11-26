import { Check, X } from "lucide-react";
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
      aria-label={disabled ? `${name} - Sin stock` : name}
      title={disabled ? "Sin stock" : name}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200",
        "w-6 h-6",
        "shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-border-base",
        selected &&
          "scale-110 shadow-md ring-2 ring-border-base ring-offset-1",
        !selected && !disabled && "hover:scale-105 hover:shadow-md",
        disabled
          ? "opacity-60 cursor-not-allowed bg-gray-100"
          : "cursor-pointer"
      )}
      style={disabled ? undefined : { backgroundColor: hex }}
    >
      {disabled && (
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{ backgroundColor: hex, opacity: 0.3 }}
        />
      )}

      {selected && !disabled && (
        <Check
          size={12}
          className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          strokeWidth={3}
        />
      )}

      {disabled && (
        <X
          size={14}
          className="text-gray-600 relative z-10"
          strokeWidth={2.5}
        />
      )}
    </button>
  );
};

export default ColorChip;
