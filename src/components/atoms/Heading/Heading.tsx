import { cn } from "@/utils/cn";

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

const Heading = ({ children, level = 1, className }: HeadingProps) => {
  const levelStyles = {
    1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold",
    2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold",
    3: "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={cn("font-[var(--font-heading)]", levelStyles[level], className)}>
      {children}
    </Tag>
  );
};

export default Heading;

