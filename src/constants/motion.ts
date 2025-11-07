export const motionVariants = {
  spring: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },
  springSoft: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  springBouncy: {
    type: "spring" as const,
    stiffness: 200,
    damping: 10,
  },
};

export const hoverVariants = {
  scale: { scale: 1.05, y: -2 },
  scaleSmall: { scale: 1.02 },
  scaleLarge: { scale: 1.1, y: -2 },
};

export const tapVariants = {
  scale: { scale: 0.95 },
  scaleSmall: { scale: 0.98 },
};

