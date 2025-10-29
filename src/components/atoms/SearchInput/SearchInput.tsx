interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
}

const SearchInput = ({
  placeholder = "Buscar productos...",
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
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      className="px-4 py-2 rounded-l-[var(--radius-md)] border-2 border-[var(--color-highlight)] focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-300 text-[var(--color-text)] placeholder:text-[var(--color-surface)]"
    />
  );
};

export default SearchInput;

