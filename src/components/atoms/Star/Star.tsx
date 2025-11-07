import { motion } from "framer-motion";
import { cn } from "@/utils";

interface StarProps {
  size?: "small" | "medium" | "large";
  delay?: number;
  left?: string;
  top?: string;
  className?: string;
}

const Star = ({
  size = "medium",
  delay = 0,
  left = "50%",
  top = "50%",
  className,
}: StarProps) => {
  const sizeMap = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <motion.div
      className={cn("absolute", sizeMap[size], className)}
      style={{ left, top, willChange: "transform, opacity" }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0.8, 1, 0],
        scale: [0, 1, 1.2, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="var(--color-bouncy-lemon)"
          filter="drop-shadow(0 0 8px rgba(255,236,61,0.8))"
        />
      </svg>
    </motion.div>
  );
};

export default Star;

