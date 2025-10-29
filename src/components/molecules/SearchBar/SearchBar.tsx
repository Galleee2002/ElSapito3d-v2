import { useState } from "react";
import SearchInput from "../../atoms/SearchInput";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  onSearch,
  placeholder = "Buscar productos...",
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex items-center">
      <SearchInput
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onSubmit={handleSearch}
      />
      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-[var(--color-highlight)] text-[var(--color-text)] rounded-r-[var(--radius-md)] font-semibold transition-all duration-300 hover:shadow-[var(--shadow-hover)] shadow-[var(--shadow-md)] border-2 border-[var(--color-highlight)]"
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;

