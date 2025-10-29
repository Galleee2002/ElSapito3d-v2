interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

const Heading = ({ children, level = 1, className = "" }: HeadingProps) => {
  const baseStyles = "font-[var(--font-heading)]";

  const levelStyles = {
    1: "text-5xl md:text-6xl lg:text-7xl font-extrabold",
    2: "text-4xl md:text-5xl lg:text-6xl font-bold",
    3: "text-3xl md:text-4xl lg:text-5xl font-semibold",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`${baseStyles} ${levelStyles[level]} ${className}`}>
      {children}
    </Tag>
  );
};

export default Heading;

