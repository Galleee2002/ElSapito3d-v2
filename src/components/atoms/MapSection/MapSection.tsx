import { cn } from "@/utils";

interface MapSectionProps {
  mapUrl: string;
  description?: string;
  className?: string;
}

const MapSection = ({ mapUrl, description, className }: MapSectionProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] mb-3">
        <iframe
          src={mapUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación"
        />
      </div>
      {description && (
        <p className="text-sm text-[var(--color-text)] opacity-70">
          {description}
        </p>
      )}
    </div>
  );
};

export default MapSection;

