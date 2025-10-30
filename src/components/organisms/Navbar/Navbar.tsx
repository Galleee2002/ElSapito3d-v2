import { cn } from "@/utils/cn";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Mail, Users, Menu, X } from "lucide-react";
import NavLink from "../../molecules/NavLink";
import SearchBar from "../../molecules/SearchBar";
import useScrollPosition from "../../../hooks/useScrollPosition";
import logoImage from "../../../assets/images/logo.webp";

interface NavLink {
  href: string;
  label: string;
  active?: boolean;
}

interface NavbarProps {
  links?: NavLink[];
  onSearch?: (query: string) => void;
  solid?: boolean;
}

const ICON_MAP = {
  Productos: Package,
  Contacto: Mail,
  Nosotros: Users,
} as const;

const Navbar = ({
  links = [
    { href: "#productos", label: "Productos" },
    { href: "#contacto", label: "Contacto" },
    { href: "#nosotros", label: "Nosotros" },
  ],
  onSearch,
  solid,
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollPosition({ threshold: 100 });

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className={cn(
        "flex items-center justify-between py-3 px-4 md:px-8 lg:px-12 transition-all duration-500",
        (solid || isScrolled) ? "bg-(--color-primary-dark) shadow-(--shadow-lg)" : "bg-transparent"
      )}
    >
      {/* Logo (links to home) */}
      <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0 group z-50">
        <img
          src={logoImage}
          alt="Logo ElSapito3D"
          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <h1 className="text-white font-bold text-lg md:text-xl tracking-tight transition-all duration-300 group-hover:text-(--color-accent)">
          ElSapito3D
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-10 flex-1">
        {links.map((link) => {
          const isHome = typeof window !== 'undefined' ? window.location.pathname === '/' : true;
          const linkHref = isHome ? link.href : `/${link.href}`;
          return (
            <NavLink
              key={link.href}
              href={linkHref}
            active={link.active}
            icon={ICON_MAP[link.label as keyof typeof ICON_MAP]}
            >
              {link.label}
            </NavLink>
          );
        })}
      </div>

      {/* Desktop Search */}
      <div className="hidden md:block shrink-0">
        <SearchBar onSearch={onSearch} />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 text-white hover:text-(--color-accent) transition-colors z-50"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 top-[60px] bg-[var(--color-primary)] z-40 lg:hidden overflow-hidden"
          onClick={closeMenu}
        >
          <div 
            className="flex flex-col items-center justify-center h-full gap-8 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => {
              const isHome = typeof window !== 'undefined' ? window.location.pathname === '/' : true;
              const linkHref = isHome ? link.href : `/${link.href}`;
              return (
                <NavLink
                  key={link.href}
                  href={linkHref}
                active={link.active}
                icon={ICON_MAP[link.label as keyof typeof ICON_MAP]}
                onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              );
            })}
            <div className="w-full max-w-sm mt-4">
              <SearchBar onSearch={onSearch} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
