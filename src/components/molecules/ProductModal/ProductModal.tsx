import { Modal } from "@/components";
import ProductForm from "@/components/molecules/ProductForm";
import { Product } from "@/types";

interface ProductModalProps {
  mode: "create" | "edit";
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

const ProductModal = ({
  mode,
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductModalProps) => {
  if (mode === "edit" && !product) {
    return null;
  }

  const isCreateMode = mode === "create";
  const titleId = isCreateMode ? "create-product-title" : "edit-product-title";
  const title = isCreateMode ? "Crear nuevo producto" : "Editar producto";
  const description = isCreateMode
    ? "Completa todos los campos para agregar un nuevo producto al catálogo."
    : `Actualiza la información de ${product?.name} sin perder el estilo original.`;
  const closeAriaLabel = isCreateMode ? "Cerrar formulario" : "Cerrar editor";

  const handleSuccess = (updatedProduct: Product) => {
    onSuccess(updatedProduct);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      maxWidth="2xl"
      showScrollbar={true}
    >
      <div className="relative flex flex-col">
        <div className="flex-shrink-0 p-4 sm:p-6 md:p-8 pb-4">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)] z-10"
            aria-label={closeAriaLabel}
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>

          <div className="pr-10">
            <h3
              id={titleId}
              className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)] mb-2"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              {title}
            </h3>
            <p
              className="text-base text-[var(--color-border-base)]/80"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {description}
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
          <ProductForm
            mode={mode}
            initialProduct={product || undefined}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
