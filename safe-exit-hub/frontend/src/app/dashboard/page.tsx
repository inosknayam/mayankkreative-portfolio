'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type DashboardData = {
  managerOnDuty: string;
  managerRole: string;
  eventManagedBy: string;
  activeEventName: string;
  loggedInAs: string;
  loggedInRole: string;
  active_check_ins: number;
  active_events: number;
};

export default function DashboardPage() {
  const { staff } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<DashboardData>('/dashboard')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {error && <p className="badge-red px-4 py-2 rounded-lg">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Manager on duty"
          value={data?.managerOnDuty ?? '—'}
          sub={data?.managerRole}
          color="badge-blue"
        />
        <StatCard
          label="Event managed by"
          value={data?.eventManagedBy ?? '—'}
          sub={data?.activeEventName}
          color="badge-pink"
        />
        <StatCard
          label="Your session"
          value={staff?.fullName ?? data?.loggedInAs ?? '—'}
          sub={staff?.roleName ?? data?.loggedInRole}
          color="badge-purple"
        />
        <StatCard
          label="Active check-ins"
          value={String(data?.active_check_ins ?? 0)}
          color="badge-yellow"
        />
        <StatCard
          label="Active events"
          value={String(data?.active_events ?? 0)}
          color="badge-red"
        />
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-2">Dynamic personalization</h3>
        <p className="text-sm text-ink-muted leading-relaxed">
          Labels such as &quot;Manager on duty&quot; and &quot;Event managed by&quot; are loaded from{' '}
          <code className="text-xs bg-soft-yellow px-1 rounded">staff_users.full_name</code> via the
          API — never hardcoded in the UI or backend logic.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`card p-5 ${color} bg-opacity-40`}>
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      {sub && <p className="text-sm text-ink-muted mt-1">{sub}</p>}
    </div>
  );
}
