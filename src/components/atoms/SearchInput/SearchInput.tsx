import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
}

const SearchInput = ({
  placeholder = "Buscar...",
  value,
  onChange,
  onSubmit,
}: SearchInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white z-10 pointer-events-none"
        size={18}
        strokeWidth={2.5}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-4 py-2 rounded-[var(--radius-md)] border-2 border-white/30 focus:outline-none focus:border-white/60 transition-colors duration-300 text-white bg-white/10 backdrop-blur-sm placeholder:text-white/60"
      />
    </div>
  );
};

export default SearchInput;

