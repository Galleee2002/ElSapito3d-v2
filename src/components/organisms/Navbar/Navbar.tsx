import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils";
import { NavCta } from "@/components";
import { motionVariants, hoverVariants, tapVariants } from "@/constants";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/productos", label: "Productos" },
  { href: "/contacto", label: "Contacto" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/quienes-somos", label: "Quienes somos" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={motionVariants.springSoft}
      whileHover={isScrolled ? { scale: 1.02 } : {}}
      className={cn(
        "fixed top-4 left-4 right-4 z-50 mx-auto",
        "max-w-7xl rounded-full",
        "bg-[var(--color-frog-green)]",
        "border-2 border-[var(--color-border-blue)]",
        "px-4 sm:px-5 md:px-6",
        "h-14 sm:h-16 md:h-[72px]",
        "flex items-center justify-between",
        "backdrop-blur-md bg-opacity-95",
        "transition-all duration-300",
        "overflow-visible"
      )}
      style={{
        boxShadow: isScrolled
          ? "0 8px 24px rgba(255,236,61,0.35), 0 4px 12px rgba(39,76,154,0.2)"
          : "0 4px 12px rgba(39,76,154,0.15)",
      }}
    >
      {/* Logo y título */}
      <motion.div
        whileHover={hoverVariants.scale}
        whileTap={tapVariants.scale}
        transition={motionVariants.spring}
      >
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 md:gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-frog-green)] rounded-lg"
          aria-label="Ir al inicio"
        >
          <img
            src={logo}
            alt="El Sapito 3D"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain"
          />
          <span className="font-bold text-base sm:text-base md:text-lg text-[var(--color-contrast-base)] hidden sm:inline-block">
            El Sapito 3D
          </span>
        </Link>
      </motion.div>

      {/* Enlaces de navegación - Desktop */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 overflow-visible">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <motion.div
              key={link.href}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              initial="initial"
              animate={isActive ? "active" : "initial"}
              variants={{
                initial: { scale: 1, y: 0 },
                hover: hoverVariants.scaleLarge,
                active: { scale: 1, y: 0 },
              }}
              transition={motionVariants.spring}
            >
              <Link
                to={link.href}
                tabIndex={0}
                className={cn(
                  "relative text-sm md:text-base font-semibold",
                  "text-[var(--color-contrast-base)]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-frog-green)] rounded px-2",
                  "group block py-1 overflow-visible"
                )}
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-bouncy-lemon)] origin-left pointer-events-none"
                  style={{ width: "100%" }}
                  variants={{
                    initial: { scaleX: 0 },
                    hover: { scaleX: 1 },
                    active: { scaleX: 1 },
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* CTAs - Desktop */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        <NavCta to="/iniciar-sesion" variant="primary">
          Iniciar Sesión
        </NavCta>
        <NavCta to="/crear-cuenta" variant="secondary">
          Crear cuenta
        </NavCta>
      </div>

      {/* Botón hamburguesa - Mobile */}
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className={cn(
          "md:hidden p-2 rounded-full relative z-[60]",
          "text-[var(--color-contrast-base)]",
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)] focus-visible:ring-offset-2",
          "transition-transform hover:scale-110 active:scale-95"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Panel móvil */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[calc(1rem+3.5rem)] left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              id="mobile-menu"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed top-20 right-4 left-4 md:hidden z-50",
                "bg-[var(--color-frog-green)]",
                "border-2 border-[var(--color-border-blue)]",
                "rounded-2xl sm:rounded-3xl p-4 sm:p-6",
                "shadow-[0_8px_24px_rgba(255,236,61,0.35)]",
                "max-h-[calc(100vh-6rem)] overflow-y-auto"
              )}
            >
              {/* Enlaces móviles */}
              <nav
                className="flex flex-col gap-4 mb-6"
                aria-label="Navegación móvil"
              >
                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <motion.div
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        initial="initial"
                        animate={isActive ? "active" : "initial"}
                        variants={{
                          initial: { scale: 1, x: 0 },
                          hover: hoverVariants.scaleSmall,
                          active: { scale: 1, x: 0 },
                        }}
                        transition={motionVariants.spring}
                      >
                        <Link
                          to={link.href}
                          onClick={closeMenu}
                          tabIndex={0}
                          className={cn(
                            "relative text-base sm:text-lg font-semibold text-[var(--color-contrast-base)] block",
                            "px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl",
                            "bg-white/20 hover:bg-white/30",
                            "border-2 border-transparent hover:border-[var(--color-bouncy-lemon)]",
                            "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)] focus-visible:ring-offset-2",
                            "transition-all duration-200 pb-1 overflow-visible",
                            isActive &&
                              "bg-white/30 border-[var(--color-bouncy-lemon)]"
                          )}
                          style={{
                            boxShadow: isActive
                              ? "0 2px 8px rgba(255,236,61,0.3)"
                              : "0 1px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          <span className="relative z-10">{link.label}</span>
                          <motion.span
                            className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-bouncy-lemon)] origin-left pointer-events-none"
                            style={{ width: "100%" }}
                            variants={{
                              initial: { scaleX: 0 },
                              hover: { scaleX: 1 },
                              active: { scaleX: 1 },
                            }}
                            transition={{
                              duration: 0.4,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          />
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </nav>

              {/* CTAs móviles */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, ...motionVariants.springSoft }}
              >
                <NavCta
                  to="/iniciar-sesion"
                  variant="primary"
                  onClick={closeMenu}
                >
                  Iniciar Sesión
                </NavCta>
                <NavCta
                  to="/crear-cuenta"
                  variant="secondary"
                  onClick={closeMenu}
                >
                  Crear cuenta
                </NavCta>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
