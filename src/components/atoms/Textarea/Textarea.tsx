import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
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
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-white border border-[var(--color-border-base)]/30",
            "text-[var(--color-contrast-base)]",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-1 focus:ring-[var(--color-border-base)]/50 focus:ring-offset-1",
            "focus:border-[var(--color-border-base)]/60",
            "transition-all duration-200",
            "resize-y min-h-[100px]",
            error
              ? "border-[var(--color-toad-eyes)]/60 focus:border-[var(--color-toad-eyes)] focus:ring-[var(--color-toad-eyes)]/50"
              : "",
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

Textarea.displayName = "Textarea";

export default Textarea;

