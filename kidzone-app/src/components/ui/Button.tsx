"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "pink" | "yellow";
type Size    = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:   "bg-[var(--color-purple-accent)] text-white hover:bg-[#7C3AED] shadow-sm",
  secondary: "bg-[var(--color-blue-muted)] text-[#1D4ED8] hover:bg-[var(--color-blue-mid)]",
  danger:    "bg-[var(--color-red-muted)] text-[#991B1B] hover:bg-[var(--color-red-mid)]",
  ghost:     "bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-border)]",
  pink:      "bg-[var(--color-pink-muted)] text-[#9D174D] hover:bg-[var(--color-pink-mid)]",
  yellow:    "bg-[var(--color-yellow-muted)] text-[#92400E] hover:bg-[var(--color-yellow-mid)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
