import { motion } from "framer-motion";
import { HeroContent } from "../../molecules";
import { ImagesSlider } from "../../ui/images-slider";

interface HeroProps {
  title: string;
  description: string;
  ctaText: string;
  images: string[];
  onCtaClick?: () => void;
}

const Hero = ({
  title,
  description,
  ctaText,
  images,
  onCtaClick,
}: HeroProps) => {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      <ImagesSlider images={images} autoplay className="h-full">
        <motion.div
          initial={{
            opacity: 0,
            y: -80,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative z-10 h-full w-full flex items-center justify-center md:justify-start px-4 sm:px-6 md:px-12 lg:px-24"
        >
          <HeroContent
            title={title}
            description={description}
            ctaText={ctaText}
            onCtaClick={onCtaClick}
          />
        </motion.div>
      </ImagesSlider>
    </section>
  );
};

export default Hero;
