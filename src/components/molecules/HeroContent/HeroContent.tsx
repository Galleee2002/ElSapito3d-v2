import { Button, Heading, Text } from "../../atoms";

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
    <div className="flex flex-col items-center md:items-start gap-6 max-w-3xl">
      <Heading level={1} className="text-white text-center md:text-left leading-tight">
        {title}
      </Heading>
      <Text size="xl" weight="normal" className="text-white/90 text-center md:text-left">
        {description}
      </Text>
      <Button variant="highlight" size="lg" onClick={onCtaClick}>
        {ctaText}
      </Button>
    </div>
  );
};

export default HeroContent;

