import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils";

interface IconCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

const IconCard = ({ icon, title, description, className }: IconCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "rounded-3xl border-4 border-[var(--color-border-blue)] bg-[var(--color-frog-green)] p-4 sm:p-5 md:p-6 transition-all duration-300",
        "hover:-translate-y-2",
        className
      )}
      whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex justify-center mb-4 text-[var(--color-border-blue)]">{icon}</div>
      <h3
        className="text-lg sm:text-xl font-bold text-[var(--color-border-blue)] mb-2 text-center"
        style={{ fontFamily: "var(--font-baloo)" }}
      >
        {title}
      </h3>
      <p
        className="text-xs sm:text-sm text-[var(--color-contrast-base)] text-center leading-relaxed"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {description}
      </p>
    </motion.div>
  );
};

export default IconCard;

