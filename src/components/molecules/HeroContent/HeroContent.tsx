import { Button, Heading, Text } from "@/components";

interface HeroContentProps {
  title: string;
  description: string;
  ctaText: string;
  onCtaClick?: () => void;
}

const HeroContent = ({
  title,
  description,
  ctaText,
  onCtaClick,
}: HeroContentProps) => {
  return (
    <div className="flex flex-col items-center md:items-start gap-4 md:gap-6 max-w-full md:max-w-2xl lg:max-w-3xl px-4 md:px-0">
      <Heading level={1} className="text-white text-center md:text-left leading-tight">
        {title}
      </Heading>
      <Text size="xl" weight="normal" className="text-white/90 text-center md:text-left max-w-xl md:max-w-none">
        {description}
      </Text>
      <Button variant="highlight" size="md" onClick={onCtaClick} className="md:!px-8 md:!py-4 md:!text-lg">
        {ctaText}
      </Button>
    </div>
  );
};

export default HeroContent;

