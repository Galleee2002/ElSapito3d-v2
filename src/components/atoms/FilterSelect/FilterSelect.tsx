import { type ChangeEvent } from "react";
import { cn } from "@/utils";

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label?: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Seleccionar...",
  className,
}: FilterSelectProps) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          className="text-xs sm:text-sm font-semibold text-[var(--color-contrast-base)]"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        className={cn(
          "px-3 py-2 rounded-lg",
          "border-2 border-[var(--color-border-base)]",
          "bg-white",
          "text-xs sm:text-sm text-[var(--color-contrast-base)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-frog-green)] focus:border-transparent",
          "transition-all duration-200",
          "cursor-pointer"
        )}
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;

