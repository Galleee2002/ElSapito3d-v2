import { useRef } from "react";
import ColorChip from "@/components/atoms/ColorChip";
import { ProductColor } from "@/types";

interface ColorChipsRowProps {
  colors: ProductColor[];
  selectedColorId?: string;
  onChange?: (colorId: string) => void;
  label?: string;
}

const ColorChipsRow = ({
  colors,
  selectedColorId,
  onChange,
  label = "Colores disponibles",
}: ColorChipsRowProps) => {
  const selectedColor = colors.find((c) => c.id === selectedColorId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-[var(--color-contrast-base)] mb-2">
        {label}
      </h3>

      <p className="text-sm text-gray-600 mb-3">
        {selectedColor ? (
          <>
            Color seleccionado: <span className="font-medium">{selectedColor.name}</span>
          </>
        ) : (
          "Seleccioná un color"
        )}
      </p>

      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1"
        style={{ 
          touchAction: 'pan-x',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
        onWheel={(e) => {
          e.preventDefault();
          const container = scrollContainerRef.current;
          if (container) {
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className="flex gap-3 py-3 snap-x snap-mandatory" style={{ width: 'max-content' }}>
          {colors.map((color) => (
            <div key={color.id} className="snap-center flex-shrink-0">
              <ColorChip
                name={color.name}
                hex={color.hex}
                selected={color.id === selectedColorId}
                onSelect={() => onChange?.(color.id)}
                disabled={color.available === false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorChipsRow;

