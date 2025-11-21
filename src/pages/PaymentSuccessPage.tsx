import { useEffect } from "react";
import { CheckCircle, Mail } from "lucide-react";
import { Button, PaymentStatusPage } from "@/components";
import { openGmail } from "@/utils";

const GMAIL_CONFIG = {
  subject: "Coordinación de envío - Pedido completado",
  body: "Hola,\n\nHe completado mi pedido y me gustaría coordinar el envío.\n\nGracias.",
};

const PaymentSuccessPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      openGmail(GMAIL_CONFIG);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenGmail = () => {
    openGmail(GMAIL_CONFIG);
  };

  return (
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
          Se abrirá Gmail automáticamente para que puedas coordinar el envío con
          nosotros.
        </p>
      }
      actions={
        <>
          <Button onClick={handleOpenGmail} className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Abrir Gmail
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/")}
          >
            Volver al inicio
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/productos")}
          >
            Ver más productos
          </Button>
        </>
      }
    />
  );
};

export default PaymentSuccessPage;
