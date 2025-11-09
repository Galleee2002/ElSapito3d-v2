import { forwardRef } from "react";
import { FOCUS_RING_WHITE } from "@/constants";
import { cn } from "@/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
            "bg-white border-2",
            "text-[var(--color-contrast-base)]",
            "placeholder:text-gray-400",
            FOCUS_RING_WHITE,
            "focus:border-transparent",
            "transition-all duration-200",
            "resize-y min-h-[100px]",
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

Textarea.displayName = "Textarea";

export default Textarea;

