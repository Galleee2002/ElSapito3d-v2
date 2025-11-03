import { cn } from "@/utils";

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

const Label = ({ htmlFor, children, className, required = false }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-[var(--color-text)]/70 mb-2",
        className
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;

