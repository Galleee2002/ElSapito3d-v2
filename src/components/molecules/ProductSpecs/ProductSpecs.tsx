import { cn } from "@/utils";
import { Package, Ruler, Clock } from "lucide-react";

interface ProductSpecsProps {
  material?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  productionTime?: string;
  className?: string;
}

const ProductSpecs = ({
  material,
  dimensions,
  productionTime,
  className,
}: ProductSpecsProps) => {
  const hasData = material || dimensions || productionTime;
  if (!hasData) return null;

  const dimensionString = dimensions
    ? `${dimensions.length || "-"} × ${dimensions.width || "-"} × ${dimensions.height || "-"} ${dimensions.unit || "cm"}`
    : null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {material && (
        <div className="flex items-center gap-2 text-sm">
          <Package size={16} className="text-[var(--color-text)] opacity-60 shrink-0" />
          <span className="text-[var(--color-text)] opacity-70">Material:</span>
          <span className="text-[var(--color-text)] font-medium">{material}</span>
        </div>
      )}

      {dimensionString && (
        <div className="flex items-center gap-2 text-sm">
          <Ruler size={16} className="text-[var(--color-text)] opacity-60 shrink-0" />
          <span className="text-[var(--color-text)] opacity-70">Medidas:</span>
          <span className="text-[var(--color-text)] font-medium">{dimensionString}</span>
        </div>
      )}

      {productionTime && (
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-[var(--color-text)] opacity-60 shrink-0" />
          <span className="text-[var(--color-text)] opacity-70">Tiempo de producción:</span>
          <span className="text-[var(--color-text)] font-medium">{productionTime}</span>
        </div>
      )}
    </div>
  );
};

export default ProductSpecs;

