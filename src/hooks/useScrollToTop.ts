import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTop } from "@/utils/scrollHelpers";

export const useScrollToTop = (enabled: boolean = true) => {
  const location = useLocation();

  useEffect(() => {
    if (enabled) {
      scrollToTop("instant");
    }
  }, [location.pathname, enabled]);
};

