"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiUserX, FiUserCheck } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { getRoleColor } from "@/lib/rbac";

interface Role {
  role_id: number;
  role_name: string;
  permission_level: number;
}

interface StaffMember {
  staff_id: number;
  full_name: string;
  phone_number: string;
  account_status: "ACTIVE" | "INACTIVE";
  role: Role;
}

const emptyForm: { role_id: string; full_name: string; phone_number: string; account_status: "ACTIVE" | "INACTIVE" } = {
  role_id: "", full_name: "", phone_number: "", account_status: "ACTIVE",
};

export function StaffAdminClient() {
  const [staff,   setStaff]   = useState<StaffMember[]>([]);
  const [roles,   setRoles]   = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form,    setForm]    = useState<{ role_id: string; full_name: string; phone_number: string; account_status: "ACTIVE" | "INACTIVE" }>({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  async function load() {
    setLoading(true);
    const [sr, rr] = await Promise.all([
      fetch(`/api/staff?status=${statusFilter}`).then((r) => r.json()),
      fetch("/api/roles").then((r) => r.json()),
    ]);
    if (sr.success) setStaff(sr.data);
    if (rr.success) setRoles(rr.data);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [statusFilter]);

  function openAdd() {
    setForm({ ...emptyForm });
    setEditing(null);
    setModal("add");
  }

  function openEdit(s: StaffMember) {
    setForm({
      role_id:        String(s.role.role_id),
      full_name:      s.full_name,
      phone_number:   s.phone_number,
      account_status: s.account_status,
    });
    setEditing(s);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.full_name || !form.phone_number || !form.role_id) {
      return toast.error("Fill in all required fields.");
    }
    setSaving(true);
    try {
      const payload = {
        role_id:        parseInt(form.role_id),
        full_name:      form.full_name.trim(),
        phone_number:   form.phone_number.trim(),
        account_status: form.account_status,
      };

      const res = editing
        ? await fetch(`/api/staff/${editing.staff_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Save failed."); return; }

      toast.success(editing ? "Staff member updated." : "Staff member added.");
      setModal(null);
      load();
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(s: StaffMember) {
    const newStatus = s.account_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/staff/${s.staff_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_status: newStatus }),
    });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? "Update failed."); return; }
    toast.success(`${s.full_name} marked as ${newStatus.toLowerCase()}.`);
    load();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Staff Directory</h1>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <Button onClick={openAdd} size="sm">
            <FiPlus size={16} /> Add Staff
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{staff.length} staff member{staff.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[var(--color-border)] animate-pulse" />)}
          </div>
        ) : staff.length === 0 ? (
          <p className="text-center py-10 text-[var(--color-muted)]">No staff members found.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {staff.map((s) => {
              const rc = getRoleColor(s.role.role_name) as "blue" | "pink" | "yellow" | "purple" | "red";
              return (
                <li key={s.staff_id} className="py-4 flex flex-wrap items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-purple-soft)] flex items-center justify-center font-bold text-[var(--color-purple-accent)]">
                    {s.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)]">{s.full_name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{s.phone_number} · ID #{s.staff_id}</p>
                    <Badge color={rc}>{s.role.role_name}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                      <FiEdit2 size={14} />
                    </Button>
                    <Button
                      variant={s.account_status === "ACTIVE" ? "danger" : "secondary"}
                      size="sm"
                      onClick={() => toggleStatus(s)}
                      title={s.account_status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                    >
                      {s.account_status === "ACTIVE" ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Staff Member" : "Edit Staff Member"}
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            placeholder="e.g. Sarah Johnson"
          />
          <Input
            label="Phone Number (E.164) *"
            value={form.phone_number}
            onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            placeholder="+91XXXXXXXXXX"
            type="tel"
          />
          <Select
            label="Role *"
            value={form.role_id}
            onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
            placeholder="Select a role…"
            options={roles.map((r) => ({ value: r.role_id, label: `${r.role_name} (Level ${r.permission_level})` }))}
          />
          <Select
            label="Account Status"
            value={form.account_status}
            onChange={(e) => setForm((f) => ({ ...f, account_status: e.target.value as "ACTIVE" | "INACTIVE" }))}
            options={[
              { value: "ACTIVE",   label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {modal === "add" ? "Add Staff" : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
