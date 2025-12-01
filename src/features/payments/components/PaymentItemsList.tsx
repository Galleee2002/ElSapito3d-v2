import { PaymentItemMetadata } from "../types/payment.domain";
import { calculateItemTotals } from "../utils/paymentCalculations";
import { SectionCard } from "@/components/ui/SectionCard";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/utils/cn";

interface PaymentItemsListProps {
  items: PaymentItemMetadata[];
}

export const PaymentItemsList = ({ items }: PaymentItemsListProps) => {
  if (!items || items.length === 0) return null;

  return (
    <SectionCard title="Productos Comprados" className="mb-4">
      <div className="space-y-4">
        {items.map((item, index) => (
          <PaymentItemRow key={item.id || index} item={item} />
        ))}
      </div>
    </SectionCard>
  );
};

const PaymentItemRow = ({ item }: { item: PaymentItemMetadata }) => {
  const totals = calculateItemTotals(item);
  const { 
    quantity, 
    title, 
    unit_price, 
    selectedColors = [], 
    colorQuantities = [],
    selectedSections = [],
    selectedAccessories = [] 
  } = item;

  return (
    <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
      {/* Header Row */}
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 line-clamp-2">
            {title || "Producto sin nombre"}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
             <span>Cant: <strong className="text-gray-700">{quantity}</strong></span>
             {unit_price > 0 && (
               <span>Unit: <strong className="text-gray-700">{formatCurrency(unit_price)}</strong></span>
             )}
          </div>
        </div>
        <div className="text-right">
           <p className="text-sm font-bold text-[var(--color-frog-green)]">
             {formatCurrency(totals.hasAccessoriesPrice ? totals.totalWithAccessories : totals.baseSubtotal)}
           </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-3 mt-3 pt-3 border-t border-gray-200/60">
        
        {/* Sections */}
        {selectedSections.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Colores por Sección</p>
            <div className="space-y-1.5">
              {selectedSections.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                   <span className="w-20 font-medium text-gray-600 truncate">{s.sectionLabel}:</span>
                   <ColorBadge color={s.colorCode} name={s.colorName} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Colors (if no sections) */}
        {selectedSections.length === 0 && (colorQuantities.length > 0 || selectedColors.length > 0) && (
           <div>
             <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Colores</p>
             <div className="flex flex-wrap gap-2">
               {colorQuantities.length > 0 ? (
                 colorQuantities.map((cq, idx) => (
                   <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                     <ColorBadge color={cq.color.code} name={cq.color.name} />
                     <span className="text-xs text-gray-600 font-medium">x{cq.quantity}</span>
                   </div>
                 ))
               ) : (
                 selectedColors.map((c, idx) => {
                   const colorQty = Math.floor(quantity / selectedColors.length) + 
                     (idx < quantity % selectedColors.length ? 1 : 0);
                   return (
                     <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                       <ColorBadge color={c.code} name={c.name} />
                       <span className="text-xs text-gray-600 font-medium">x{colorQty}</span>
                     </div>
                   );
                 })
               )}
             </div>
           </div>
        )}

        {/* Accessories */}
        {selectedAccessories.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Accesorios</p>
            <div className="space-y-1.5 pl-1">
              {selectedAccessories.map((acc, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-white px-2 py-1.5 rounded border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{acc.name}</span>
                    {acc.color && <ColorBadge color={acc.color.code} name={acc.color.name} size="sm" />}
                    <span className="text-gray-400">x{acc.quantity}</span>
                  </div>
                  {(acc.price ?? 0) > 0 && (
                    <span className="text-gray-500 font-mono">
                      {formatCurrency((acc.price ?? 0) * acc.quantity)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ColorBadge = ({ color, name, size = "md" }: { color: string, name: string, size?: "sm" | "md" }) => (
  <div className="flex items-center gap-1.5" title={name}>
    <div 
      className={cn(
        "rounded-full border border-gray-200 shadow-sm",
        size === "sm" ? "w-3 h-3" : "w-4 h-4"
      )} 
      style={{ backgroundColor: color }} 
    />
    <span className={cn("text-gray-600 truncate max-w-[100px]", size === "sm" ? "text-[10px]" : "text-xs")}>
      {name}
    </span>
  </div>
);

