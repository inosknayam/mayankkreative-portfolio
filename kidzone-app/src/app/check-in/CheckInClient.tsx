"use client";

import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { StaffSession } from "@/lib/auth";

interface Child {
  child_id: number;
  full_name: string;
  guardian_name: string;
  guardian_phone: string;
}

interface Event {
  event_id: number;
  event_name: string;
}

export function CheckInClient({ session }: { session: StaffSession }) {
  const [query,    setQuery]    = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [events,   setEvents]   = useState<Event[]>([]);
  const [selected, setSelected] = useState<Child | null>(null);
  const [eventId,  setEventId]  = useState<number | "">("");
  const [notes,    setNotes]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then((d) => {
      if (d.success) {
        setEvents(d.data.filter((e: { status: string }) => ["UPCOMING","ONGOING"].includes(e.status)));
      }
    });
  }, []);

  async function searchChildren(q: string) {
    if (q.trim().length < 2) { setChildren([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/children?q=${encodeURIComponent(q)}&active=true`);
      const d = await res.json();
      if (d.success) setChildren(d.data);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => searchChildren(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  async function handleCheckIn(e: FormEvent) {
    e.preventDefault();
    if (!selected) return toast.error("Please select a child.");
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: selected.child_id,
          ...(eventId ? { event_id: Number(eventId) } : {}),
          ...(notes ? { notes } : {}),
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Check-in failed."); return; }
      toast.success(`${selected.full_name} checked in successfully!`);
      setSelected(null);
      setQuery("");
      setChildren([]);
      setEventId("");
      setNotes("");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Staff on duty – dynamic, never hardcoded */}
      <div className="mb-6 p-4 rounded-2xl bg-[var(--color-blue-soft)] border border-[var(--color-blue-muted)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-blue-mid)] flex items-center justify-center text-white font-bold">
          {session.full_name.charAt(0)}
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Staff on Duty</p>
          <p className="font-semibold text-[var(--color-text)]">{session.full_name}</p>
          <Badge color="blue">{session.role_name}</Badge>
        </div>
      </div>

      <Card accent="blue">
        <CardHeader>
          <CardTitle>Child Check-In</CardTitle>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Search for a child, then confirm arrival. Your staff ID will be recorded automatically.
          </p>
        </CardHeader>

        <div className="space-y-5">
          {/* Search */}
          <div>
            <Input
              label="Search Child"
              placeholder="Name, guardian name, or phone…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              icon={searching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : <FiSearch size={16} />}
            />

            {children.length > 0 && !selected && (
              <ul className="mt-2 rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] bg-white shadow-md">
                {children.map((c) => (
                  <li key={c.child_id}>
                    <button
                      type="button"
                      onClick={() => { setSelected(c); setQuery(c.full_name); setChildren([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--color-blue-soft)] transition-colors"
                    >
                      <p className="font-medium text-sm">{c.full_name}</p>
                      <p className="text-xs text-[var(--color-muted)]">Guardian: {c.guardian_name} · {c.guardian_phone}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected child summary */}
          {selected && (
            <div className="rounded-xl bg-[var(--color-blue-soft)] border border-[var(--color-blue-muted)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-blue-accent)] text-white flex items-center justify-center font-bold">
                {selected.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{selected.full_name}</p>
                <p className="text-xs text-[var(--color-muted)]">Guardian: {selected.guardian_name}</p>
              </div>
              <FiCheck className="text-[var(--color-blue-accent)]" size={20} />
            </div>
          )}

          {/* Event assignment */}
          {events.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text)]">Link to Event (optional)</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)]"
              >
                <option value="">No event</option>
                {events.map((ev) => (
                  <option key={ev.event_id} value={ev.event_id}>{ev.event_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text)]">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes…"
              rows={2}
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)]"
            />
          </div>

          <Button
            onClick={handleCheckIn as unknown as React.MouseEventHandler}
            loading={loading}
            disabled={!selected}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            Confirm Check-In
          </Button>
        </div>
      </Card>
    </main>
  );
}
