import { Clock } from "lucide-react";
import { Payment } from "../types/payment.domain";
import { Badge } from "@/components/ui/Badge";
import { SectionCard } from "@/components/ui/SectionCard";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/constants";
import { cn } from "@/utils/cn";
import { useState } from "react";

interface PaymentHistoryTimelineProps {
  history: Payment[];
  isLoading: boolean;
}

export const PaymentHistoryTimeline = ({ history, isLoading }: PaymentHistoryTimelineProps) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const HISTORY_PREVIEW_LIMIT = 3;
  
  if (isLoading) {
    return (
      <SectionCard title="Historial de Compras">
         <div className="flex justify-center py-4 text-gray-500">Cargando historial...</div>
      </SectionCard>
    );
  }

  if (!history.length) {
     return (
      <SectionCard title="Historial de Compras">
         <p className="text-sm text-gray-500 text-center py-2">No hay compras anteriores</p>
      </SectionCard>
    );
  }

  const displayedHistory = showFullHistory ? history : history.slice(0, HISTORY_PREVIEW_LIMIT);
  const hasMore = history.length > HISTORY_PREVIEW_LIMIT;

  return (
    <SectionCard 
      title={`Historial de Compras (${history.length})`} 
      action={
        <Clock className="w-5 h-5 text-[var(--color-border-base)]" />
      }
      className="mb-4"
    >
      <div className="space-y-2">
        {displayedHistory.map((payment) => {
             const statusKey = payment.payment_status as keyof typeof PAYMENT_STATUS_LABELS;
             const statusColor = PAYMENT_STATUS_COLORS[statusKey] || "text-gray-500 border-gray-200";

             return (
              <div
                key={payment.id}
                className={cn(
                  "p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50",
                  "transition-colors duration-200"
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(payment.payment_date)}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs px-2 py-0.5 whitespace-nowrap",
                      statusColor
                    )}
                  >
                    {PAYMENT_STATUS_LABELS[statusKey] || payment.payment_status}
                  </Badge>
                </div>
              </div>
            );
        })}
      </div>
      
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowFullHistory(!showFullHistory)}
          className="mt-3 text-sm font-semibold text-[var(--color-frog-green)] hover:underline focus:outline-none w-full text-center cursor-pointer"
        >
          {showFullHistory ? "Ver menos" : `Ver ${history.length - HISTORY_PREVIEW_LIMIT} más`}
        </button>
      )}
    </SectionCard>
  );
};

