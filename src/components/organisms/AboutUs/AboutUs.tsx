import { motion } from "framer-motion";
import { WhyChooseUs, StatsGrid } from "@/components";
import { cn } from "@/utils";

interface AboutUsProps {
  className?: string;
}

const AboutUs = ({ className }: AboutUsProps) => {
  return (
    <section
      className={cn(
        "relative py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-6",
        "bg-[#E8F9C9]",
        className
      )}
      id="sobre-nosotros"
    >
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-[var(--color-border-base)] mb-4"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Sobre nosotros
          </h2>
          <p
            className="text-xl md:text-2xl text-[var(--color-contrast-base)] max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Creamos figuras 3D personalizadas y únicas para quienes buscan
            calidad, creatividad y un toque especial en cada detalle.
          </p>
        </motion.div>

        {/* Bloque Historia + Por qué elegirnos (2 columnas) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-4 md:space-y-6">
            <h3
              className="text-2xl md:text-3xl font-bold text-[var(--color-border-base)] mb-4 sm:mb-5 md:mb-6"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Nuestra Historia
            </h3>
            <p
              className="text-lg md:text-xl text-[var(--color-contrast-base)] leading-relaxed"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Nacimos de la pasión por la impresión 3D y el deseo de crear
              figuras únicas que combinen calidad, creatividad y sostenibilidad.
              Cada proyecto es una oportunidad de innovar y superar
              expectativas.
            </p>
            <p
              className="text-lg md:text-xl text-[var(--color-contrast-base)] leading-relaxed"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Nuestro diferencial está en la atención personalizada, materiales
              ecológicos y la capacidad de personalizar cada diseño según tus
              necesidades.
            </p>
          </div>
          <div className="space-y-4 md:space-y-6">
            <h3
              className="text-2xl md:text-3xl font-bold text-[var(--color-border-base)] mb-4 sm:mb-5 md:mb-6"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Por qué elegirnos
            </h3>
            <WhyChooseUs />
          </div>
        </motion.div>

        {/* Mini-stats / badges */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <StatsGrid />
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
