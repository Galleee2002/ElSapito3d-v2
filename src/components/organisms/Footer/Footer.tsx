import { CreditCard, Building2, Smartphone } from "lucide-react";
import { SocialIcon, LogoMark } from "@/components/atoms";
import { LinkColumn, ContactBlock } from "@/components/molecules";
import { cn } from "@/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const serviciosLinks = [
    { label: "Impresión FDM/Resina", href: "/productos?tipo=fdm" },
    { label: "Prototipado", href: "/productos?tipo=prototipado" },
    { label: "Personalización", href: "/productos?tipo=personalizado" },
    { label: "Express 48h", href: "/productos?tipo=express" },
  ];

  const contactItems = [
    {
      label: "Email",
      value: "hola@elsapito3d.com",
      href: "mailto:hola@elsapito3d.com",
    },
    {
      label: "WhatsApp",
      value: "+54 11 1234-5678",
      href: "https://wa.me/541112345678",
    },
    {
      label: "Horario",
      value: "Lun-Vie: 9:00 - 18:00",
    },
  ];

  const socialLinks = [
    {
      href: "https://instagram.com/elsapito3d",
      label: "Instagram",
      icon: (
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      href: "https://tiktok.com/@elsapito3d",
      label: "TikTok",
      icon: (
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
    },
    {
      href: "https://youtube.com/@elsapito3d",
      label: "YouTube",
      icon: (
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      id="ubicacion"
      className={cn(
        "bg-[#1a1a1a] text-white rounded-t-2xl shadow-2xl",
        className
      )}
    >
      {/* Top Section: Branding + Navigation + Contact */}
      <div className="px-4 sm:px-5 md:px-6 py-6 sm:py-7 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8 mb-6">
            {/* Branding */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <LogoMark size="sm" />
                <div>
                  <h2
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-baloo)" }}
                  >
                    ElSapito3D
                  </h2>
                  <p className="text-sm text-gray-400">
                    Impresión 3D creativa y eco
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <SocialIcon
                    key={social.href}
                    href={social.href}
                    icon={social.icon}
                    label={social.label}
                  />
                ))}
              </div>
            </div>

            {/* Servicios */}
            <LinkColumn
              title="Servicios"
              links={serviciosLinks}
              gradientColor="var(--color-bouncy-lemon)"
            />

            {/* Contact Block */}
            <div>
              <div className="mb-2.5">
                <span
                  className="inline-block py-0.5 rounded-md text-sm font-semibold"
                  style={{
                    fontFamily: "var(--font-baloo)",
                    background: `linear-gradient(135deg, var(--color-frog-green)20, var(--color-frog-green)40)`,
                    color: "var(--color-frog-green)",
                  }}
                >
                  Contacto
                </span>
              </div>
              <ContactBlock items={contactItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Legales */}
      <div className="px-4 sm:px-5 md:px-6 py-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-base text-gray-400">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <span>
                © {currentYear} ElSapito3D. Todos los derechos reservados.
              </span>
              <span className="hidden md:inline">•</span>
              <span>CUIT: 20-12345678-9</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Métodos de pago:</span>
              <div className="flex items-center gap-3">
                <CreditCard
                  className="w-5 h-5 text-gray-400"
                  aria-label="Tarjeta de crédito"
                />
                <Building2
                  className="w-5 h-5 text-gray-400"
                  aria-label="Transferencia bancaria"
                />
                <Smartphone
                  className="w-5 h-5 text-gray-400"
                  aria-label="Pago móvil"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
