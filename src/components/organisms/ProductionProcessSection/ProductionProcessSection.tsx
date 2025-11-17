import { motion } from "framer-motion";
import { cn } from "@/utils";

interface ProductionProcessSectionProps {
  className?: string;
}

interface ProcessStep {
  title: string;
  subtitle?: string;
  description: string;
}

interface PurchaseStep {
  stepNumber: number;
  title: string;
  description: string;
}

const ProductionProcessSection = ({
  className,
}: ProductionProcessSectionProps) => {
  const productionSteps: ProcessStep[] = [
    {
      title: "Diseño y preparación del modelo",
      subtitle: "Creación digital",
      description:
        "Comenzamos con el diseño 3D del modelo, preparando cada detalle para garantizar la mejor calidad de impresión y optimizando la geometría.",
    },
    {
      title: "Configuración de la impresora",
      subtitle: "Ajustes precisos",
      description:
        "Calibramos la impresora 3D con los parámetros específicos: temperatura, velocidad, material y resolución óptima para cada proyecto.",
    },
    {
      title: "Impresión en 3D",
      subtitle: "Fabricación capa por capa",
      description:
        "La impresora construye el objeto capa por capa con precisión milimétrica, materializando el diseño digital en un producto físico.",
    },
    {
      title: "Post-procesado",
      subtitle: "Acabados profesionales",
      description:
        "Retiramos soportes, lijamos imperfecciones y aplicamos tratamientos de acabado para lograr una superficie impecable.",
    },
    {
      title: "Control de calidad",
      subtitle: "Revisión final",
      description:
        "Inspeccionamos cada pieza para asegurar que cumple nuestros estándares de calidad antes de entregar el producto final.",
    },
  ];

  const purchaseSteps: PurchaseStep[] = [
    {
      stepNumber: 1,
      title: "Crearse una cuenta",
      description:
        "Regístrate en nuestra plataforma para comenzar tu experiencia de compra.",
    },
    {
      stepNumber: 2,
      title: "Elegir el producto que quieras",
      description:
        "Explora nuestro catálogo y selecciona el diseño que más te guste.",
    },
    {
      stepNumber: 3,
      title: "Añadirlo al carrito",
      description:
        "Agrega los productos seleccionados a tu carrito de compras.",
    },
    {
      stepNumber: 4,
      title: "Realizar el pago",
      description:
        "Completa la transacción de forma segura con nuestro sistema de pago.",
    },
    {
      stepNumber: 5,
      title: "Coordinar el envío",
      description:
        "Ponte en contacto por email al finalizar la compra para coordinar la entrega de tu pedido.",
    },
  ];

  return (
    <section
      className={cn(
        "relative py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-6 bg-white bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='199' viewBox='0 0 100 199'%3E%3Cg fill='%23475467' fill-opacity='0.4'%3E%3Cpath d='M0 199V0h1v1.99L100 199h-1.12L1 4.22V199H0zM100 2h-.12l-1-2H100v2z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E\")]",
        className
      )}
      id="proceso-produccion"
    >
      <div className="max-w-6xl mx-auto">
        {/* Encabezado Principal */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-contrast-base mb-4"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Nuestro proceso de producción
          </h2>
          <p
            className="text-xl md:text-2xl text-contrast-base max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Cada producto pasa por un riguroso proceso para garantizar la más
            alta calidad en impresión 3D.
          </p>
        </motion.div>

        {/* Timeline del Proceso de Impresión 3D */}
        <div className="mb-20">
          <div className="flex flex-col">
            {productionSteps.map((step, index) => {
              const isLastStep = index === productionSteps.length - 1;

              return (
                <motion.div
                  key={index}
                  className="flex items-start gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  <div
                    className="flex flex-col items-center self-stretch"
                    aria-hidden="true"
                  >
                    <div className="size-6 md:size-8 rounded-full bg-frog-green border-4 border-white"></div>
                    {!isLastStep && (
                      <div className="w-[3px] flex-1 bg-frog-green"></div>
                    )}
                  </div>

                  <div className={cn("space-y-2", !isLastStep && "pb-8")}>
                    {step.subtitle && (
                      <span
                        className="inline-flex items-center rounded-full border border-frog-green/30 bg-white/80 px-3 py-1 text-xs md:text-sm font-semibold uppercase tracking-wide text-frog-green shadow-sm"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {step.subtitle}
                      </span>
                    )}
                    <h3
                      className="text-2xl md:text-3xl font-bold text-border-base"
                      style={{ fontFamily: "var(--font-baloo)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-lg md:text-xl text-contrast-base leading-relaxed"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sección de Pasos de Compra */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-border-base mb-4"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Cómo comprar en nuestra tienda
            </h2>
            <p
              className="text-lg md:text-xl text-contrast-base max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Sigue estos sencillos pasos para adquirir tus productos de
              impresión 3D.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchaseSteps.map((step, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div
                  className="w-12 h-12 rounded-full bg-frog-green flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <span
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-baloo)" }}
                  >
                    {step.stepNumber}
                  </span>
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold text-border-base mb-3"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base md:text-lg text-contrast-base leading-relaxed"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductionProcessSection;
