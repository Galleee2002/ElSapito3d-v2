import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  showScrollbar?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md sm:max-w-lg",
  lg: "max-w-lg sm:max-w-xl md:max-w-2xl",
  xl: "max-w-md sm:max-w-lg md:max-w-xl",
  "2xl": "max-w-2xl md:max-w-3xl lg:max-w-4xl",
  "4xl": "max-w-4xl lg:max-w-5xl",
};

const Modal = ({ isOpen, onClose, children, ariaLabelledBy, maxWidth = "xl", showScrollbar = false }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "bg-white rounded-2xl sm:rounded-3xl border-4 border-[var(--color-border-base)] w-full pointer-events-auto shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden",
                maxWidthClasses[maxWidth]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn("overflow-y-auto flex-1", !showScrollbar && "no-scrollbar")}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;

