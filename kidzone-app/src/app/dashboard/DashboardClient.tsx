"use client";

import { useEffect, useState } from "react";
import { FiUsers, FiLogIn, FiLogOut, FiCalendar, FiSmile } from "react-icons/fi";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { StaffSession } from "@/lib/auth";
import { getRoleColor } from "@/lib/rbac";
import { format } from "date-fns";

interface Stats {
  checked_in_today: number;
  checked_out_today: number;
  total_children: number;
  active_staff: number;
  upcoming_events: number;
  duty_manager: {
    staff_id: number;
    full_name: string;
    role_name: string;
    permission_level: number;
  };
}

export function DashboardClient({ session }: { session: StaffSession }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const roleColor = getRoleColor(session.role_name) as "blue" | "pink" | "yellow" | "purple" | "red";

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Personalised greeting – pulled dynamically from session, never hardcoded */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Good {getTimeOfDay()},{" "}
              <span className="text-[var(--color-purple-accent)]">{session.full_name}</span> 👋
            </h1>
            <p className="text-[var(--color-muted)] mt-1">
              {format(new Date(), "EEEE, dd MMMM yyyy")} &bull;{" "}
              <span className="font-medium">Manager on Duty</span>
            </p>
          </div>
          <Badge color={roleColor} className="text-sm px-3 py-1">
            {session.role_name}
          </Badge>
        </div>
      </div>

      {/* Duty Card */}
      <Card accent="purple" className="mb-8 bg-gradient-to-r from-[var(--color-purple-soft)] to-[var(--color-blue-soft)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-bold text-[var(--color-purple-accent)]">
            {session.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium">
              Event Managed By
            </p>
            <p className="text-lg font-bold text-[var(--color-text)]">{session.full_name}</p>
            <p className="text-sm text-[var(--color-muted)]">{session.role_name} &bull; ID #{session.staff_id}</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Checked In Today" value={stats.checked_in_today} icon={<FiLogIn />} color="blue" />
          <StatCard label="Checked Out Today" value={stats.checked_out_today} icon={<FiLogOut />} color="pink" />
          <StatCard label="Total Children" value={stats.total_children} icon={<FiSmile />} color="yellow" />
          <StatCard label="Active Staff" value={stats.active_staff} icon={<FiUsers />} color="purple" />
          <StatCard label="Upcoming Events" value={stats.upcoming_events} icon={<FiCalendar />} color="red" />
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <QuickAction
          href="/check-in"
          color="blue"
          title="Child Check-In"
          description="Record a child's arrival and log the attending staff member."
        />
        <QuickAction
          href="/check-out"
          color="pink"
          title="Safe-Exit / Check-Out"
          description="Verify guardian identity and approve child release. Audit trail captured."
        />
        <QuickAction
          href="/attendance"
          color="yellow"
          title="Attendance Log"
          description="Browse today's check-in & check-out records with full staff audit."
        />
        {session.permission_level >= 2 && (
          <QuickAction
            href="/admin/events"
            color="purple"
            title="Manage Events"
            description="Create and assign events. Manager field is always dynamic."
          />
        )}
        {session.permission_level >= 3 && (
          <>
            <QuickAction
              href="/admin/staff"
              color="red"
              title="Staff Directory"
              description="Add, edit, or deactivate staff members and assign roles."
            />
            <QuickAction
              href="/admin/roles"
              color="purple"
              title="Roles & Permissions"
              description="Configure role names and permission levels."
            />
          </>
        )}
      </div>
    </main>
  );
}

function QuickAction({ href, color, title, description }: {
  href: string;
  color: "blue" | "pink" | "yellow" | "purple" | "red";
  title: string;
  description: string;
}) {
  const bgMap = {
    blue:   "hover:border-[var(--color-blue-mid)]   hover:bg-[var(--color-blue-soft)]",
    pink:   "hover:border-[var(--color-pink-mid)]   hover:bg-[var(--color-pink-soft)]",
    yellow: "hover:border-[var(--color-yellow-mid)] hover:bg-[var(--color-yellow-soft)]",
    purple: "hover:border-[var(--color-purple-mid)] hover:bg-[var(--color-purple-soft)]",
    red:    "hover:border-[var(--color-red-mid)]    hover:bg-[var(--color-red-soft)]",
  };

  return (
    <a
      href={href}
      className={`group block bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-5 transition-all ${bgMap[color]}`}
    >
      <h3 className="font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-muted)] leading-relaxed">{description}</p>
    </a>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
