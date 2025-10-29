interface TextProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  weight?: "light" | "normal" | "semibold" | "bold";
  className?: string;
}

const Text = ({
  children,
  size = "md",
  weight = "normal",
  className = "",
}: TextProps) => {
  const baseStyles = "font-[var(--font-body)]";

  const sizeStyles = {
    sm: "text-sm md:text-base",
    md: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
  };

  const weightStyles = {
    light: "font-light",
    normal: "font-normal",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <p
      className={`${baseStyles} ${sizeStyles[size]} ${weightStyles[weight]} ${className}`}
    >
      {children}
    </p>
  );
};

export default Text;

