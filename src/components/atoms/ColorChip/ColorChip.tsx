import { getDisplayColor } from "@/utils";
import { ColorWithName } from "@/types";

interface ColorChipProps {
  color: ColorWithName;
  className?: string;
}

const ColorChip = ({ color, className = "" }: ColorChipProps) => {
  const displayColor = getDisplayColor(color.code);
  const displayText = color.name || color.code;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 border-[var(--color-border-blue)] text-[var(--color-border-blue)] ${className}`}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <span
        className="w-4 h-4 rounded-full border border-[var(--color-border-blue)]/30"
        style={{ backgroundColor: displayColor }}
        aria-label={`Color ${displayText}`}
      />
      {displayText}
    </span>
  );
};

export default ColorChip;

