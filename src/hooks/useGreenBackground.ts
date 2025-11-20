import { useEffect, useState, useRef, useCallback } from "react";

const FROG_GREEN_RGB = { r: 139, g: 215, b: 65 };
const COLOR_TOLERANCE = 40;

const isGreenColor = (r: number, g: number, b: number): boolean => {
  const rDiff = Math.abs(r - FROG_GREEN_RGB.r);
  const gDiff = Math.abs(g - FROG_GREEN_RGB.g);
  const bDiff = Math.abs(b - FROG_GREEN_RGB.b);
  
  return rDiff < COLOR_TOLERANCE && gDiff < COLOR_TOLERANCE && bDiff < COLOR_TOLERANCE;
};

export const useGreenBackground = () => {
  const [isOnGreenBackground, setIsOnGreenBackground] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastStateRef = useRef<boolean | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const checkBackgroundColor = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const checkY = buttonRect.top + buttonRect.height + 2;
    
    const checkPoint = (x: number, y: number): boolean => {
      const elementAtPoint = document.elementFromPoint(x, y);
      if (!elementAtPoint || elementAtPoint === buttonRef.current) {
        return false;
      }

      let currentElement: Element | null = elementAtPoint;

      while (currentElement && currentElement !== document.body) {
        if (currentElement === buttonRef.current) {
          currentElement = currentElement.parentElement;
          continue;
        }

        const computedStyle = window.getComputedStyle(currentElement);
        const bgColor = computedStyle.backgroundColor;
        const bgImage = computedStyle.backgroundImage;
        const opacity = parseFloat(computedStyle.opacity || "1");

        if (opacity < 0.05) {
          currentElement = currentElement.parentElement;
          continue;
        }

        if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
          const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);

            if (isGreenColor(r, g, b)) {
              return true;
            }
          }
        }

        const classList = currentElement.classList;
        const classArray = Array.from(classList);
        const hasGreenClass = classArray.some(
          (cls) =>
            cls.includes("bg-frog-green") ||
            (cls.includes("frog-green") && cls.includes("bg"))
        );

        if (hasGreenClass || (bgImage && (bgImage.includes("frog-green") || bgImage.includes("#8bd741")))) {
          return true;
        }

        const inlineStyle = (currentElement as HTMLElement).style;
        if (
          inlineStyle.backgroundColor?.includes("frog-green") ||
          inlineStyle.background?.includes("frog-green") ||
          (inlineStyle.backgroundImage && inlineStyle.backgroundImage.includes("frog-green"))
        ) {
          return true;
        }

        currentElement = currentElement.parentElement;
      }

      return false;
    };

    const points = [
      { x: centerX, y: checkY },
      { x: buttonRect.left + buttonRect.width * 0.3, y: checkY },
      { x: buttonRect.left + buttonRect.width * 0.7, y: checkY },
    ];

    const greenPoints = points.filter((point) => checkPoint(point.x, point.y));
    const isGreen = greenPoints.length >= 2;

    if (lastStateRef.current !== isGreen) {
      setIsOnGreenBackground(isGreen);
      lastStateRef.current = isGreen;
    }
  }, []);

  useEffect(() => {
    checkBackgroundColor();

    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(checkBackgroundColor);
    };

    const handleResize = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(checkBackgroundColor);
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [checkBackgroundColor]);

  return { isOnGreenBackground, buttonRef };
};

