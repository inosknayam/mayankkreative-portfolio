import type { ReactNode } from "react";
import { clsx } from "clsx";

type Color = "blue" | "pink" | "yellow" | "purple" | "red";

const colorMap: Record<Color, { bg: string; icon: string; value: string }> = {
  blue:   { bg: "bg-[var(--color-blue-soft)]",   icon: "text-[var(--color-blue-accent)]",   value: "text-[#1D4ED8]" },
  pink:   { bg: "bg-[var(--color-pink-soft)]",   icon: "text-[var(--color-pink-accent)]",   value: "text-[#9D174D]" },
  yellow: { bg: "bg-[var(--color-yellow-soft)]", icon: "text-[var(--color-yellow-accent)]", value: "text-[#92400E]" },
  purple: { bg: "bg-[var(--color-purple-soft)]", icon: "text-[var(--color-purple-accent)]", value: "text-[#5B21B6]" },
  red:    { bg: "bg-[var(--color-red-soft)]",    icon: "text-[var(--color-red-accent)]",    value: "text-[#991B1B]" },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: Color;
  className?: string;
}

export function StatCard({ label, value, icon, color = "purple", className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx("bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-5 flex items-center gap-4", className)}>
      <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", c.bg)}>
        <span className={clsx("text-xl", c.icon)}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium">{label}</p>
        <p className={clsx("text-2xl font-bold mt-0.5", c.value)}>{value}</p>
      </div>
    </div>
  );
}
