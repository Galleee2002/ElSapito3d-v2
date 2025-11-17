import { type ReactNode } from "react";
import { cn } from "@/utils";

interface FooterLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

const FooterLink = ({
  href,
  children,
  className,
  external = false,
}: FooterLinkProps) => {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "text-base text-gray-300 cursor-default",
        "focus-visible:outline-none",
        "focus-visible-shadow",
        "rounded-md px-1 py-0.5",
        className
      )}
    >
      {children}
    </a>
  );
};

export default FooterLink;

