import { CreditCard, Calendar, MapPin, FileText } from "lucide-react";
import { Payment } from "../types/payment.domain";
import { SectionCard, InfoRow } from "@/components/ui";
import { formatDate } from "@/utils/formatters";
import { PAYMENT_METHOD_LABELS } from "@/constants";
import { getDeliveryMethodDisplay } from "@/utils"; 

interface PaymentInfoSectionProps {
  payment: Payment;
}

export const PaymentInfoSection = ({ payment }: PaymentInfoSectionProps) => {
  return (
    <SectionCard title="Información del Pago" className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow
          icon={<CreditCard className="w-4 h-4" />}
          label="Método de Pago"
          value={PAYMENT_METHOD_LABELS[payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || payment.payment_method}
        />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Fecha"
          value={formatDate(payment.payment_date)}
        />
        {payment.metadata?.delivery_method && (
          <InfoRow
            icon={<MapPin className="w-4 h-4" />}
            label="Método de Entrega"
            value={getDeliveryMethodDisplay(payment.metadata as any)}
          />
        )}
        <InfoRow
          icon={<FileText className="w-4 h-4" />}
          label="ID del Pago"
          value={payment.id.slice(0, 12) + "..."}
          className="sm:col-span-2"
        />
        {payment.mp_payment_id && (
          <InfoRow
            icon={<FileText className="w-4 h-4" />}
            label="ID Mercado Pago"
            value={payment.mp_payment_id}
            className="sm:col-span-2"
          />
        )}
      </div>
    </SectionCard>
  );
};

