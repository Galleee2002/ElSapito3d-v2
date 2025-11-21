import { FooterLink } from "@/components/atoms";
import { cn } from "@/utils";

interface Link {
  label: string;
  href?: string;
  external?: boolean;
}

interface LinkColumnProps {
  title: string;
  links: Link[];
  className?: string;
  gradientColor?: string;
}

const LinkColumn = ({
  title,
  links,
  className,
  gradientColor = "var(--color-bouncy-lemon)",
}: LinkColumnProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h3
        className="text-base font-bold text-white mb-3 flex justify-center md:justify-start"
        style={{ fontFamily: "var(--font-baloo)" }}
      >
        <span
          className="inline-block px-2 py-0.5 rounded-md text-sm font-semibold mr-2"
          style={{
            background: `linear-gradient(135deg, ${gradientColor}20, ${gradientColor}40)`,
            color: gradientColor,
          }}
        >
          {title}
        </span>
      </h3>
      <ul className="space-y-1.5 flex flex-col items-center md:items-start">
        {links.map((link) => (
          <li key={link.href || link.label}>
            {link.href ? (
              <FooterLink href={link.href} external={link.external}>
                {link.label}
              </FooterLink>
            ) : (
              <span className="text-gray-400 text-sm">{link.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LinkColumn;
