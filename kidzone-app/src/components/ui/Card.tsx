import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type Accent = "blue" | "pink" | "yellow" | "purple" | "red" | "none";

const accentStyles: Record<Accent, string> = {
  blue:   "border-t-4 border-t-[var(--color-blue-mid)]",
  pink:   "border-t-4 border-t-[var(--color-pink-mid)]",
  yellow: "border-t-4 border-t-[var(--color-yellow-mid)]",
  purple: "border-t-4 border-t-[var(--color-purple-mid)]",
  red:    "border-t-4 border-t-[var(--color-red-mid)]",
  none:   "",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
  children: ReactNode;
}

export function Card({ accent = "none", children, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        "bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6",
        accentStyles[accent],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={clsx("text-lg font-semibold text-[var(--color-text)]", className)}>
      {children}
    </h2>
  );
}
