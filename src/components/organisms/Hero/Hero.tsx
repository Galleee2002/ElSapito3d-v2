import { motion } from "framer-motion";
import { CtaGroup, Bubble, Star, WaveDivider } from "@/components";
import type { WaveDividerProps } from "@/components";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils";

interface HeroProps {
  showWave?: boolean;
  waveProps?: WaveDividerProps;
}

const Hero = ({ showWave = true, waveProps }: HeroProps = {}) => {
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: (["small", "medium", "large"] as const)[i % 3],
    delay: i * 0.8,
    left: `${10 + ((i * 12) % 80)}%`,
    top: `${20 + ((i * 15) % 60)}%`,
  }));

  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: (["small", "medium", "large"] as const)[i % 3],
    delay: i * 0.5,
    left: `${5 + ((i * 8) % 90)}%`,
    top: `${10 + ((i * 10) % 80)}%`,
  }));

  return (
    <section
      className={cn(
        "relative min-h-[90vh] flex items-center justify-center",
        "py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-6 overflow-hidden"
      )}
      style={{
        background: `radial-gradient(circle at center, var(--color-frog-green) 0%, var(--color-frog-green) 50%, var(--color-border-blue) 100%)`,
      }}
    >
      {/* Decoraciones: Burbujas */}
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          size={bubble.size}
          delay={bubble.delay}
          left={bubble.left}
          top={bubble.top}
        />
      ))}

      {/* Decoraciones: Estrellas */}
      {stars.map((star) => (
        <Star
          key={star.id}
          size={star.size}
          delay={star.delay}
          left={star.left}
          top={star.top}
        />
      ))}

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
        {/* Sapito animado */}
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -15, 0],
          }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 0.8, type: "spring", stiffness: 200 },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          style={{
            filter: "drop-shadow(0 0 25px var(--color-bouncy-lemon))",
          }}
        >
          <img
            src={logo}
            alt="El Sapito 3D"
            className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain"
          />
        </motion.div>

        {/* Título */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 text-[var(--color-contrast-base)]"
          style={{ fontFamily: "var(--font-baloo)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          ¡Bienvenido al Mundo del Sapito 3D!
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-9 md:mb-10 text-[var(--color-contrast-base)]/90 max-w-2xl"
          style={{ fontFamily: "var(--font-nunito)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Descubre un universo de impresión 3D lleno de creatividad, diversión y
          personajes únicos
        </motion.h2>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <CtaGroup
            onPrimaryClick={() => {
              console.log("¡Croa ahora!");
            }}
            onSecondaryClick={() => {
              console.log("Ver galería 3D");
            }}
          />
        </motion.div>
      </div>

      {showWave && (
        <WaveDivider
          position={waveProps?.position || "bottom"}
          height={waveProps?.height || 80}
          className={waveProps?.className}
          colorClass={waveProps?.colorClass || "text-[#F5FAFF]"}
          flipX={waveProps?.flipX}
          flipY={waveProps?.flipY}
          gradient={waveProps?.gradient}
        />
      )}
    </section>
  );
};

export default Hero;
