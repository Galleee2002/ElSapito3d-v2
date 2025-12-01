import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button, PaymentStatusPage, ApprovedPaymentModal } from "@/components";
import { navigateTo, NAVIGATION_PATHS } from "@/utils";

const PaymentSuccessPage = () => {
  const [showInstagramModal, setShowInstagramModal] = useState(true);

  return (
    <>
      <PaymentStatusPage
        icon={
          <CheckCircle className="w-16 h-16 icon-success" strokeWidth={2} />
        }
        title="¡Pago Aprobado!"
        message="Tu pago ha sido procesado exitosamente. Te hemos enviado un email con los detalles de tu compra."
        iconBgColor="rgba(34, 197, 94, 0.15)"
        iconBorderColor="#22c55e"
        iconColor="#22c55e"
        additionalContent={
          <p
            className="text-base text-text-muted mb-6"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Para coordinar el envío, escríbenos por Instagram.
          </p>
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigateTo(NAVIGATION_PATHS.HOME)}
            >
              Volver al inicio
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigateTo(NAVIGATION_PATHS.PRODUCTS)}
            >
              Ver más productos
            </Button>
          </>
        }
      />
      <ApprovedPaymentModal
        isOpen={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
      />
    </>
  );
};

export default PaymentSuccessPage;
