import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { cn, formatCurrency } from "@/utils";
import type { CurrentMonthStatistics } from "@/types";

interface CurrentMonthSummaryProps {
  statistics: CurrentMonthStatistics | null;
}

const CurrentMonthSummary = ({ statistics }: CurrentMonthSummaryProps) => {
  if (!statistics) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div
        className={cn(
          "p-3 sm:p-4 rounded-xl",
          "bg-white/60 backdrop-blur-md",
          "border-2 border-[var(--color-border-base)]"
        )}
      >
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <span className="text-xs sm:text-sm font-semibold text-black">
            Total Mes Actual
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-black">
          {formatCurrency(statistics.total_amount)}
        </p>
        <p className="text-[10px] sm:text-xs text-black/80 mt-1">
          {statistics.approved_count} pago(s) aprobado(s)
        </p>
      </div>

      <div
        className={cn(
          "p-3 sm:p-4 rounded-xl",
          "bg-white/60 backdrop-blur-md",
          "border-2 border-[var(--color-border-base)]"
        )}
      >
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <span className="text-xs sm:text-sm font-semibold text-black">
            Aprobados
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-black">
          {statistics.approved_count}
        </p>
        <p className="text-[10px] sm:text-xs text-black/80 mt-1">
          este mes
        </p>
      </div>

      <div
        className={cn(
          "p-3 sm:p-4 rounded-xl col-span-2 lg:col-span-1",
          "bg-white/60 backdrop-blur-md",
          "border-2 border-[var(--color-border-base)]"
        )}
      >
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <span className="text-xs sm:text-sm font-semibold text-black">
            Pendientes
          </span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-black">
          {statistics.pending_count}
        </p>
        <p className="text-[10px] sm:text-xs text-black/80 mt-1">
          {formatCurrency(statistics.pending_amount)}
        </p>
      </div>
    </div>
  );
};

export default CurrentMonthSummary;

