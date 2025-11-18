import { useEffect } from "react";
import { CheckCircle, Mail } from "lucide-react";
import { Navbar, Button } from "@/components";
import { openGmail } from "@/utils";

const PaymentSuccessPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      openGmail({
        subject: "Coordinación de envío - Pedido completado",
        body: "Hola,\n\nHe completado mi pedido y me gustaría coordinar el envío.\n\nGracias.",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenGmail = () => {
    openGmail({
      subject: "Coordinación de envío - Pedido completado",
      body: "Hola,\n\nHe completado mi pedido y me gustaría coordinar el envío.\n\nGracias.",
    });
  };

  return (
    <div className="min-h-screen bg-bg text-text-main">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-5 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-3xl border border-border-base p-8 sm:p-10 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-full"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  border: "2px solid #22c55e",
                }}
              >
                <CheckCircle
                  className="w-16 h-16 icon-success"
                  strokeWidth={2}
                  style={{ color: "#22c55e" }}
                />
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold mb-4 text-success"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              ¡Pago Aprobado!
            </h1>

            <p
              className="text-lg text-text-muted mb-8"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Tu pago ha sido procesado exitosamente. Te hemos enviado un email
              con los detalles de tu compra.
            </p>

            <p
              className="text-base text-text-muted mb-6"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Se abrirá Gmail automáticamente para que puedas coordinar el envío
              con nosotros.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleOpenGmail}
                className="flex items-center gap-2"
              >
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
