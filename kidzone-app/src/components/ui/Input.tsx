"use client";

import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={clsx(
            "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)] focus:border-transparent",
            "disabled:bg-[var(--color-surface)] disabled:cursor-not-allowed",
            error && "border-[var(--color-red-accent)] focus:ring-[var(--color-red-mid)]",
            icon && "pl-10",
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-[var(--color-red-accent)]">{error}</p>}
    </div>
  );
}
