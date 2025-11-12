import { FilterSelect, Button } from "@/components";
import type { PaymentStatus } from "@/types";

interface PaymentFiltersProps {
  statusFilter: PaymentStatus | "all";
  onStatusChange: (status: PaymentStatus | "all") => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "aprobado", label: "Aprobado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "rechazado", label: "Rechazado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "reembolsado", label: "Reembolsado" },
];

const PaymentFilters = ({
  statusFilter,
  onStatusChange,
  onReset,
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
      <div className="flex-1 w-full sm:w-auto sm:min-w-[200px]">
        <FilterSelect
          label="Estado"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusChange as (value: string) => void}
        />
      </div>
      <Button
        variant="secondary"
        onClick={onReset}
        className="text-xs sm:text-sm py-2 px-4 whitespace-nowrap"
      >
        Limpiar
      </Button>
    </div>
  );
};

export default PaymentFilters;

