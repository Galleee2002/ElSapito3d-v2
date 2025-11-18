import { useState } from "react";
import ColorChipsRow from "@/components/molecules/ColorChipsRow";
import { ProductColor } from "@/types";

interface ProductColorsSectionProps {
  productId: string;
  colors: ProductColor[];
  onColorChange?: (colorId: string) => void;
  onColorsChange?: (colorIds: string[]) => void;
  multiple?: boolean;
}

const ProductColorsSection = ({
  productId,
  colors,
  onColorChange,
  onColorsChange,
  multiple = false,
}: ProductColorsSectionProps) => {
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(
    !multiple ? colors.find((c) => c.available !== false)?.id : undefined
  );
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);

  const handleColorChange = (colorId: string) => {
    if (multiple) {
      const newSelection = selectedColorIds.includes(colorId)
        ? selectedColorIds.filter((id) => id !== colorId)
        : [...selectedColorIds, colorId];
      setSelectedColorIds(newSelection);
      onColorsChange?.(newSelection);
    } else {
      setSelectedColorId(colorId);
      onColorChange?.(colorId);
    }
  };

  const availableCount = colors.filter((c) => c.available !== false).length;

  return (
    <section className="w-full" aria-labelledby={`colors-${productId}`}>
      <ColorChipsRow
        colors={colors}
        selectedColorId={selectedColorId}
        selectedColorIds={multiple ? selectedColorIds : undefined}
        onChange={handleColorChange}
        label="Colores disponibles"
        multiple={multiple}
      />

      <p className="text-xs text-gray-500 mt-3">
        {availableCount} {availableCount === 1 ? "color disponible" : "colores disponibles"}
      </p>
    </section>
  );
};

export default ProductColorsSection;

