import NavLink from "../../molecules/NavLink";

interface NavbarProps {
  links?: Array<{ href: string; label: string; active?: boolean }>;
}

const Navbar = ({
  links = [
    { href: "#inicio", label: "Inicio" },
    { href: "#productos", label: "Productos" },
    { href: "#contacto", label: "Contacto" },
    { href: "#nosotros", label: "Nosotros" },
  ],
}: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-(--shadow-md) z-50 flex items-center justify-center gap-20 py-2 px-12">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} active={link.active}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
