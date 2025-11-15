import { type ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";
import { motionVariants } from "@/constants";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: SearchBarProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 rounded-lg",
          "border-2 border-[var(--color-border-base)]",
          "bg-white",
          "text-xs sm:text-sm text-[var(--color-contrast-base)]",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-frog-green)] focus:border-transparent",
          "transition-all duration-200"
        )}
        style={{ fontFamily: "var(--font-nunito)" }}
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            onClick={handleClear}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={motionVariants.spring}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "p-1 rounded-full",
              "hover:bg-gray-100",
              "transition-colors duration-200"
            )}
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4 text-gray-500" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

