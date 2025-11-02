import { cn } from "@/utils";

interface ColorBadgeProps {
  color: string;
  className?: string;
}

const COLOR_NAMES: Record<string, string> = {
  "#4F8A3F": "Verde",
  "#3A6B2F": "Verde Oscuro",
  "#A1E45F": "Verde Lima",
  "#FFD700": "Dorado",
  "#FF6B35": "Naranja",
  "#FF0000": "Rojo",
  "#8B4513": "Marrón",
  "#90EE90": "Verde Claro",
};

const ColorBadge = ({ color, className }: ColorBadgeProps) => {
  const colorName = COLOR_NAMES[color] || color;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-[var(--color-text)] opacity-70">Color:</span>
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow-sm)]"
          style={{ backgroundColor: color }}
          aria-label={`Color ${colorName}`}
        />
        <span className="text-sm font-medium text-[var(--color-text)]">{colorName}</span>
      </div>
    </div>
  );
};

export default ColorBadge;

