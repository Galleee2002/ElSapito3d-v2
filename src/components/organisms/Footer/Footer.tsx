import { LogoMark } from "@/components/atoms";
import { LinkColumn, ContactBlock } from "@/components/molecules";
import { cn } from "@/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const serviciosLinks = [
    { label: "Impresión 3D FDM" },
    { label: "Atención Personalizada" },
    { label: "Servicio Customizado" },
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

  return (
    <footer
      id="ubicacion"
      className={cn("bg-[#1a1a1a] text-white shadow-2xl", className)}
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
                  <p className="text-sm text-gray-400">Impresión 3D creativa</p>
                </div>
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
        <div className="max-w-7xl mx-auto ">
          <div className="flex flex-col md:flex-row justify-center items-center text-base text-gray-400">
            <div className="flex flex-col md:flex-row items-center justify-center md:gap-4">
              <span>
                © {currentYear} ElSapito3D. Todos los derechos reservados.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
