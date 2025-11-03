import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Modal = ({ isOpen, onClose, children, className, title }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 w-full max-w-md bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden",
          "transform transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-[var(--color-text)] opacity-60 hover:opacity-100 transition-opacity rounded-[var(--radius-sm)] hover:bg-black/5"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-[var(--color-text)] opacity-60 hover:opacity-100 transition-opacity rounded-[var(--radius-sm)] hover:bg-black/5 z-20"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        )}
        <div className={title ? "p-6" : "p-6"}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

