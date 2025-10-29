import NavLink from "../../molecules/NavLink";
import SearchBar from "../../molecules/SearchBar";
import useScrollPosition from "../../../hooks/useScrollPosition";
import logoImage from "../../../assets/images/logo.webp";

interface NavbarProps {
  links?: Array<{ href: string; label: string; active?: boolean }>;
  onSearch?: (query: string) => void;
}

const Navbar = ({
  links = [
    { href: "#productos", label: "Productos" },
    { href: "#contacto", label: "Contacto" },
    { href: "#nosotros", label: "Nosotros" },
  ],
  onSearch,
}: NavbarProps) => {
  const isScrolled = useScrollPosition({ threshold: 100 });

  const navbarStyles = isScrolled
    ? "bg-(--color-primary-dark) shadow-(--shadow-lg)"
    : "bg-(--color-primary)";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-2 px-12 transition-all duration-500 ${navbarStyles}`}
    >
      <a href="#inicio" className="flex items-center gap-3 shrink-0 group">
        <img
          src={logoImage}
          alt="Logo ElSapito3D"
          className="w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <h1 className="text-(--color-surface) font-bold text-2xl tracking-tight transition-all duration-300 group-hover:text-(--color-accent)">
          ElSapito3D
        </h1>
      </a>

      <div className="flex items-center justify-center gap-10 flex-1">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href} active={link.active}>
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="shrink-0">
        <SearchBar onSearch={onSearch} />
      </div>
    </nav>
  );
};

export default Navbar;
