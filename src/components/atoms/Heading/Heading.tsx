import { cn } from "@/utils";

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

  switch (level) {
    case 1:
      return (
        <h1 className={cn("font-[var(--font-heading)]", levelStyles[1], className)}>
          {children}
        </h1>
      );
    case 2:
      return (
        <h2 className={cn("font-[var(--font-heading)]", levelStyles[2], className)}>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 className={cn("font-[var(--font-heading)]", levelStyles[3], className)}>
          {children}
        </h3>
      );
    default:
      return null;
  }
};

export default Heading;

