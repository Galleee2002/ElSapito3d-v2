import { cn } from "@/utils/cn";

interface TextProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  weight?: "light" | "normal" | "semibold" | "bold";
  className?: string;
}

const Text = ({ children, size = "md", weight = "normal", className }: TextProps) => {
  const sizeStyles = {
    sm: "text-xs sm:text-sm md:text-base",
    md: "text-sm sm:text-base md:text-lg",
    lg: "text-base sm:text-lg md:text-xl",
    xl: "text-lg sm:text-xl md:text-2xl",
  };

  const weightStyles = {
    light: "font-light",
    normal: "font-normal",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <p className={cn("font-[var(--font-body)]", sizeStyles[size], weightStyles[weight], className)}>
      {children}
    </p>
  );
};

export default Text;

