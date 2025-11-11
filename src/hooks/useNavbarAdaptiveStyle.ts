import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type BackgroundType = "light" | "dark";

interface NavbarStyles {
  bgColor: string;
  textColor: string;
  borderColor: string;
  shadow: string;
  opacity: number;
}

const DARK_BACKGROUND_STYLES: NavbarStyles = {
  bgColor: "rgba(255, 255, 255, 0.6)",
  textColor: "#121212",
  borderColor: "rgba(39, 76, 154, 0.4)",
  shadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
  opacity: 0.6,
};

const getBrightness = (color: string | null): number => {
  if (!color) return 0;

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  const hexMatch = color.match(/#([0-9a-f]{6}|[0-9a-f]{3})/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  return 128;
};

const isLightBackground = (color: string | null): boolean => {
  const brightness = getBrightness(color);
  return brightness > 180;
};

const blendColors = (
  foreground: string,
  background: string,
  opacity: number
): string => {
  const fgMatch = foreground.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const bgMatch = background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!fgMatch || !bgMatch) return foreground;

  const fgR = parseInt(fgMatch[1], 10);
  const fgG = parseInt(fgMatch[2], 10);
  const fgB = parseInt(fgMatch[3], 10);
  const bgR = parseInt(bgMatch[1], 10);
  const bgG = parseInt(bgMatch[2], 10);
  const bgB = parseInt(bgMatch[3], 10);

  const r = Math.round(fgR * opacity + bgR * (1 - opacity));
  const g = Math.round(fgG * opacity + bgG * (1 - opacity));
  const b = Math.round(fgB * opacity + bgB * (1 - opacity));

  return `rgb(${r}, ${g}, ${b})`;
};

const getBackgroundColorBehindNavbar = (): string | null => {
  const navbarHeight = 88;
  const checkY = navbarHeight + 20;
  const elementAtPoint = document.elementFromPoint(
    window.innerWidth / 2,
    checkY
  );

  if (!elementAtPoint) {
    const bodyStyle = window.getComputedStyle(document.body as Element);
    const bodyBg = bodyStyle.backgroundColor;
    if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent") {
      return bodyBg;
    }
    return null;
  }

  let parent: Element | null = elementAtPoint;
  const checkedElements: Element[] = [];

  for (let i = 0; i < 20 && parent; i++) {
    if (checkedElements.includes(parent)) break;
    checkedElements.push(parent);

    const style = window.getComputedStyle(parent);
    const bgImage = style.backgroundImage;
    const bgColor = style.backgroundColor;

    if (bgImage && bgImage !== "none") {
      const hero = document.getElementById("inicio");
      if (hero && hero.contains(parent)) {
        return "#8bd741";
      }
      parent = parent.parentElement;
      continue;
    }

    if (
      bgColor &&
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "transparent"
    ) {
      return bgColor;
    }

    if (parent.id === "inicio") {
      return "#8bd741";
    }

    if (parent.id === "productos-destacados") {
      return "#F5FAFF";
    }

    if (parent.id === "sobre-nosotros") {
      return "#E8F9C9";
    }

    if (parent.tagName === "FOOTER") {
      return "#1a1a1a";
    }

    parent = parent.parentElement;
  }

  const bodyStyle = window.getComputedStyle(document.body as Element);
  const bodyBg = bodyStyle.backgroundColor;
  if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent") {
    return bodyBg;
  }

  return null;
};

const LIGHT_BACKGROUND_ROUTES = ["/productos", "/carrito", "/admin"];

