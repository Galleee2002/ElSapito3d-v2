import { useEffect, useState } from "react";
import { cn } from "@/utils";

type ProductModelViewerVariant = "card" | "detail";

interface ProductModelViewerProps {
  src?: string;
  poster?: string;
  alt: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  variant?: ProductModelViewerVariant;
}

const getAspectClasses = (variant: ProductModelViewerVariant): string => {
  if (variant === "detail") {
    return "aspect-[16/10] sm:aspect-[16/9]";
  }

  return "aspect-[4/3] sm:aspect-square";
};

const ProductModelViewer = ({
  src,
  poster,
  alt,
  autoRotate = true,
  cameraControls,
  ar = false,
  variant = "card",
}: ProductModelViewerProps) => {
  const isDetailVariant = variant === "detail";
  const [isLoading, setIsLoading] = useState<boolean>(
    isDetailVariant && Boolean(src)
  );
  const [hasError, setHasError] = useState<boolean>(
    isDetailVariant ? !src : false
  );
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(autoRotate);

  useEffect(() => {
    const hasSrc = Boolean(src);
    const shouldLoadModel = isDetailVariant && hasSrc;
    setIsLoading(shouldLoadModel);
    setHasError(isDetailVariant ? !hasSrc : false);
  }, [isDetailVariant, src]);

  useEffect(() => {
    setIsAutoRotating(autoRotate);
  }, [autoRotate]);

  const handleModelLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleModelError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const hasModelSource = isDetailVariant && Boolean(src) && !hasError;
  const shouldShowStaticPreview = !isDetailVariant;
  const effectiveCameraControls =
    cameraControls ?? (variant === "detail" ? true : false);
  const disableZoom = variant === "card";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border-2 border-[var(--color-border-base)] bg-white",
        getAspectClasses(variant)
      )}
    >
      {shouldShowStaticPreview ? (
        poster ? (
          <img
            src={poster}
            alt={alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--color-bg-soft)] px-4 text-center">
            <p className="text-sm text-[var(--color-border-base)]/75">
              Imagen no disponible
            </p>
          </div>
        )
      ) : hasModelSource ? (
        <model-viewer
          src={src}
          poster={poster}
          alt={alt}
          ar={ar}
          ar-modes="webxr scene-viewer quick-look"
          camera-controls={effectiveCameraControls}
          auto-rotate={isAutoRotating}
          rotation-per-second={variant === "detail" ? "30deg" : "20deg"}
          exposure="1"
          environment-image="neutral"
          shadow-intensity="0.8"
          disable-zoom={disableZoom}
          field-of-view="45deg"
          min-field-of-view="25deg"
          max-field-of-view="65deg"
          interaction-prompt="none"
          touch-action="pan-y"
          camera-orbit="0deg 75deg auto"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto auto"
          onLoad={handleModelLoad}
          onError={handleModelError}
          className="h-full w-full"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--color-bg-soft)] px-4 text-center">
          {poster ? (
            <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-[var(--color-border-base)] bg-white">
              <img
                src={poster}
                alt={alt}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <p className="text-sm text-[var(--color-border-base)]/75">
            Vista 3D no disponible
          </p>
        </div>
      )}

      {isDetailVariant && isLoading && (
        <div className="pointer-events-none absolute inset-0 flex w-full items-center justify-center bg-white/70">
          <div className="h-5/6 w-5/6 animate-pulse rounded-2xl bg-[var(--color-border-base)]/10" />
        </div>
      )}

      {variant === "detail" && hasModelSource && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            className="pointer-events-auto rounded-full border border-[var(--color-border-base)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-border-base)] shadow-sm transition-colors hover:bg-[var(--color-border-base)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-base)]"
          >
            {isAutoRotating ? "Pausar giro" : "Reanudar giro"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductModelViewer;
