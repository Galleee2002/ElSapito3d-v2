import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: LucideIcon;
}

const NavLink = ({
  href,
  children,
  active = false,
  icon: Icon,
}: NavLinkProps) => {
  const baseStyles =
    "flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 rounded-(--radius-sm) font-medium hover:text-(--color-accent)";
  const activeStyles = active ? "text-(--color-accent) font-semibold" : "";

  return (
    <a href={href} className={`${baseStyles} ${activeStyles}`}>
      {Icon && <Icon size={18} />}
      {children}
    </a>
  );
};

export default NavLink;
