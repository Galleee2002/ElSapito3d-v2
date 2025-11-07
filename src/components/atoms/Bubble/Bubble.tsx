import { motion } from "framer-motion";
import { cn } from "@/utils";

interface BubbleProps {
  size?: "small" | "medium" | "large";
  delay?: number;
  left?: string;
  top?: string;
  className?: string;
}

const Bubble = ({
  size = "medium",
  delay = 0,
  left = "50%",
  top = "50%",
  className,
}: BubbleProps) => {
  const sizeMap = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  return (
    <motion.div
      className={cn(
        "absolute rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30",
        sizeMap[size],
        className
      )}
      style={{ left, top }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.8, 0],
        scale: [0, 1, 1.1, 0],
        y: [0, -100, -200, -300],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
};

export default Bubble;

