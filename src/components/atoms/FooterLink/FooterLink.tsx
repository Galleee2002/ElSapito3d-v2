import { FOCUS_VISIBLE_SHADOW } from "@/constants";
import { cn } from "@/utils";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

const FooterLink = ({
  href,
  children,
  className = "",
  external = false,
}: FooterLinkProps) => {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "text-base text-gray-300 hover:text-white transition-colors duration-200",
        "focus-visible:outline-none",
        FOCUS_VISIBLE_SHADOW,
        "rounded-md px-1 py-0.5",
        className
      )}
    >
      {children}
    </a>
  );
};

export default FooterLink;

