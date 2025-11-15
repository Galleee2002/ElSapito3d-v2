import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/utils";

interface WhyChooseUsProps {
  className?: string;
}

const WhyChooseUs = ({ className }: WhyChooseUsProps) => {
  const points = [
    "Calidad premium en cada impresión",
    "Materiales ecológicos y duraderos",
    "Tiempos de entrega rápidos (48h express)",
    "Personalización total de diseños",
    "Atención personalizada y dedicada",
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="flex items-start gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Check size={28} className="text-[var(--color-border-base)] flex-shrink-0 mt-0.5" strokeWidth={3} />
          <p
            className="text-lg md:text-xl text-[var(--color-contrast-base)] leading-relaxed"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            {point}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default WhyChooseUs;