export const useNavbarAdaptiveStyle = (): {
  backgroundType: BackgroundType;
  styles: NavbarStyles;
} => {
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("dark");
  const [styles, setStyles] = useState<NavbarStyles>(DARK_BACKGROUND_STYLES);
  const location = useLocation();

  useEffect(() => {
    const updateStyles = () => {
      const scrollY = window.scrollY;
      const navbarHeight = 88;
      const checkPointY = scrollY + navbarHeight + 20;
      let detectedType: BackgroundType = "dark";

      if (location.pathname !== "/") {
        if (LIGHT_BACKGROUND_ROUTES.includes(location.pathname)) {
          detectedType = "light";
        } else {
          const rootElement = document.querySelector("#root > div");
          const targetElement = rootElement || (document.body as Element);
          const style = window.getComputedStyle(targetElement);
          let bgColor = style.backgroundColor;

          if (
            !bgColor ||
            bgColor === "rgba(0, 0, 0, 0)" ||
            bgColor === "transparent"
          ) {
            const bodyStyle = window.getComputedStyle(document.body as Element);
            bgColor = bodyStyle.backgroundColor;
          }

          if (
            !bgColor ||
            bgColor === "rgba(0, 0, 0, 0)" ||
            bgColor === "transparent"
          ) {
            const elementAtPoint = document.elementFromPoint(
              window.innerWidth / 2,
              navbarHeight + 40
            );
            if (elementAtPoint) {
              let parent: Element | null = elementAtPoint;
              for (let i = 0; i < 10 && parent; i++) {
                const parentStyle = window.getComputedStyle(parent);
                const parentBg = parentStyle.backgroundColor;
                if (
                  parentBg &&
                  parentBg !== "rgba(0, 0, 0, 0)" &&
                  parentBg !== "transparent"
                ) {
                  bgColor = parentBg;
                  break;
                }
                parent = parent.parentElement;
              }
            }
          }

          const isLight = isLightBackground(bgColor);
          detectedType = isLight ? "light" : "dark";
        }
      } else {
        if (scrollY < 50) {
          detectedType = "dark";
        } else {
          const footer = document.querySelector("footer");
          if (footer) {
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.top <= navbarHeight + 16) {
              detectedType = "dark";
            }
          }

          if (detectedType === "dark") {
            const hero = document.getElementById("inicio");
            if (hero) {
              const heroRect = hero.getBoundingClientRect();
              if (heroRect.bottom > checkPointY) {
                detectedType = "dark";
              }
            }
          }

          if (detectedType !== "dark") {
            const featuredProducts = document.getElementById(
              "productos-destacados"
            );
            if (featuredProducts) {
              const productsRect = featuredProducts.getBoundingClientRect();
              if (
                productsRect.top <= checkPointY &&
                productsRect.bottom >= checkPointY - navbarHeight
              ) {
                detectedType = "light";
              }
            }
          }

          if (detectedType !== "light") {
            const aboutUs = document.getElementById("sobre-nosotros");
            if (aboutUs) {
              const aboutRect = aboutUs.getBoundingClientRect();
              if (
                aboutRect.top <= checkPointY &&
                aboutRect.bottom >= checkPointY - navbarHeight
              ) {
                detectedType = "light";
              }
            }
          }
        }
      }

      setBackgroundType(detectedType);

      const baseOpacity = 0.6;
      const whiteOverlay = `rgba(255, 255, 255, ${baseOpacity})`;

      const backgroundBehind = getBackgroundColorBehindNavbar();
      let textColor = "#121212";
      let borderOpacity = 0.3;

      if (backgroundBehind) {
        const backgroundBrightness = getBrightness(backgroundBehind);

        const blendedColor = blendColors(
          "rgb(255, 255, 255)",
          backgroundBehind,
          baseOpacity
        );
        const blendedBrightness = getBrightness(blendedColor);

        if (backgroundBrightness < 80) {
          textColor = "#ffffff";
          borderOpacity = 0.6;
        } else if (backgroundBrightness < 140) {
          if (blendedBrightness < 140) {
            textColor = "#ffffff";
          } else {
            textColor = "#121212";
          }
          borderOpacity = 0.45;
        } else {
          textColor = "#121212";
          borderOpacity = 0.3;
        }
      } else {
        textColor = "#121212";
        borderOpacity = 0.3;
      }

      setStyles({
        bgColor: whiteOverlay,
        textColor,
        borderColor: `rgba(39, 76, 154, ${borderOpacity})`,
        shadow: "",
        opacity: baseOpacity,
      });
    };

    const handleScroll = () => {
      requestAnimationFrame(updateStyles);
    };

    updateStyles();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    const timeoutId = setTimeout(updateStyles, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return { backgroundType, styles };
};
