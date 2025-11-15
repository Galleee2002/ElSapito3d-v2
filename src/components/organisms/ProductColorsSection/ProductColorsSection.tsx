import { useState } from "react";
import ColorChipsRow from "@/components/molecules/ColorChipsRow";
import { ProductColor } from "@/types";

interface ProductColorsSectionProps {
  productId: string;
  colors: ProductColor[];
  onColorChange?: (colorId: string) => void;
}

const ProductColorsSection = ({
  productId,
  colors,
  onColorChange,
}: ProductColorsSectionProps) => {
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(
    colors.find((c) => c.available !== false)?.id
  );

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);
    onColorChange?.(colorId);
  };

  const availableCount = colors.filter((c) => c.available !== false).length;

  return (
    <section className="w-full" aria-labelledby={`colors-${productId}`}>
      <ColorChipsRow
        colors={colors}
        selectedColorId={selectedColorId}
        onChange={handleColorChange}
        label="Colores disponibles"
      />

      <p className="text-xs text-gray-500 mt-3">
        {availableCount} {availableCount === 1 ? "color disponible" : "colores disponibles"}
      </p>
    </section>
  );
};

export default ProductColorsSection;

