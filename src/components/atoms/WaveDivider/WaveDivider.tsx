import { cn } from "@/utils";

export interface WaveDividerProps {
  position?: "top" | "bottom";
  height?: number;
  className?: string;
  colorClass?: string;
  flipX?: boolean;
  flipY?: boolean;
  gradient?: { from: string; to: string; id?: string } | false;
}

const WaveDivider = ({
  position = "bottom",
  height = 80,
  className,
  colorClass = "text-gray-100 dark:text-zinc-900",
  flipX = false,
  flipY = false,
  gradient = false,
}: WaveDividerProps) => {
  const gradientId = gradient
    ? gradient.id ||
      `wave-gradient-${Math.random().toString(36).substring(2, 11)}`
    : undefined;

  const transformStyle: React.CSSProperties = {};
  if (flipX || flipY) {
    const transforms: string[] = [];
    if (flipX) transforms.push("scaleX(-1)");
    if (flipY) transforms.push("scaleY(-1)");
    transformStyle.transform = transforms.join(" ");
  }

  return (
    <div
      className={cn(
        "w-full left-0 right-0 z-0",
        position === "top" ? "absolute top-0" : "absolute bottom-0",
        className
      )}
      style={{ height: `${height}px` }}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={cn("w-full h-full block", colorClass)}
        style={transformStyle}
        role="img"
        aria-hidden="true"
      >
        {gradient && gradientId && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
          </defs>
        )}
        <path
          d="M0,50 C360,0 720,0 1080,50 C1200,70 1320,70 1440,50 L1440,100 L0,100 Z"
          fill={gradient && gradientId ? `url(#${gradientId})` : "currentColor"}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
