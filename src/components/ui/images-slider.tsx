import { cn } from "@/utils/cn";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import React, { useEffect, useState } from "react";

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
}: {
  images: string[];
  children?: React.ReactNode;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  className?: string;
  autoplay?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === images.length ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    setLoadedImages([images[0]]);

    // Cargar el resto en background
    const loadPromises = images.slice(1).map((image) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = image;
        img.onload = () => resolve(image);
        img.onerror = reject;
      });
    });

    Promise.all(loadPromises)
      .then((restImages) => {
        setLoadedImages([images[0], ...(restImages as string[])]);
      })
      .catch((error) => console.error("Failed to load images", error));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    let interval: ReturnType<typeof setInterval>;
    if (autoplay) {
      interval = setInterval(() => {
        handleNext();
      }, 4500);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentIndex]);

  const slideVariants = {
    initial: {
      scale: 1.1,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  };

  const areImagesLoaded = loadedImages.length > 0;

  return (
    <div
      className={cn(
        "overflow-hidden h-full w-full relative flex items-center justify-center bg-black",
        className
      )}
    >
      {areImagesLoaded && children}
      {areImagesLoaded && overlay && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/80 via-black/60 to-black/40 md:from-black/70 md:via-black/50 md:to-transparent z-[5]",
            overlayClassName
          )}
        />
      )}

      {areImagesLoaded && (
        <AnimatePresence initial={false}>
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="image h-full w-full absolute inset-0 object-cover object-center md:object-right z-0"
          />
        </AnimatePresence>
      )}
    </div>
  );
};
