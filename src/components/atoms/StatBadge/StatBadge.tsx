import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils";

interface StatBadgeProps {
  value: string | ReactNode;
  label: string;
  icon?: ReactNode;
  className?: string;
}

const StatBadge = ({ value, label, icon, className }: StatBadgeProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "rounded-3xl border-4 border-[var(--color-border-blue)] bg-white px-6 py-4 text-center transition-all duration-300",
        className
      )}
      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {icon ? (
        <div className="flex justify-center mb-2 text-[var(--color-border-blue)]">
          {icon}
        </div>
      ) : (
        <div
          className="text-xl md:text-2xl font-bold text-[var(--color-border-blue)] mb-1"
          style={{ fontFamily: "var(--font-baloo)" }}
        >
          {value}
        </div>
      )}
      <div
        className="text-xs md:text-sm text-[var(--color-contrast-base)]"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {label}
      </div>
    </motion.div>
  );
};

export default StatBadge;
