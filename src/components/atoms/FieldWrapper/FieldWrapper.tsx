import { ReactNode } from "react";
import { Input } from "@/components";

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children?: ReactNode;
  inputProps?: {
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    state?: "default" | "error";
  };
}

const FieldWrapper = ({
  id,
  label,
  required = false,
  error,
  children,
  inputProps,
}: FieldWrapperProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (inputProps && <Input id={id} {...inputProps} />)}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FieldWrapper;

