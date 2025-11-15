import { type ChangeEvent } from "react";
import { cn } from "@/utils";

interface CategorySelectProps {
  id?: string;
  label?: string;
  value: string;
  options: Array<{ id: string; name: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const CategorySelect = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Seleccionar categoría...",
  error,
  required,
  className,
}: CategorySelectProps) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-[var(--color-contrast-base)] mb-2"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {label}
          {required && <span className="text-[var(--color-toad-eyes)] ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full px-4 py-3 rounded-xl",
          "bg-white border-2",
          "text-[var(--color-contrast-base)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-base)] focus:ring-offset-2",
          "focus:border-[var(--color-border-base)]",
          "transition-all duration-200",
          "cursor-pointer",
          error
            ? "border-[var(--color-toad-eyes)] focus:border-[var(--color-toad-eyes)] focus:ring-[var(--color-toad-eyes)]"
            : "border-[var(--color-border-base)]",
          className
        )}
        style={{ fontFamily: "var(--font-nunito)" }}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">{error}</p>
      )}
    </div>
  );
};

export default CategorySelect;

