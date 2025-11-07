interface ColorChipProps {
  color: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  Verde: "#8bd741",
  Azul: "#274c9a",
  Rojo: "#e23c3c",
  Amarillo: "#ffec3d",
  Blanco: "#ffffff",
  Negro: "#121212",
  Gris: "#808080",
  Rosa: "#ff69b4",
};

const ColorChip = ({ color, className = "" }: ColorChipProps) => {
  const colorHex = colorMap[color] || color;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-frog-green)]/10 border-2 border-[var(--color-border-blue)] text-[var(--color-border-blue)] ${className}`}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <span
        className="w-4 h-4 rounded-full border border-[var(--color-border-blue)]/30"
        style={{ backgroundColor: colorHex }}
        aria-label={`Color ${color}`}
      />
      {color}
    </span>
  );
};

export default ColorChip;

