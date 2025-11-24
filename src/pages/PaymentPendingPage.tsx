import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button, PaymentStatusPage } from "@/components";
import { paymentsService } from "@/services";
import { navigateTo, NAVIGATION_PATHS } from "@/utils";

const PaymentPendingPage = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

  useEffect(() => {
    const updatePaymentInfo = async () => {
      if (!externalReference || !paymentId) return;

      try {
        await paymentsService.updatePaymentStatusByExternalReference(
          externalReference,
          "pendiente",
          paymentId
        );
      } catch (error) {
        console.error("Error al actualizar información del pago:", error);
      }
    };

    void updatePaymentInfo();
  }, [externalReference, paymentId]);

  return (
    <PaymentStatusPage
      icon={<Clock className="w-16 h-16" />}
      title="Pago Pendiente"
      message="Tu pago está siendo procesado. Te notificaremos por email una vez que sea confirmado."
      iconBgColor="rgba(59, 130, 246, 0.15)"
      iconBorderColor="#3b82f6"
      iconColor="#3b82f6"
      actions={
        <>
          <Button onClick={() => navigateTo(NAVIGATION_PATHS.HOME)}>
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
  );
};

export default PaymentPendingPage;
