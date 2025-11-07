import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { StatBadge } from "@/components";
import { cn } from "@/utils";

interface StatsGridProps {
  className?: string;
}

const StatsGrid = ({ className }: StatsGridProps) => {
  const stats = [
    { value: "+120", label: "figuras" },
    { value: "4", label: "materiales" },
    { value: "48h", label: "express" },
    { value: "", label: "Impresión eco", icon: <Leaf size={32} strokeWidth={2} /> },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <StatBadge value={stat.value} label={stat.label} icon={stat.icon} />
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;

