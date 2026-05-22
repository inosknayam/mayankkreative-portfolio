"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";

interface Child {
  child_id: number;
  full_name: string;
  date_of_birth: string;
  guardian_name: string;
  guardian_phone: string;
  is_active: boolean;
  notes?: string;
}

const emptyForm = {
  full_name: "", date_of_birth: "", guardian_name: "", guardian_phone: "", notes: "",
};

export function ChildrenAdminClient() {
  const [children, setChildren] = useState<Child[]>([]);
  const [query,    setQuery]    = useState("");
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<"add" | "edit" | null>(null);
  const [editing,  setEditing]  = useState<Child | null>(null);
  const [form,     setForm]     = useState({ ...emptyForm });
  const [saving,   setSaving]   = useState(false);

  async function load(q = "") {
    setLoading(true);
    const url = q ? `/api/children?q=${encodeURIComponent(q)}` : "/api/children";
    const res = await fetch(url).then((r) => r.json());
    if (res.success) setChildren(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  function openAdd() {
    setForm({ ...emptyForm });
    setEditing(null);
    setModal("add");
  }

  function openEdit(c: Child) {
    setForm({
      full_name:     c.full_name,
      date_of_birth: c.date_of_birth.split("T")[0],
      guardian_name: c.guardian_name,
      guardian_phone: c.guardian_phone,
      notes:         c.notes ?? "",
    });
    setEditing(c);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.full_name || !form.date_of_birth || !form.guardian_name || !form.guardian_phone) {
      return toast.error("Fill in all required fields.");
    }
    setSaving(true);
    try {
      const payload = { ...form, date_of_birth: new Date(form.date_of_birth).toISOString() };
      const res = editing
        ? await fetch(`/api/children/${editing.child_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/children", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Save failed."); return; }
      toast.success(editing ? "Child updated." : "Child added.");
      setModal(null);
      load(query);
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Child) {
    const res = await fetch(`/api/children/${c.child_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    if (!res.ok) { toast.error("Update failed."); return; }
    toast.success(`${c.full_name} ${c.is_active ? "deactivated" : "reactivated"}.`);
    load(query);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Children Registry</h1>
        <Button onClick={openAdd} size="sm"><FiPlus size={16} /> Add Child</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, guardian, or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<FiSearch size={16} />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{children.length} children</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[var(--color-border)] animate-pulse" />)}
          </div>
        ) : children.length === 0 ? (
          <p className="text-center py-10 text-[var(--color-muted)]">No children found.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {children.map((c) => (
              <li key={c.child_id} className="py-4 flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-yellow-soft)] flex items-center justify-center font-bold text-[var(--color-yellow-accent)]">
                  {c.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[var(--color-text)]">{c.full_name}</p>
                    {!c.is_active && <Badge color="red">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    DOB: {format(new Date(c.date_of_birth), "dd MMM yyyy")} ·
                    Guardian: {c.guardian_name} · {c.guardian_phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><FiEdit2 size={14} /></Button>
                  <Button
                    variant={c.is_active ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => toggleActive(c)}
                  >
                    {c.is_active ? "Deactivate" : "Reactivate"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Child" : "Edit Child"}
        size="md"
      >
        <div className="space-y-4">
          <Input label="Full Name *" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Child's full name" />
          <Input label="Date of Birth *" type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} />
          <Input label="Guardian Name *" value={form.guardian_name} onChange={(e) => setForm((f) => ({ ...f, guardian_name: e.target.value }))} placeholder="Guardian's full name" />
          <Input label="Guardian Phone (E.164) *" type="tel" value={form.guardian_phone} onChange={(e) => setForm((f) => ({ ...f, guardian_phone: e.target.value }))} placeholder="+91XXXXXXXXXX" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Allergies, special needs, etc."
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {modal === "add" ? "Add Child" : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
