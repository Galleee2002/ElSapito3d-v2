import { cn } from "@/utils/cn";

interface ColorOptionProps {
  color: string;
  isSelected?: boolean;
  onClick: () => void;
}

const ColorOption = ({ color, isSelected = false, onClick }: ColorOptionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded-full transition-all duration-200",
        "ring-2 ring-offset-2 ring-offset-white hover:scale-110 active:scale-95",
        isSelected ? "ring-[var(--color-primary)]" : "ring-gray-200 hover:ring-gray-300"
      )}
      style={{ backgroundColor: color }}
      aria-label={`Color ${color}`}
      title={color}
    />
  );
};

export default ColorOption;

