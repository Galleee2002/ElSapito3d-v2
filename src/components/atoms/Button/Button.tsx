import { cn } from "@/utils/cn";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "highlight";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  variant = "highlight",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  className,
}: ButtonProps) => {
  const variantStyles = {
    primary: "bg-[var(--color-primary)] text-[var(--color-surface)]",
    accent: "bg-[var(--color-accent)] text-[var(--color-text)]",
    highlight:
      "relative isolate overflow-hidden bg-transparent text-white ring-2 ring-[var(--color-highlight)] " +
      "hover:text-[var(--color-text)] " +
      "after:content-[''] after:absolute after:top-0 after:left-0 after:h-full after:w-0 after:bg-[var(--color-highlight)] after:transition-all after:duration-300 after:z-0 hover:after:w-full",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-xs sm:px-4 sm:text-sm",
    md: "px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base",
    lg: "px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[var(--radius-md)] font-semibold transition-all duration-300 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
