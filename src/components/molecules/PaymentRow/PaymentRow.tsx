import { memo } from "react";
import { Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { TableCell, StatusBadge } from "@/components";
import { cn, formatCurrency, formatDate } from "@/utils";
import {
  hoverVariants,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/constants";
import { useAuth } from "@/hooks";
import type { Payment } from "@/types";

interface PaymentRowProps {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

const PaymentRow = memo(
  ({ payment, onViewDetails, onDelete }: PaymentRowProps) => {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin ?? false;

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(payment);
      }
    };

    return (
      <tr
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
            {payment.customer_instagram && (
              <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[150px] sm:max-w-[200px]">
                {payment.customer_instagram}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell className="font-bold text-[var(--color-frog-green)] whitespace-nowrap">
          {formatCurrency(payment.amount)}
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          {PAYMENT_METHOD_LABELS[payment.payment_method]}
        </TableCell>
        <TableCell>
          <StatusBadge
            label={PAYMENT_STATUS_LABELS[payment.payment_status]}
            className={cn(
              "text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap",
              PAYMENT_STATUS_COLORS[payment.payment_status]
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
          <div className="flex items-center justify-center gap-2">
            <motion.button
              type="button"
              onClick={() => onViewDetails(payment)}
              whileHover={hoverVariants.scale}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "tween", duration: 0.15 }}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg",
                "bg-[var(--color-border-base)]",
                "hover:bg-[var(--color-frog-green)]",
                "text-white",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-frog-green)] focus:ring-offset-2"
              )}
              aria-label="Ver detalles"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
            {isAdmin && onDelete && (
              <motion.button
                type="button"
                onClick={handleDelete}
                whileHover={hoverVariants.scale}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "tween", duration: 0.15 }}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg",
                  "bg-[var(--color-toad-eyes)]",
                  "hover:bg-[var(--color-toad-eyes)]/90",
                  "text-white",
                  "transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-toad-eyes)] focus:ring-offset-2"
                )}
                aria-label="Eliminar pago"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            )}
          </div>
        </TableCell>
      </tr>
    );
  }
);

PaymentRow.displayName = "PaymentRow";

export default PaymentRow;
