import { cn } from "@/utils";

interface InputProps {
  id?: string;
  name?: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  step?: string;
}

const Input = ({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className,
  step,
}: InputProps) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      step={step}
      className={cn(
        "w-full px-4 py-3 rounded-[var(--radius-md)]",
        "bg-[var(--color-surface)] border border-black/10",
        "text-[var(--color-text)] placeholder:text-[var(--color-text)]/50",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all duration-300",
        className
      )}
    />
  );
};

export default Input;

