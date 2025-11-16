import { useRef, useEffect } from "react";
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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
        className="w-full overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-4"
        style={{ 
          touchAction: 'pan-x',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="relative flex gap-3 py-3 snap-x snap-mandatory" style={{ width: 'max-content' }}>
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
          <div 
            className="pointer-events-none absolute top-3 bottom-3 left-0 w-8 rounded-full"
            style={{
              background: 'linear-gradient(to right, rgba(0, 0, 0, 0.08), transparent)'
            }}
            aria-hidden="true"
          />
          <div 
            className="pointer-events-none absolute top-3 bottom-3 right-0 w-8 rounded-full"
            style={{
              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.08), transparent)'
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorChipsRow;

