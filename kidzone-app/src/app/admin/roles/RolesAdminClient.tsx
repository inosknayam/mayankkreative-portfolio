"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiShield } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Role {
  role_id: number;
  role_name: string;
  permission_level: number;
  _count: { staff_users: number };
}

const permColors = ["", "pink", "blue", "purple", "yellow", "red"] as const;
const emptyForm  = { role_name: "", permission_level: "1" };

export function RolesAdminClient() {
  const [roles,   setRoles]   = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/roles").then((r) => r.json());
    if (res.success) setRoles(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...emptyForm });
    setEditing(null);
    setModal("add");
  }

  function openEdit(r: Role) {
    setForm({ role_name: r.role_name, permission_level: String(r.permission_level) });
    setEditing(r);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.role_name) return toast.error("Role name is required.");
    setSaving(true);
    try {
      const payload = { role_name: form.role_name.trim(), permission_level: parseInt(form.permission_level) };
      const res = editing
        ? await fetch(`/api/roles/${editing.role_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Save failed."); return; }
      toast.success(editing ? "Role updated." : "Role created.");
      setModal(null);
      load();
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: Role) {
    if (!confirm(`Delete role "${r.role_name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/roles/${r.role_id}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? "Delete failed."); return; }
    toast.success("Role deleted.");
    load();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Roles &amp; Permissions</h1>
        <Button onClick={openAdd} size="sm">
          <FiPlus size={16} /> Add Role
        </Button>
      </div>

      <div className="mb-4 p-4 rounded-2xl bg-[var(--color-yellow-soft)] border border-[var(--color-yellow-muted)] text-sm text-[var(--color-text)]">
        <strong>Note:</strong> Role names and permission levels are fully configurable.
        No staff names or roles are hardcoded in the application.
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Roles</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-14 rounded-xl bg-[var(--color-border)] animate-pulse" />)}
          </div>
        ) : roles.length === 0 ? (
          <p className="text-center py-8 text-[var(--color-muted)]">No roles configured yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {roles.map((r) => {
              const color = permColors[Math.min(r.permission_level, permColors.length - 1)];
              return (
                <li key={r.role_id} className="py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-purple-soft)] flex items-center justify-center">
                    <FiShield className="text-[var(--color-purple-accent)]" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--color-text)]">{r.role_name}</p>
                      <Badge color={color || "purple"}>Level {r.permission_level}</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-muted)]">
                      {r._count.staff_users} staff member{r._count.staff_users !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                      <FiEdit2 size={14} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(r)}
                      disabled={r._count.staff_users > 0}
                      title={r._count.staff_users > 0 ? "Cannot delete – staff assigned" : "Delete role"}
                    >
                      <FiTrash2 size={14} />
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
        title={modal === "add" ? "Add Role" : "Edit Role"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Role Name *"
            value={form.role_name}
            onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))}
            placeholder="e.g. Branch Manager"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text)]">
              Permission Level * <span className="text-[var(--color-muted)] font-normal">(higher = more access)</span>
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.permission_level}
              onChange={(e) => setForm((f) => ({ ...f, permission_level: e.target.value }))}
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {modal === "add" ? "Create Role" : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
