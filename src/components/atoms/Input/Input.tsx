import { forwardRef } from "react";
import { FOCUS_RING_WHITE } from "@/constants";
import { cn } from "@/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-semibold text-[var(--color-contrast-base)] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-white border-2",
            "text-[var(--color-contrast-base)]",
            "placeholder:text-gray-400",
            FOCUS_RING_WHITE,
            "focus:border-transparent",
            "transition-all duration-200",
            error
              ? "border-[var(--color-toad-eyes)] focus:border-[var(--color-toad-eyes)]"
              : "border-[var(--color-border-blue)]",
            className
          )}
          style={{ fontFamily: "var(--font-nunito)" }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--color-toad-eyes)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

