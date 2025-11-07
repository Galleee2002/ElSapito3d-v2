import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";
import { IconCard } from "@/components";

interface MissionVisionValuesProps {
  className?: string;
}

const MissionVisionValues = ({ className }: MissionVisionValuesProps) => {
  const items = [
    {
      icon: <Target size={64} strokeWidth={2} />,
      title: "Misión",
      description:
        "Crear figuras 3D únicas y personalizadas que traigan alegría y creatividad a cada hogar.",
    },
    {
      icon: <Eye size={64} strokeWidth={2} />,
      title: "Visión",
      description:
        "Ser el laboratorio 3D de referencia, reconocido por calidad, innovación y compromiso ecológico.",
    },
    {
      icon: <Heart size={64} strokeWidth={2} />,
      title: "Valores",
      description:
        "Calidad, sostenibilidad, personalización y pasión por cada proyecto que emprendemos.",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <IconCard
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MissionVisionValues;

