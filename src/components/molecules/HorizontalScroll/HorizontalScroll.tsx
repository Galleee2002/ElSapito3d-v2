import { useRef } from "react";
import { cn } from "@/utils/cn";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scrollBy?: number;
}

const HorizontalScroll = ({
  children,
  className,
  contentClassName,
  scrollBy = 320,
}: HorizontalScrollProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (offset: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className={cn(
          "flex gap-4 sm:gap-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth pr-2",
          // Evita el "corte" inferior cuando el navegador reserva espacio para el scrollbar
          "pb-2 -mb-2",
          // Oculta scrollbar sin recortar sombras
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroll;


