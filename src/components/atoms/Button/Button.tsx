interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "highlight";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button = ({
  children,
  variant = "highlight",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  const baseStyles =
    "rounded-[var(--radius-md)] font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-surface)] hover:shadow-[var(--shadow-hover)]",
    accent:
      "bg-[var(--color-accent)] text-[var(--color-text)] hover:shadow-[var(--shadow-hover)]",
    highlight:
      "bg-[var(--color-highlight)] text-[var(--color-text)] hover:shadow-[var(--shadow-hover)]",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} shadow-[var(--shadow-md)]`}
    >
      {children}
    </button>
  );
};

export default Button;
