import ProductModal from "../ProductModal";
import { Product } from "@/types";

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
  return (
    <ProductModal
      mode="edit"
      product={product}
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default ProductEditModal;
