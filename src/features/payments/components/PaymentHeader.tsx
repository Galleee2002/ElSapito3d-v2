import { CheckCircle2, Trash2 } from "lucide-react";
import { Payment } from "../types/payment.domain";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/atoms/Button"; 
import Spinner from "@/components/atoms/Spinner";
import { formatCurrency } from "@/utils/formatters";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/constants";
import { cn } from "@/utils/cn";

interface PaymentHeaderProps {
  payment: Payment;
  onApprove: () => void;
  onDelete: () => void;
  isApproving: boolean;
  isDeleting: boolean;
  isAdmin: boolean;
}

export const PaymentHeader = ({
  payment,
  onApprove,
  onDelete,
  isApproving,
  isDeleting,
  isAdmin,
}: PaymentHeaderProps) => {
  // Safe cast for status keys since we're using string types from domain
  const canApprove = isAdmin && payment.payment_status === "pendiente";
  const statusKey = payment.payment_status as keyof typeof PAYMENT_STATUS_LABELS;
  const statusColor = PAYMENT_STATUS_COLORS[statusKey] || "text-gray-500 border-gray-200";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
      <div>
        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Monto Total</p>
        <p className="text-3xl font-bold text-[var(--color-frog-green)] font-baloo">
          {formatCurrency(payment.amount)}
        </p>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        <Badge 
          className={cn("px-3 py-1.5 text-sm", statusColor)}
        >
          {PAYMENT_STATUS_LABELS[statusKey] || payment.payment_status}
        </Badge>

        {canApprove && (
          <Button
            onClick={onApprove}
            disabled={isApproving || isDeleting}
            className="text-sm px-4 py-2 h-9"
          >
            {isApproving ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Aprobando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprobar
              </>
            )}
          </Button>
        )}

        {isAdmin && (
          <Button
            variant="secondary"
            onClick={onDelete}
            disabled={isDeleting || isApproving}
            className="text-sm px-4 py-2 h-9 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

