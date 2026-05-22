"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { Badge } from "./ui/Badge";
import type { StaffSession } from "@/lib/auth";
import { getRoleColor } from "@/lib/rbac";

interface NavbarProps {
  session: StaffSession;
}

const navLinks = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/check-in",    label: "Check-In" },
  { href: "/check-out",   label: "Check-Out" },
  { href: "/attendance",  label: "Attendance" },
];

const adminLinks = [
  { href: "/admin/staff",    label: "Staff", minLevel: 3 },
  { href: "/admin/roles",    label: "Roles",  minLevel: 3 },
  { href: "/admin/children", label: "Children", minLevel: 2 },
  { href: "/admin/events",   label: "Events",   minLevel: 2 },
];

export function Navbar({ session }: NavbarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const roleColor = getRoleColor(session.role_name) as "blue" | "pink" | "yellow" | "purple" | "red";

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    toast.success("Logged out successfully.");
    router.push("/");
    router.refresh();
  }

  const visibleAdminLinks = adminLinks.filter(
    (l) => session.permission_level >= l.minLevel
  );

  function NavLink({ href, label }: { href: string; label: string }) {
    const active = pathname.startsWith(href);
    return (
      <a
        href={href}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-[var(--color-purple-soft)] text-[var(--color-purple-accent)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
        }`}
      >
        {label}
      </a>
    );
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-purple-mid)] to-[var(--color-blue-mid)] flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="font-bold text-[var(--color-text)]">KidZone</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => <NavLink key={l.href} {...l} />)}
            {visibleAdminLinks.map((l) => <NavLink key={l.href} href={l.href} label={l.label} />)}
          </div>

          {/* Staff info + logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--color-text)]">{session.full_name}</p>
              <Badge color={roleColor}>{session.role_name}</Badge>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-red-accent)] hover:bg-[var(--color-red-soft)] transition-colors"
              title="Log out"
            >
              <FiLogOut size={18} />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[var(--color-muted)]"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-4 py-3 space-y-1">
          {[...navLinks, ...visibleAdminLinks].map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{session.full_name}</p>
              <Badge color={roleColor}>{session.role_name}</Badge>
            </div>
            <button onClick={handleLogout} className="text-[var(--color-red-accent)] p-2">
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
