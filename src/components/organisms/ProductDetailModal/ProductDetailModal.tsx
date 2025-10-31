import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImageSlider } from "@/components/molecules";
import { ColorOption } from "@/components/atoms";
import { Truck, CreditCard, MessageCircle, X } from "lucide-react";
import type { Product } from "@/types";

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] || null
  );

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleContact = () => {
    window.open(`https://wa.me/1234567890?text=Hola, estoy interesado en ${product.name}`, "_blank");
  };

  const purchaseMethods = product.purchaseMethods || ["Transferencia", "Efectivo"];
  
  const shippingInfo = product.shipping || {
    available: true,
    cost: 0,
    estimatedDays: 7
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 z-[200] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden flex flex-col">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 shadow-lg ring-1 ring-black/5 transition-all duration-200 active:scale-95"
                aria-label="Cerrar modal"
              >
                <X size={16} className="text-[var(--color-text)]" />
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-y-auto hide-scrollbar">
                <div className="w-full md:w-1/2 md:h-full bg-gray-50">
                  <ProductImageSlider images={productImages} onClose={onClose} className="h-full" />
                </div>

                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 overflow-y-auto hide-scrollbar">
                  <h1 className="text-2xl sm:text-3xl mb-4 text-[var(--color-text)] font-[var(--font-heading)] font-bold">
                    {product.name}
                  </h1>

                  <div className="mb-5">
                    <span className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold mb-3 text-[var(--color-text)]">
                        Colores disponibles:
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {product.colors.map((color, index) => (
                          <ColorOption
                            key={index}
                            color={color}
                            isSelected={selectedColor === color}
                            onClick={() => setSelectedColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleContact}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4f8a3f] text-white rounded-[var(--radius-md)] text-sm font-semibold hover:bg-[#3a6b2f] transition-colors"
                    >
                      <MessageCircle size={18} />
                      Contactar
                    </button>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-start gap-3">
                      <CreditCard size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold mb-2 text-[var(--color-text)]">
                          Formas de compra:
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {purchaseMethods.map((method, index) => (
                            <li
                              key={index}
                              className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium"
                            >
                              {method}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-start gap-3">
                      <Truck size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold mb-2 text-[var(--color-text)]">
                          Envíos:
                        </p>
                        {shippingInfo.available ? (
                          <div className="space-y-1">
                            {shippingInfo.cost !== undefined && shippingInfo.cost > 0 && (
                              <p className="text-sm text-[var(--color-text)] opacity-70">
                                Costo: ${shippingInfo.cost.toLocaleString()}
                              </p>
                            )}
                            {shippingInfo.cost === 0 && (
                              <p className="text-sm text-[var(--color-primary)] font-medium">
                                Envío gratis
                              </p>
                            )}
                            {shippingInfo.estimatedDays && (
                              <p className="text-sm text-[var(--color-text)] opacity-70">
                                Tiempo estimado: {shippingInfo.estimatedDays} días
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--color-text)] opacity-70">
                            Sin envíos disponibles
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {product.fullDescription && (
                    <div>
                      <p className="text-sm font-semibold mb-2 text-[var(--color-text)]">
                        Descripción:
                      </p>
                      <p className="text-sm text-[var(--color-text)] opacity-80 leading-relaxed">
                        {product.fullDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;

