interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink = ({ href, children, active = false }: NavLinkProps) => {
  const baseStyles =
    "px-4 py-2 text-(--color-surface) transition-all duration-300 rounded-(--radius-sm) font-medium border-2 border-(--color-surface) hover:bg-(--color-highlight) hover:text-(--color-text)";
  const activeStyles = active
    ? "bg-(--color-highlight) text-(--color-text) font-semibold"
    : "";

  return (
    <a href={href} className={`${baseStyles} ${activeStyles}`}>
      {children}
    </a>
  );
};

export default NavLink;
