import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils";

interface TeamCardProps {
  avatar: ReactNode;
  name: string;
  role: string;
  className?: string;
}

const TeamCard = ({ avatar, name, role, className }: TeamCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "rounded-3xl border-4 border-[var(--color-border-base)] bg-[var(--color-frog-green)] p-6 text-center transition-all duration-300",
        "hover:-translate-y-2",
        className
      )}
      whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex justify-center mb-4 text-[var(--color-border-base)]">{avatar}</div>
      <h4
        className="text-base md:text-lg font-bold text-[var(--color-border-base)] mb-1"
        style={{ fontFamily: "var(--font-baloo)" }}
      >
        {name}
      </h4>
      <p
        className="text-xs md:text-sm text-[var(--color-contrast-base)]"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {role}
      </p>
    </motion.div>
  );
};

export default TeamCard;

