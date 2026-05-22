'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ActiveCheckIn = {
  check_in_id: number;
  pickup_code: string;
  child_name: string;
  guardian_name: string;
  guardian_phone: string;
  event_name: string;
};

export default function SafeExitPage() {
  const { staff } = useAuth();
  const [list, setList] = useState<ActiveCheckIn[]>([]);
  const [selected, setSelected] = useState<ActiveCheckIn | null>(null);
  const [pickupCode, setPickupCode] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api<ActiveCheckIn[]>('/check-ins/active').then(setList).catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async () => {
    if (!selected) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const res = await api<{
        released: boolean;
        verifiedBy: number;
        verifiedByName: string;
      }>('/safe-exit/approve', {
        method: 'POST',
        body: JSON.stringify({
          checkInId: selected.check_in_id,
          pickupCode,
          guardianPhone: guardianPhone || undefined,
        }),
      });
      setMessage(
        `Match approved. Released by ${res.verifiedByName} (staff_id: ${res.verifiedBy})`
      );
      setSelected(null);
      setPickupCode('');
      setGuardianPhone('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Safe Exit</h2>
      <p className="text-sm text-ink-muted">
        Verifying release as <strong>{staff?.fullName}</strong>. Audit logs store your{' '}
        <code className="text-xs bg-soft-pink px-1 rounded">staff_id</code>, not a text name.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4 space-y-2">
          <h3 className="font-semibold">Children checked in</h3>
          {list.length === 0 && (
            <p className="text-sm text-ink-muted">No active check-ins</p>
          )}
          {list.map((row) => (
            <button
              key={row.check_in_id}
              type="button"
              onClick={() => {
                setSelected(row);
                setPickupCode('');
                setGuardianPhone(row.guardian_phone);
              }}
              className={`w-full text-left p-3 rounded-lg transition ${
                selected?.check_in_id === row.check_in_id
                  ? 'bg-soft-purple/80'
                  : 'bg-soft-blue/50 hover:bg-soft-blue'
              }`}
            >
              <p className="font-medium">{row.child_name}</p>
              <p className="text-xs text-ink-muted">
                {row.event_name} · Guardian: {row.guardian_name}
              </p>
            </button>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          {selected ? (
            <>
              <h3 className="font-semibold">Match approval — {selected.child_name}</h3>
              <label className="block space-y-1">
                <span className="text-sm">Pickup code</span>
                <input
                  className="input-field font-mono uppercase"
                  value={pickupCode}
                  onChange={(e) => setPickupCode(e.target.value)}
                  placeholder="Enter code"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm">Guardian phone (optional verify)</span>
                <input
                  className="input-field"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                />
              </label>
              {error && <p className="badge-red text-sm px-3 py-2 rounded-lg">{error}</p>}
              {message && <p className="badge-yellow text-sm px-3 py-2 rounded-lg">{message}</p>}
              <button
                type="button"
                className="btn-danger w-full"
                disabled={busy || !pickupCode}
                onClick={approve}
              >
                Match Approved — Release Child
              </button>
            </>
          ) : (
            <p className="text-ink-muted text-sm">Select a child to begin safe-exit verification</p>
          )}
        </div>
      </div>
    </div>
  );
}
