'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Child = { child_id: number; full_name: string; guardian_name: string };
type Event = { event_id: number; event_name: string; status: string };

export default function CheckInPage() {
  const { staff } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [childId, setChildId] = useState('');
  const [eventId, setEventId] = useState('');
  const [result, setResult] = useState<{ pickupCode: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Child[]>('/children'),
      api<Event[]>('/events'),
    ]).then(([c, e]) => {
      setChildren(c);
      setEvents(e.filter((x) => x.status === 'ACTIVE'));
      if (c[0]) setChildId(String(c[0].child_id));
      if (e[0]) setEventId(String(e[0].event_id));
    });
  }, []);

  const submit = async () => {
    setError('');
    setResult(null);
    setBusy(true);
    try {
      const res = await api<{ checkInId: number; pickupCode: string }>('/check-ins', {
        method: 'POST',
        body: JSON.stringify({
          childId: Number(childId),
          eventId: Number(eventId),
        }),
      });
      setResult({ pickupCode: res.pickupCode });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold">Check-In</h2>
      <p className="text-sm text-ink-muted">
        Checking in as <strong>{staff?.fullName}</strong> ({staff?.roleName})
      </p>

      <div className="card p-6 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Child</span>
          <select
            className="input-field"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.child_id} value={c.child_id}>
                {c.full_name} — {c.guardian_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Event</span>
          <select
            className="input-field"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.event_id} value={e.event_id}>
                {e.event_name}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="badge-red px-3 py-2 rounded-lg text-sm">{error}</p>}

        {result && (
          <div className="badge-yellow px-4 py-3 rounded-lg">
            <p className="font-semibold">Pickup code</p>
            <p className="text-2xl font-mono tracking-widest">{result.pickupCode}</p>
          </div>
        )}

        <button type="button" className="btn-primary w-full" disabled={busy} onClick={submit}>
          Complete Check-In
        </button>
      </div>
    </div>
  );
}
