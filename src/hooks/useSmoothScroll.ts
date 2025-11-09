import { useCallback } from "react";

const MOBILE_HEIGHT = 56;
const TABLET_HEIGHT = 64;
const DESKTOP_HEIGHT = 72;
const BASE_OFFSET = 36; // 16px top margin + 20px padding

const resolveNavbarHeight = () => {
  if (typeof window === "undefined") {
    return TABLET_HEIGHT;
  }

  if (window.innerWidth < 640) {
    return MOBILE_HEIGHT;
  }

  if (window.innerWidth < 1024) {
    return TABLET_HEIGHT;
  }

  return DESKTOP_HEIGHT;
};

const computeScrollOffset = () => resolveNavbarHeight() + BASE_OFFSET;

interface ScrollOptions {
  delay?: number;
  offset?: number;
  behavior?: ScrollBehavior;
}

export const useSmoothScroll = () => {
  const scrollToSection = useCallback(
    (sectionId: string, options?: ScrollOptions) => {
      const executeScroll = () => {
        if (typeof window === "undefined") {
          return;
        }

        const element = document.getElementById(sectionId);

        if (!element) {
          return;
        }

        const offset = options?.offset ?? computeScrollOffset();
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: options?.behavior ?? "smooth",
        });
      };

      if (options?.delay) {
        window.setTimeout(executeScroll, options.delay);
        return;
      }

      executeScroll();
    },
    []
  );

  return {
    getNavbarHeight: resolveNavbarHeight,
    getScrollOffset: computeScrollOffset,
    scrollToSection,
  };
};
