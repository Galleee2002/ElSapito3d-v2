import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}

const NavLink = ({ href, children, active = false, icon: Icon, onClick }: NavLinkProps) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-base lg:text-base text-white transition-all duration-300 rounded-(--radius-sm) font-medium hover:text-(--color-accent)",
        active && "text-(--color-accent) font-semibold"
      )}
    >
      {Icon && <Icon size={20} className="lg:w-[18px] lg:h-[18px]" />}
      {children}
    </a>
  );
};

export default NavLink;
