import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ColorChip from "@/components/atoms/ColorChip";
import { ProductColor } from "@/types";

interface ColorChipsRowHorizontalProps {
  colors: ProductColor[];
  selectedColorId?: string;
  selectedColorIds?: string[];
  onChange?: (colorId: string) => void;
  label?: string;
  multiple?: boolean;
}

const ColorChipsRowHorizontal = ({
  colors,
  selectedColorId,
  selectedColorIds,
  onChange,
  label = "Colores disponibles",
  multiple = false,
}: ColorChipsRowHorizontalProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("rgb(255, 255, 255)");

  const isSelected = useCallback(
    (colorId: string) => {
      if (multiple && selectedColorIds) {
        return selectedColorIds.includes(colorId);
      }
      return colorId === selectedColorId;
    },
    [multiple, selectedColorIds, selectedColorId]
  );

  const selectedColors = useMemo(() => {
    if (multiple && selectedColorIds && selectedColorIds.length > 0) {
      return colors.filter((color) => selectedColorIds.includes(color.id));
    }

    if (!multiple && selectedColorId) {
      const selected = colors.find((color) => color.id === selectedColorId);
      return selected ? [selected] : [];
    }

    return [];
  }, [colors, multiple, selectedColorId, selectedColorIds]);

  const updateFadeVisibility = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
    const needsScroll = scrollWidth > clientWidth;

    setHasScroll(needsScroll);

    if (!needsScroll) {
      setShowLeftFade(false);
      setShowRightFade(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft < maxScrollLeft - 5);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScrollLeft);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const detectBackgroundColor = () => {
      let element: HTMLElement | null = wrapper.parentElement;
      let bgColor = "rgb(255, 255, 255)";

      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;

        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          bgColor = bg;
          break;
        }

        element = element.parentElement;
      }

      setBackgroundColor(bgColor);
    };

    detectBackgroundColor();

    const mutationObserver = new MutationObserver(() => {
      detectBackgroundColor();
    });

    mutationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateFadeVisibility();

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as Node;
      const isInsideContainer = container.contains(target);
      
      if (!isInsideContainer) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        const isOverContainer = 
          x >= rect.left && 
          x <= rect.right && 
          y >= rect.top && 
          y <= rect.bottom;
        
        if (!isOverContainer) return;
      }

      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const needsScroll = scrollWidth > clientWidth;

      if (!needsScroll) return;

      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.deltaX || 0;
      const deltaY = e.deltaY || 0;
      const deltaMode = e.deltaMode || 0;

      let scrollAmount = 0;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 0) {
        scrollAmount = deltaX;
      } else if (Math.abs(deltaY) > 0) {
        scrollAmount = -deltaY;
      } else {
        return;
      }

      if (deltaMode === 1) {
        scrollAmount *= 20;
      } else if (deltaMode === 2) {
        scrollAmount *= 250;
      }

      container.scrollLeft += scrollAmount * 1.3;
    };

    const handleScroll = () => {
      updateFadeVisibility();
    };

    container.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    container.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateFadeVisibility();
    });

    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateFadeVisibility]);

  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, []);

  if (!colors.length) return null;

  return (
    <div ref={wrapperRef} className="w-full">
      {label && (
        <h3 className="text-sm font-semibold text-[var(--color-contrast-base)] mb-3">
          {label}
        </h3>
      )}

      {selectedColors.length > 0 && (
        <p className="text-xs text-gray-600 mb-2">
          {multiple ? (
            <>
              Colores seleccionados:{" "}
              <span className="font-medium">
                {selectedColors.map((c) => c.name).join(", ")}
              </span>
            </>
          ) : (
            <>
              Color seleccionado:{" "}
              <span className="font-medium">{selectedColors[0]?.name}</span>
            </>
          )}
        </p>
      )}

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--color-border-base)]/30 shadow-md hover:bg-[var(--color-border-base)]/5 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
            aria-label="Desplazar colores hacia la izquierda"
          >
            <ChevronLeft size={20} className="text-[var(--color-border-base)]" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--color-border-base)]/30 shadow-md hover:bg-[var(--color-border-base)]/5 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
            aria-label="Desplazar colores hacia la derecha"
          >
            <ChevronRight size={20} className="text-[var(--color-border-base)]" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto no-scrollbar py-1"
          style={{
            touchAction: "pan-x pan-y",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "auto",
          }}
        >
          <div
            className={`flex gap-3 items-center ${
              hasScroll ? "px-10" : "px-1"
            }`}
            style={{ width: "max-content", minWidth: "100%" }}
          >
            {colors.map((color) => {
              const selected = isSelected(color.id);
              return (
                <div key={color.id} className="flex-shrink-0">
                  <ColorChip
                    name={color.name}
                    hex={color.hex}
                    selected={selected}
                    onSelect={() => onChange?.(color.id)}
                    disabled={color.available === false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {showLeftFade && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-0 w-20 z-10 transition-opacity duration-300"
            style={{
              background: `linear-gradient(to right, ${backgroundColor}, transparent)`,
            }}
            aria-hidden="true"
          />
        )}

        {showRightFade && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 right-0 w-20 z-10 transition-opacity duration-300"
            style={{
              background: `linear-gradient(to left, ${backgroundColor}, transparent)`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default ColorChipsRowHorizontal;

