import { clsx } from "clsx";

type Color = "blue" | "pink" | "yellow" | "purple" | "red" | "green";

const colorStyles: Record<Color, string> = {
  blue:   "bg-[var(--color-blue-muted)] text-[#1D4ED8]",
  pink:   "bg-[var(--color-pink-muted)] text-[#9D174D]",
  yellow: "bg-[var(--color-yellow-muted)] text-[#92400E]",
  purple: "bg-[var(--color-purple-muted)] text-[#5B21B6]",
  red:    "bg-[var(--color-red-muted)] text-[#991B1B]",
  green:  "bg-green-100 text-green-700",
};

interface BadgeProps {
  color?: Color;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ color = "purple", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorStyles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
