import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils";

type InputState = "default" | "success" | "error";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  state?: InputState;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = "text", state = "default", ...props }, ref) => {
    const resolvedState: InputState = error ? "error" : state;

    const stateClasses: Record<InputState, string> = {
      default: "border-[var(--color-border-base)]/30 focus:border-[var(--color-border-base)]/60 focus:ring-[var(--color-border-base)]/50",
      success: "border-[var(--color-frog-green)]/60 focus:border-[var(--color-frog-green)] focus:ring-[var(--color-frog-green)]/40",
      error: "border-[var(--color-toad-eyes)]/60 focus:border-[var(--color-toad-eyes)] focus:ring-[var(--color-toad-eyes)]/50",
    };

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
            "bg-white border",
            "text-[var(--color-contrast-base)]",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-1 focus:ring-offset-1",
            "transition-all duration-200",
            stateClasses[resolvedState],
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

