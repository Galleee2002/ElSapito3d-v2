import { cn } from "@/utils";
import { COLOR_NAMES } from "@/constants";

interface ColorOption {
  color: string;
  name: string;
  images: string[];
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

const ColorSelector = ({
  colors,
  selectedColor,
  onColorChange,
  className,
}: ColorSelectorProps) => {
  if (colors.length <= 1) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-sm text-[var(--color-text)] opacity-70">
        Color:
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((option) => {
          const colorName = COLOR_NAMES[option.color] || option.color;
          const isSelected = option.color === selectedColor;

          return (
            <button
              key={option.color}
              onClick={() => onColorChange(option.color)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-all",
                isSelected
                  ? "bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] ring-1 ring-black/10 hover:ring-black/20"
              )}
              aria-label={`Seleccionar color ${colorName}`}
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-[var(--shadow-sm)]"
                style={{ backgroundColor: option.color }}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text)]"
                )}
              >
                {colorName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
