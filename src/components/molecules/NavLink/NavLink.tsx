interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink = ({ href, children, active = false }: NavLinkProps) => {
  const baseStyles =
    "px-4 py-2 text-[var(--color-text)] transition-colors duration-300 rounded-[var(--radius-sm)] font-medium";
  const activeStyles = active
    ? "text-[var(--color-primary)] font-semibold"
    : "hover:text-[var(--color-primary)]";

  return (
    <a href={href} className={`${baseStyles} ${activeStyles}`}>
      {children}
    </a>
  );
};

export default NavLink;
