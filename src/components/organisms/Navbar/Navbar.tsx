import { useState, useEffect, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, ShoppingCart, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils";
import { motionVariants, hoverVariants, tapVariants } from "@/constants";
import { useAuthModal, useAuth, useCart, useSmoothScroll } from "@/hooks";

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
    href: "/#como-comprar",
    label: "Comprar",
    sectionId: "como-comprar",
  },
];

const ShieldUserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
    <circle cx="12" cy="11" r="4" />
  </svg>
);

interface NavIconActionProps {
  label: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
}

const navActionBaseClasses =
  "relative flex h-11 w-11 items-center justify-center rounded-full  bg-white text-[#101828] shadow-[0_10px_25px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#101828]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#101828]/40";

const NavIconAction = ({
  label,
  icon,
  to,
  onClick,
  badge,
}: NavIconActionProps) => {
  const content = (
    <>
      {badge}
      {icon}
      <span className="sr-only">{label}</span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={label}
        onClick={onClick}
        className={navActionBaseClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={navActionBaseClasses}
    >
      {content}
    </button>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useAuthModal();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { scrollToSection } = useSmoothScroll();

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

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
    targetMode: "login" | "register",
    shouldCloseMenu = false
  ) => {
    if (shouldCloseMenu) {
      closeMenu();
    }
    openModal(targetMode);
  };

  const handleLogout = async (shouldCloseMenu = false) => {
    if (shouldCloseMenu) {
      closeMenu();
    }
    await logout();
    navigate("/");
  };

  const renderActionGroup = (context: "desktop" | "mobile") => {
    const shouldClose = context === "mobile";
    const actions: NavIconActionProps[] = [
      {
        label: "Ir al carrito",
        to: "/carrito",
        onClick: shouldClose ? closeMenu : undefined,
        icon: <ShoppingCart className="h-5 w-5" />,
        badge:
          totalItems > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-[var(--color-toad-eyes)] px-1.5 text-[0.65rem] font-bold text-white">
              {totalItems}
            </span>
          ) : null,
      },
    ];

    if (!isAuthenticated) {
      actions.push(
        {
          label: "Iniciar sesión",
          icon: <LogIn className="h-5 w-5" />,
          onClick: () => {
            handleAuthModalOpen("login", shouldClose);
          },
        },
        {
          label: "Crear cuenta",
          icon: <UserPlus className="h-5 w-5" />,
          onClick: () => {
            handleAuthModalOpen("register", shouldClose);
          },
        }
      );
    }

    if (user?.isAdmin) {
      actions.push(
        {
          label: "Panel de administrador",
          to: "/admin",
          onClick: shouldClose
            ? () => {
              closeMenu();
            }
            : undefined,
          icon: <ShieldUserIcon />,
        },
        {
          label: "Cerrar sesión",
          icon: <LogOut className="h-5 w-5" />,
          onClick: () => {
            void handleLogout(shouldClose);
          },
        }
      );
    } else if (isAuthenticated && !user?.isAdmin) {
      actions.push({
        label: "Cerrar sesión",
        icon: <LogOut className="h-5 w-5" />,
        onClick: () => {
          void handleLogout(shouldClose);
        },
      });
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2",
          context === "mobile" ? "justify-center" : ""
        )}
      >
        {actions.map((action) => (
          <NavIconAction key={action.label} {...action} />
        ))}
      </div>
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
        "px-4 sm:px-5 md:px-5 lg:px-6",
        "h-14 sm:h-16 lg:h-[72px]",
        "flex items-center justify-between",
        "backdrop-blur-md",
        "transition-all duration-300",
        "overflow-visible shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
        "text-slate-900",
        isOpen ? "bg-white" : "bg-white/80"
      )}
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
            "flex items-center gap-2 sm:gap-2.5 md:gap-3 outline-none rounded-lg text-slate-900"
          )}
          aria-label="Ir al inicio"
        >
          <img
            src={logo}
            alt="El Sapito 3D"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain"
          />
          <span className="font-bold text-base sm:text-base lg:text-lg hidden sm:inline-block transition-colors duration-300 text-slate-900">
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
                  "relative text-sm lg:text-base font-semibold text-slate-900",
                  "outline-none rounded px-2",
                  "block py-1 cursor-pointer transition-colors duration-300"
                )}
              >
                {link.label}
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* CTAs - Desktop */}
      <div className="hidden md:flex items-center gap-2">
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
          "outline-none text-slate-900",
          "transition-all duration-300 hover:scale-110 active:scale-95"
        )}
      >
        {totalItems > 0 && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.65rem] font-bold text-white shadow-lg z-[61]">
            {totalItems}
          </span>
        )}
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
                "rounded-2xl sm:rounded-3xl p-4 sm:p-6",
                "max-h-[calc(100vh-6rem)] overflow-y-auto bg-white backdrop-blur-lg shadow-[0_18px_45px_rgba(15,23,42,0.18)]",
                "text-slate-900"
              )}
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
                            "text-slate-900",
                            "outline-none",
                            "transition-all duration-200 cursor-pointer",
                            "hover:bg-white/70",
                            isActive
                              ? "bg-white/80 shadow-inner"
                              : "bg-white/40"
                          )}
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
