import { useState, useCallback } from "react";

export const usePaymentsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openPanel,
    closePanel,
    togglePanel,
  };
};

