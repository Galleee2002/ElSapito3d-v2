import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import { TableCell, StatusBadge } from "@/components";
import { cn } from "@/utils";
import { hoverVariants, motionVariants } from "@/constants";
import type { Payment } from "@/types";

interface PaymentRowProps {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
}

const paymentMethodLabels: Record<string, string> = {
  mercado_pago: "Mercado Pago",
  tarjeta_credito: "Tarjeta Crédito",
  tarjeta_debito: "Tarjeta Débito",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  otro: "Otro",
};

const statusColors: Record<string, string> = {
  aprobado: "bg-green-100 text-green-700 border-green-300",
  pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  rechazado: "bg-red-100 text-red-700 border-red-300",
  cancelado: "bg-gray-100 text-gray-700 border-gray-300",
  reembolsado: "bg-blue-100 text-blue-700 border-blue-300",
};

const statusLabels: Record<string, string> = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
};

const PaymentRow = ({ payment, onViewDetails }: PaymentRowProps) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionVariants.spring}
      className={cn(
        "border-b border-gray-200",
        "hover:bg-gray-50",
        "transition-colors duration-200"
      )}
    >
      <TableCell className="font-mono text-xs text-gray-500">
        {payment.id.slice(0, 8)}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-semibold text-[var(--color-contrast-base)] text-xs sm:text-sm">
            {payment.customer_name}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
            {payment.customer_email}
          </p>
        </div>
      </TableCell>
      <TableCell className="font-bold text-[var(--color-frog-green)] whitespace-nowrap">
        {formatAmount(payment.amount)}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {paymentMethodLabels[payment.payment_method]}
      </TableCell>
      <TableCell>
        <StatusBadge
          label={statusLabels[payment.payment_status]}
          className={cn(
            "text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap",
            statusColors[payment.payment_status]
          )}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(payment.payment_date)}
      </TableCell>
      <TableCell className="hidden lg:table-cell font-mono text-xs text-gray-500">
        {payment.order_id ? payment.order_id.slice(0, 8) : "—"}
      </TableCell>
      <TableCell align="center">
        <motion.button
          type="button"
          onClick={() => onViewDetails(payment)}
          whileHover={hoverVariants.scale}
          whileTap={{ scale: 0.95 }}
          transition={motionVariants.spring}
          className={cn(
            "p-1.5 sm:p-2 rounded-lg",
            "bg-[var(--color-border-blue)]",
            "hover:bg-[var(--color-frog-green)]",
            "text-white",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-frog-green)] focus:ring-offset-2"
          )}
          aria-label="Ver detalles"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </motion.button>
      </TableCell>
    </motion.tr>
  );
};

export default PaymentRow;

