import { cn } from "@/utils";

interface VideoSectionProps {
  videoUrl: string;
  className?: string;
}

const VideoSection = ({ videoUrl, className }: VideoSectionProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-6xl mx-auto",
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)]">
        <iframe
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video sobre nuestros servicios"
        />
      </div>
    </div>
  );
};

export default VideoSection;

