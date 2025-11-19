import { Modal } from "@/components";
import { Product } from "@/types";
import ProductForm from "@/components/molecules/ProductForm";

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

const ProductEditModal = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductEditModalProps) => {
  if (!product) {
    return null;
  }

  const handleSuccess = (updatedProduct: Product) => {
    onSuccess(updatedProduct);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="edit-product-title"
      maxWidth="2xl"
    >
      <div className="relative flex flex-col max-h-[calc(100vh-2rem)]">
        <div className="flex-shrink-0 p-4 sm:p-6 md:p-8 pb-4">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--color-border-base)] text-[var(--color-border-base)] transition-colors z-10 bg-[var(--color-border-base)] hover:bg-[var(--color-border-base)]/90 focus:outline-none"
            aria-label="Cerrar editor"
          >
            <span className="text-xl font-bold text-white">×</span>
          </button>

          <div className="pr-10">
            <h3
              id="edit-product-title"
              className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)] mb-2"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Editar producto
            </h3>
            <p
              className="text-base text-[var(--color-border-base)]/80"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Actualiza la información de <strong>{product.name}</strong> sin
              perder el estilo original.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
          <ProductForm
            mode="edit"
            initialProduct={product}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProductEditModal;

