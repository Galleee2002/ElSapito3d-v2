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
        "inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200",
        "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9",
        "shadow-md",
        "focus:outline-none focus:ring-0",
        selected && "scale-125 shadow-lg",
        !selected && "hover:scale-105 hover:shadow-lg",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer"
      )}
      style={{ backgroundColor: hex }}
    />
  );
};

export default ColorChip;

