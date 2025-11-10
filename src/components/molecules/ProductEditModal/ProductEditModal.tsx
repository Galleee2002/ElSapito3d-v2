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
      <div className="relative p-4 sm:p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--color-border-blue)] text-[var(--color-border-blue)] transition-colors z-10 bg-[var(--color-border-blue)] hover:bg-[var(--color-border-blue)]/90 focus:outline-none"
          aria-label="Cerrar editor"
        >
          <span className="text-xl font-bold text-white">×</span>
        </button>

        <div className="space-y-6 pr-0 sm:pr-4">
          <div className="pr-10">
            <h3
              id="edit-product-title"
              className="text-2xl sm:text-3xl font-bold text-[var(--color-border-blue)] mb-2"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Editar producto
            </h3>
            <p
              className="text-base text-[var(--color-border-blue)]/80"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Actualiza la información de <strong>{product.name}</strong> sin
              perder el estilo original.
            </p>
          </div>

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

