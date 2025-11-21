import ProductModal from "../ProductModal";

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ProductCreateModalProps) => {
  return (
    <ProductModal
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={() => {
        onSuccess();
      }}
    />
  );
};

export default ProductCreateModal;
