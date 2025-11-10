import { getDisplayColor } from "@/utils";
import { ColorWithName } from "@/types";
import { getColorByName } from "@/constants";

interface ColorChipProps {
  color: ColorWithName;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const ColorChip = ({ color, className = "", onClick, isSelected = false }: ColorChipProps) => {
  const displayColor = getDisplayColor(color.code);
  const predefinedColor = color.name ? getColorByName(color.name) : null;
  const displayText = predefinedColor?.displayName || color.name || color.code;

  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
        onClick
          ? `cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)] focus:ring-offset-2 ${
              isSelected
                ? "bg-[var(--color-border-blue)] text-white border-[var(--color-border-blue)]"
                : "bg-white text-[var(--color-border-blue)] border-[var(--color-border-blue)] hover:bg-[var(--color-border-blue)]/10"
            }`
          : `text-[var(--color-border-blue)] border-[var(--color-border-blue)]`
      } ${className}`}
      style={{ fontFamily: "var(--font-poppins)" }}
      aria-label={onClick ? `Seleccionar color ${displayText}` : `Color ${displayText}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span
        className="w-4 h-4 rounded-full border border-[var(--color-border-blue)]/30"
        style={{ backgroundColor: displayColor }}
        aria-hidden="true"
      />
      {displayText}
    </Component>
  );
};

export default ColorChip;

