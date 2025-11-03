import { cn } from "@/utils";

interface StatItemProps {
  value: string | number;
  label: string;
  className?: string;
}

const StatItem = ({ value, label, className }: StatItemProps) => {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-2">
        {value}
      </div>
      <div className="text-sm sm:text-base text-[var(--color-text)] opacity-70">
        {label}
      </div>
    </div>
  );
};

export default StatItem;

