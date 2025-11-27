import { User, Mail, Phone, MapPin } from "lucide-react";
import { Payment } from "../types/payment.domain";
import { SectionCard, InfoRow } from "@/components/ui";

interface CustomerInfoSectionProps {
  payment: Payment;
}

export const CustomerInfoSection = ({ payment }: CustomerInfoSectionProps) => {
  return (
    <SectionCard title="Información del Cliente" className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Nombre"
          value={payment.customer_name}
        />
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          value={payment.customer_email}
        />
        {payment.customer_phone && (
          <InfoRow
            icon={<Phone className="w-4 h-4" />}
            label="Teléfono"
            value={payment.customer_phone}
          />
        )}
        {payment.customer_address && (
          <InfoRow
            icon={<MapPin className="w-4 h-4" />}
            label="Dirección"
            value={payment.customer_address}
            className="sm:col-span-2"
          />
        )}
      </div>
    </SectionCard>
  );
};

