import { cn } from "@/utils";

interface MapEmbedProps {
  src: string;
  className?: string;
  title?: string;
}

const MapEmbed = ({
  src,
  className = "",
  title = "Ubicación",
}: MapEmbedProps) => {
  return (
    <div
      className={cn(
        "w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-xl overflow-hidden",
        "border-2 border-gray-700 shadow-lg",
        className
      )}
    >
      <iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />
    </div>
  );
};

export default MapEmbed;

