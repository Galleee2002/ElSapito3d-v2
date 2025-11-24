import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

interface ProductionProcessSectionProps {
  className?: string;
}

interface PurchaseStep {
  stepNumber: number;
  title: string;
  description: string;
}

const ProductionProcessSection = ({
  className,
}: ProductionProcessSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const purchaseSteps: PurchaseStep[] = [
    {
      stepNumber: 1,
      title: "Crearse una cuenta",
      description:
        "Regístrate en nuestra plataforma para comenzar tu experiencia de compra. Es rápido, fácil y seguro.",
    },
    {
      stepNumber: 2,
      title: "Elegir el producto que quieras",
      description:
        "Explora nuestro catálogo completo y selecciona el diseño que más te guste. Tenemos una amplia variedad de productos únicos impresos en 3D.",
    },
    {
      stepNumber: 3,
      title: "Añadirlo al carrito",
      description:
        "Agrega los productos seleccionados a tu carrito de compras. Puedes revisar y modificar tu selección antes de finalizar.",
    },
    {
      stepNumber: 4,
      title: "Realizar el pago",
      description:
        "Completa la transacción de forma segura con nuestro sistema de pago integrado. Aceptamos múltiples métodos de pago.",
    },
    {
      stepNumber: 5,
      title: "Coordinar el envío",
      description:
        "Ponte en contacto por email al finalizar la compra para coordinar la entrega de tu pedido. Te ayudaremos con todo el proceso.",
    },
  ];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % purchaseSteps.length);
  }, [purchaseSteps.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + purchaseSteps.length) % purchaseSteps.length
    );
  }, [purchaseSteps.length]);

  const goToStep = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <section
      className={cn(
        "relative py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-6 bg-white bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='199' viewBox='0 0 100 199'%3E%3Cg fill='%23475467' fill-opacity='0.4'%3E%3Cpath d='M0 199V0h1v1.99L100 199h-1.12L1 4.22V199H0zM100 2h-.12l-1-2H100v2z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E\")]",
        className
      )}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-border-base mb-4 sm:mb-6 font-baloo">
              Cómo comprar en nuestra tienda
            </h2>
            <p
              className="text-lg sm:text-xl md:text-2xl text-contrast-base max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Sigue estos sencillos pasos para adquirir tus productos de
              impresión 3D.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5,
                  }}
                  className="bg-white rounded-2xl p-8 sm:p-4 md:p-12 lg:p-6 shadow-xl"
                >
                  <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-frog-green flex items-center justify-center mb-6 sm:mb-8 shadow-lg"
                      aria-hidden="true"
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-baloo">
                        {purchaseSteps[currentIndex].stepNumber}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-border-base mb-4 sm:mb-6 font-baloo">
                      {purchaseSteps[currentIndex].title}
                    </h3>
                    <p
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-contrast-base leading-relaxed max-w-2xl"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      {purchaseSteps[currentIndex].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Paso anterior"
              className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-frog-green hover:bg-frog-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Siguiente paso"
              className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-frog-green hover:bg-frog-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </button>
          </div>

          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-10">
            {purchaseSteps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToStep(index)}
                aria-label={`Ir al paso ${index + 1}`}
                className={cn(
                  "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2",
                  index === currentIndex
                    ? "bg-frog-green w-8 sm:w-10"
                    : "bg-frog-green/30 hover:bg-frog-green/50"
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductionProcessSection;
