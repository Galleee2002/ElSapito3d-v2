import { cn } from "@/utils";

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const SocialIcon = ({
  href,
  icon,
  label,
  className = "",
}: SocialIconProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "w-9 h-9 p-2 rounded-full",
        "bg-gray-800 hover:bg-gray-700",
        "text-gray-400 hover:text-white",
        "transition-all duration-200",
        "hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]",
        "flex items-center justify-center",
        className
      )}
    >
      <span className="flex items-center justify-center">{icon}</span>
    </a>
  );
};

export default SocialIcon;

