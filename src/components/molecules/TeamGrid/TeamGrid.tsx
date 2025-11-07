import { motion } from "framer-motion";
import { Smile, Palette, Settings, Lightbulb } from "lucide-react";
import { TeamCard } from "@/components";
import { cn } from "@/utils";

interface TeamGridProps {
  className?: string;
}

const TeamGrid = ({ className }: TeamGridProps) => {
  const team = [
    { avatar: <Smile size={64} strokeWidth={2} />, name: "Elsa", role: "Fundadora & Diseñadora" },
    { avatar: <Palette size={64} strokeWidth={2} />, name: "Alex", role: "Especialista 3D" },
    { avatar: <Settings size={64} strokeWidth={2} />, name: "Mia", role: "Operaciones" },
    { avatar: <Lightbulb size={64} strokeWidth={2} />, name: "Leo", role: "Innovación" },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6", className)}>
      {team.map((member, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <TeamCard
            avatar={member.avatar}
            name={member.name}
            role={member.role}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default TeamGrid;

