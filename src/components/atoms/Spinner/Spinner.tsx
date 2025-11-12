import { motion } from "framer-motion";
import { cn } from "@/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

const Spinner = ({ size = "md", className }: SpinnerProps) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      className={cn(
        "rounded-full border-[var(--color-frog-green)] border-t-transparent",
        sizeClasses[size],
        className
      )}
      aria-label="Cargando"
    />
  );
};

export default Spinner;

