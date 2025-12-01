import { X, Instagram } from "lucide-react";
import { Modal, Button } from "@/components";

interface ApprovedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INSTAGRAM_URL = "https://www.instagram.com/elsapito.3d/";

const ApprovedPaymentModal = ({
  isOpen,
  onClose,
}: ApprovedPaymentModalProps) => {
  const handleInstagramClick = () => {
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      ariaLabelledBy="approved-payment-modal-title"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="approved-payment-modal-title"
            className="text-2xl sm:text-3xl font-bold text-text-main font-baloo"
          >
            ¡Compra Completada!
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p
              className="text-base sm:text-lg text-text-main mb-2"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Tu compra ha sido registrada exitosamente.
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p
              className="text-base sm:text-lg text-text-main"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Para coordinar el envío de tu pedido, escríbenos por{" "}
              <span className="font-semibold">Instagram</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={handleInstagramClick}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Instagram className="w-5 h-5" />
            Ir a Instagram
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovedPaymentModal;

