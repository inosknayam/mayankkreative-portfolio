"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiCalendar } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { format } from "date-fns";

interface Staff {
  staff_id: number;
  full_name: string;
  role: { role_name: string };
}

interface Event {
  event_id: number;
  event_name: string;
  event_date: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  location?: string;
  description?: string;
  managed_by: number;
  manager: Staff;
  _count: { attendance: number };
}

const statusColors = {
  UPCOMING:  "blue",
  ONGOING:   "green",
  COMPLETED: "purple",
  CANCELLED: "red",
} as const;

const emptyForm = {
  event_name: "", event_date: "", managed_by: "", location: "", description: "", status: "UPCOMING",
};

export function EventsAdminClient() {
  const [events,  setEvents]  = useState<Event[]>([]);
  const [staff,   setStaff]   = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);

  async function load() {
    setLoading(true);
    const [er, sr] = await Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/staff?status=ACTIVE").then((r) => r.json()),
    ]);
    if (er.success) setEvents(er.data);
    if (sr.success) setStaff(sr.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...emptyForm });
    setEditing(null);
    setModal("add");
  }

  function openEdit(ev: Event) {
    setForm({
      event_name:  ev.event_name,
      event_date:  ev.event_date.split("T")[0],
      managed_by:  String(ev.managed_by),
      location:    ev.location ?? "",
      description: ev.description ?? "",
      status:      ev.status,
    });
    setEditing(ev);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.event_name || !form.event_date || !form.managed_by) {
      return toast.error("Fill in all required fields.");
    }
    setSaving(true);
    try {
      const payload = {
        event_name:  form.event_name.trim(),
        event_date:  form.event_date,
        managed_by:  parseInt(form.managed_by),
        location:    form.location || undefined,
        description: form.description || undefined,
        status:      form.status,
      };
      const res = editing
        ? await fetch(`/api/events/${editing.event_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Save failed."); return; }
      toast.success(editing ? "Event updated." : "Event created.");
      setModal(null);
      load();
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Events</h1>
        <Button onClick={openAdd} size="sm"><FiPlus size={16} /> Create Event</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{events.length} event{events.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[var(--color-border)] animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center py-10 text-[var(--color-muted)]">No events yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {events.map((ev) => (
              <li key={ev.event_id} className="py-4 flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-purple-soft)] flex items-center justify-center">
                  <FiCalendar className="text-[var(--color-purple-accent)]" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[var(--color-text)]">{ev.event_name}</p>
                    <Badge color={statusColors[ev.status]}>{ev.status}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    {format(new Date(ev.event_date), "dd MMM yyyy")} ·{" "}
                    Managed by <strong>{ev.manager.full_name}</strong> ({ev.manager.role.role_name}) ·{" "}
                    {ev._count.attendance} attendee{ev._count.attendance !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(ev)}><FiEdit2 size={14} /></Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Create Event" : "Edit Event"}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Event Name *" value={form.event_name} onChange={(e) => setForm((f) => ({ ...f, event_name: e.target.value }))} placeholder="e.g. Summer Fun Day" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={[
                { value: "UPCOMING",  label: "Upcoming" },
                { value: "ONGOING",   label: "Ongoing" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>
          {/* Manager field – always dynamic, pulled from staff_users table */}
          <Select
            label="Event Manager (Event Managed By) *"
            value={form.managed_by}
            onChange={(e) => setForm((f) => ({ ...f, managed_by: e.target.value }))}
            placeholder="Select a staff member…"
            options={staff.map((s) => ({ value: s.staff_id, label: `${s.full_name} – ${s.role.role_name}` }))}
          />
          <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Branch / venue name" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {modal === "add" ? "Create Event" : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
