import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput, SearchResultsDropdown } from "@/components";
import { useProductSearch } from "@/hooks";
import type { Product } from "@/types";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  onProductClick?: (product: Product) => void;
}

const SearchBar = ({ onSearch, placeholder = "Buscar...", onProductClick }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const results = useProductSearch(searchQuery, 5);

  useEffect(() => {
    setIsOpen(searchQuery.trim().length > 0 && results.length > 0);
  }, [searchQuery, results]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setIsOpen(false);
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      navigate(`/producto/${product.id}`);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
      <SearchInput
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        onSubmit={handleSearch}
      />
      {isOpen && (
        <SearchResultsDropdown
          products={results}
          onProductClick={handleProductClick}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;

