import { FOCUS_VISIBLE_SHADOW } from "@/constants";
import { cn } from "@/utils";

interface ContactItem {
  label: string;
  value: string;
  href?: string;
  icon?: React.ReactNode;
}

interface ContactBlockProps {
  items: ContactItem[];
  className?: string;
}

const ContactBlock = ({ items, className = "" }: ContactBlockProps) => {
  return (
    <div className={cn("space-y-2.5", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2.5">
          {item.icon && (
            <span className="text-gray-400 mt-0.5 flex-shrink-0">
              {item.icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-0.5">{item.label}</p>
            {item.href ? (
              <a
                href={item.href}
                className={cn(
                  "text-base text-gray-300 hover:text-white transition-colors duration-200",
                  "focus-visible:outline-none rounded-md px-1 py-0.5",
                  FOCUS_VISIBLE_SHADOW
                )}
              >
                {item.value}
              </a>
            ) : (
              <p className="text-base text-gray-300">{item.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactBlock;

