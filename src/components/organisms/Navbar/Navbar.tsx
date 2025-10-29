import { Package, Mail, Users } from "lucide-react";
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
  const iconMap: { [key: string]: typeof Package } = {
    Productos: Package,
    Contacto: Mail,
    Nosotros: Users,
  };
  const isScrolled = useScrollPosition({ threshold: 100 });

  const navbarStyles = isScrolled
    ? "bg-(--color-primary-dark) shadow-(--shadow-lg)"
    : "bg-transparent";

  return (
    <nav
      className={`flex items-center justify-between py-3 px-12 transition-all duration-500 ${navbarStyles}`}
    >
      <a href="#inicio" className="flex items-center gap-3 shrink-0 group ml-8">
        <img
          src={logoImage}
          alt="Logo ElSapito3D"
          className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <h1 className="text-white font-bold text-xl tracking-tight transition-all duration-300 group-hover:text-(--color-accent)">
          ElSapito3D
        </h1>
      </a>

      <div className="flex items-center justify-center gap-10 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            active={link.active}
            icon={iconMap[link.label]}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="shrink-0 ml-8">
        <SearchBar onSearch={onSearch} />
      </div>
    </nav>
  );
};

export default Navbar;
