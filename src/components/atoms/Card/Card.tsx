interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card = ({ children, className = "", hover = true }: CardProps) => {
  const baseStyles =
    "bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] p-6";
  const hoverStyles = hover
    ? "transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1"
    : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
