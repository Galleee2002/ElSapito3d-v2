import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CtaGroup, Bubble, Star, WaveDivider } from "@/components";
import type { WaveDividerProps } from "@/components";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils";

interface HeroProps {
  showWave?: boolean;
  waveProps?: WaveDividerProps;
}

const Hero = ({ showWave = true, waveProps }: HeroProps = {}) => {
  const shouldReduceMotion = useReducedMotion();

  const topPadding = "clamp(6rem, 16vw, 9rem)";
  const bottomPadding = "clamp(3rem, 12vw, 5rem)";
  const horizontalPadding = "clamp(1.5rem, 5vw, 3.5rem)";
  const waveHeight = waveProps?.height ?? 80;
  const waveOffset = waveProps?.offsetY ?? 0;
  const additionalBottomSpace = waveHeight + waveOffset;

  const heroStyle: CSSProperties = {
    background:
      "radial-gradient(circle at center, var(--color-frog-green) 0%, var(--color-frog-green) 50%, var(--color-border-blue) 100%)",
    paddingTop: topPadding,
    paddingBottom: `calc(${bottomPadding} + ${additionalBottomSpace}px)`,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    minHeight: "100dvh",
    scrollMarginTop: topPadding,
  };

  const bubbles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: (["small", "medium", "large"] as const)[i % 3],
    delay: i * 1.2,
    left: `${10 + ((i * 15) % 80)}%`,
    top: `${20 + ((i * 18) % 60)}%`,
  }));

  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: (["small", "medium", "large"] as const)[i % 3],
    delay: i * 0.8,
    left: `${5 + ((i * 12) % 90)}%`,
    top: `${10 + ((i * 12) % 80)}%`,
  }));

  return (
    <section
      id="inicio"
      className={cn(
        "relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden"
      )}
      style={heroStyle}
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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.6, ease: "easeOut" },
            scale: {
              duration: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 20,
            },
          }}
          style={{
            filter: "drop-shadow(0 0 25px var(--color-bouncy-lemon))",
            willChange: "transform",
          }}
        >
          <motion.img
            src={logo}
            alt="El Sapito 3D"
            className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -12, 0],
                  }
            }
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{
              willChange: "transform",
            }}
          />
        </motion.div>

        {/* Título */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 text-[var(--color-contrast-base)]"
          style={{ fontFamily: "var(--font-baloo)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          ¡Bienvenido al Mundo del Sapito 3D!
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-9 md:mb-10 text-[var(--color-contrast-base)]/90 max-w-2xl"
          style={{ fontFamily: "var(--font-nunito)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        >
          Descubre un universo de impresión 3D lleno de creatividad, diversión y
          personajes únicos
        </motion.h2>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        >
          <CtaGroup onPrimaryClick={() => {}} onSecondaryClick={() => {}} />
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
