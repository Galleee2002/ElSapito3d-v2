import { StatItem } from "@/components";
import { cn } from "@/utils";

interface Stat {
  value: string | number;
  label: string;
}

interface StatisticsProps {
  stats: Stat[];
  className?: string;
}

const Statistics = ({ stats, className }: StatisticsProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatItem key={index} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
};

export default Statistics;

