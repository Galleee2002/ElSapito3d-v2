import { useRef, useEffect, useState, useCallback } from "react";
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

  const updateFadeVisibility = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
    const needsScroll = scrollWidth > clientWidth;

    if (!needsScroll) {
      setShowLeftFade(false);
      setShowRightFade(false);
      return;
    }

    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft < maxScrollLeft - 5);
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

  if (!colors.length) return null;

  return (
    <div ref={wrapperRef} className="w-full">
      {label && (
        <h3 className="text-sm font-semibold text-[var(--color-contrast-base)] mb-3">
          {label}
        </h3>
      )}

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto no-scrollbar px-1 py-1"
          style={{
            touchAction: "pan-x pan-y",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "auto",
          }}
        >
          <div
            className="flex gap-3 items-center"
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

