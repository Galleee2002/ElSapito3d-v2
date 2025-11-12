import { useState, useEffect, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils";
import { NavCta } from "@/components";
import { motionVariants, hoverVariants, tapVariants } from "@/constants";
import {
  useAuthModal,
  useAuth,
  useCart,
  useSmoothScroll,
  useNavbarAdaptiveStyle,
} from "@/hooks";

interface NavLink {
  href: string;
  label: string;
  sectionId: string;
}

const navLinks: NavLink[] = [
  { href: "/#inicio", label: "Inicio", sectionId: "inicio" },
  {
    href: "/#productos-destacados",
    label: "Productos",
    sectionId: "productos-destacados",
  },
  {
    href: "/#sobre-nosotros",
    label: "Sobre nosotros",
    sectionId: "sobre-nosotros",
  },
  { href: "/#ubicacion", label: "Ubicación", sectionId: "ubicacion" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useAuthModal();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { scrollToSection } = useSmoothScroll();
  const { styles: navbarStyles } = useNavbarAdaptiveStyle();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const sectionId = location.hash.substring(1);
      scrollToSection(sectionId, { delay: 200 });
    }
  }, [location, scrollToSection]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavClick = (
    e: MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    closeMenu();

    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash: `#${sectionId}` });
      return;
    }

    scrollToSection(sectionId, { delay: 100 });
  };

  const handleAuthModalOpen = (
    event: MouseEvent<HTMLAnchorElement>,
    targetMode: "login" | "register",
    shouldCloseMenu = false
  ) => {
    event.preventDefault();
    if (shouldCloseMenu) {
      closeMenu();
    }
    openModal(targetMode);
  };

  const handleLogoutClick = async (
    event: MouseEvent<HTMLAnchorElement>,
    shouldCloseMenu = false
  ) => {
    event.preventDefault();
    if (shouldCloseMenu) {
      closeMenu();
    }
    await logout();
    navigate("/");
  };

  const renderCartCta = (size: "sm" | "md", shouldClose: boolean) => (
    <NavCta
      to="/carrito"
      variant="primary"
      size={size}
      className="!flex !items-center !justify-center gap-2"
      onClick={
        shouldClose
          ? () => {
              closeMenu();
            }
          : undefined
      }
    >
      <ShoppingCart className="w-4 h-4" />
      <span>Carrito</span>
      {totalItems > 0 && (
        <>
          <span
            className="ml-1 inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-[var(--color-toad-eyes)] px-2 py-0.5 text-xs font-bold text-white"
            aria-hidden="true"
          >
            {totalItems}
          </span>
          <span className="sr-only">
            {`Tienes ${totalItems} producto${
              totalItems === 1 ? "" : "s"
            } en el carrito`}
          </span>
        </>
      )}
    </NavCta>
  );

  const renderActionGroup = (context: "desktop" | "mobile") => {
    const size = context === "desktop" ? "sm" : "md";
    const shouldClose = context === "mobile";

    if (!isAuthenticated) {
      return (
        <>
          {renderCartCta(size, shouldClose)}
          <NavCta
            to="#"
            variant="primary"
            size={size}
            onClick={(event) => {
              handleAuthModalOpen(event, "login", shouldClose);
            }}
          >
            Iniciar Sesión
          </NavCta>
          <NavCta
            to="#"
            variant="secondary"
            size={size}
            onClick={(event) => {
              handleAuthModalOpen(event, "register", shouldClose);
            }}
          >
            Crear cuenta
          </NavCta>
        </>
      );
    }

    if (user?.isAdmin) {
      return (
        <>
          {renderCartCta(size, shouldClose)}
          <NavCta
            to="/admin"
            variant="primary"
            size={size}
            className={shouldClose ? "!flex !items-center !justify-center" : ""}
            onClick={
              shouldClose
                ? () => {
                    closeMenu();
                  }
                : undefined
            }
          >
            Panel de Admin
          </NavCta>
          <NavCta
            to="#"
            variant="secondary"
            size={size}
            className={shouldClose ? "!flex !items-center !justify-center" : ""}
            onClick={(event) => {
              void handleLogoutClick(event, shouldClose);
            }}
          >
            Cerrar sesión
          </NavCta>
        </>
      );
    }

    return (
      <>
        {renderCartCta(size, shouldClose)}
        <NavCta
          to="#"
          variant="secondary"
          size={size}
          className={shouldClose ? "!flex !items-center !justify-center" : ""}
          onClick={(event) => {
            void handleLogoutClick(event, shouldClose);
          }}
        >
          Cerrar sesión
        </NavCta>
      </>
    );
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
        "border-2",
        "px-4 sm:px-5 md:px-5 lg:px-6",
        "h-14 sm:h-16 lg:h-[72px]",
        "flex items-center justify-between",
        "backdrop-blur-md",
        "transition-all duration-300",
        "overflow-visible"
      )}
      style={{
        backgroundColor: navbarStyles.bgColor,
        borderColor: navbarStyles.borderColor,
        boxShadow: "none",
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
          className={cn(
            "flex items-center gap-2 sm:gap-2.5 md:gap-3 outline-none rounded-lg"
          )}
          style={{ boxShadow: "none" }}
          aria-label="Ir al inicio"
        >
          <img
            src={logo}
            alt="El Sapito 3D"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain"
          />
          <span
            className="font-bold text-base sm:text-base lg:text-lg hidden sm:inline-block transition-colors duration-300"
            style={{ color: navbarStyles.textColor }}
          >
            El Sapito 3D
          </span>
        </Link>
      </motion.div>

      {/* Enlaces de navegación - Desktop */}
      <div className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8 overflow-visible">
        {navLinks.map((link) => {
          const isActive =
            location.pathname === "/" && location.hash === `#${link.sectionId}`;
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
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.sectionId)}
                tabIndex={0}
                className={cn(
                  "relative text-sm lg:text-base font-semibold",
                  "outline-none rounded px-2",
                  "block py-1 cursor-pointer transition-colors duration-300"
                )}
                style={{ color: navbarStyles.textColor, boxShadow: "none" }}
              >
                {link.label}
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* CTAs - Desktop */}
      <div className="hidden md:flex items-center gap-1.5 lg:gap-3">
        {renderActionGroup("desktop")}
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
          "outline-none",
          "transition-all duration-300 hover:scale-110 active:scale-95"
        )}
        style={{ color: navbarStyles.textColor, boxShadow: "none" }}
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
              initial={{ x: 0, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 0, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "fixed top-20 right-4 left-4 md:hidden z-50",
                "border-2",
                "rounded-2xl sm:rounded-3xl p-4 sm:p-6",
                "max-h-[calc(100vh-6rem)] overflow-y-auto"
              )}
              style={{
                backgroundColor: navbarStyles.bgColor,
                borderColor: navbarStyles.borderColor,
                boxShadow: "none",
              }}
            >
              {/* Enlaces móviles */}
              <nav
                className="flex flex-col gap-4 mb-6"
                aria-label="Navegación móvil"
              >
                {navLinks.map((link, index) => {
                  const isActive =
                    location.pathname === "/" &&
                    location.hash === `#${link.sectionId}`;
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
                        <a
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link.sectionId)}
                          tabIndex={0}
                          className={cn(
                            "relative text-base sm:text-lg font-semibold block",
                            "px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl",
                            "border-2 border-transparent",
                            "outline-none",
                            "transition-all duration-200 cursor-pointer",
                            "bg-white/10 hover:bg-white/20"
                          )}
                          style={{
                            color: navbarStyles.textColor,
                            borderColor: isActive
                              ? navbarStyles.borderColor
                              : "transparent",
                            boxShadow: "none",
                          }}
                        >
                          {link.label}
                        </a>
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
                {renderActionGroup("mobile")}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
