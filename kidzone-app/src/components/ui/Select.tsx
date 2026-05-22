"use client";

import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      )}
      <select
        {...props}
        className={clsx(
          "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)] focus:border-transparent",
          "disabled:bg-[var(--color-surface)] disabled:cursor-not-allowed",
          error && "border-[var(--color-red-accent)]",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--color-red-accent)]">{error}</p>}
    </div>
  );
}
