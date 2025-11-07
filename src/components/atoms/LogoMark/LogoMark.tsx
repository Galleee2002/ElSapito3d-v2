import { cn } from "@/utils";
import logo from "@/assets/images/logo.png";

interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LogoMark = ({ className = "", size = "md" }: LogoMarkProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <img
      src={logo}
      alt="ElSapito3D Logo"
      className={cn("object-contain", sizeClasses[size], className)}
    />
  );
};

export default LogoMark;

