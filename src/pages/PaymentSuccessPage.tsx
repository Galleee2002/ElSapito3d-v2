import { CheckCircle } from "lucide-react";
import { Navbar, Button } from "@/components";

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen bg-[#F5FAFF]">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-5 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border-2 border-[var(--color-border-blue)] p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-green-100 border-2 border-green-500">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold text-[var(--color-border-blue)] mb-4"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              ¡Pago Aprobado!
            </h1>

            <p
              className="text-lg text-[var(--color-border-blue)]/80 mb-8"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Tu pago ha sido procesado exitosamente. Te hemos enviado un email
              con los detalles de tu compra.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => (window.location.href = "/")}>
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

