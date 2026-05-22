'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Role = { role_id: number; role_name: string; permission_level: number };
type StaffUser = {
  staff_id: number;
  full_name: string;
  phone_number: string;
  account_status: string;
  role_name: string;
  permission_level: number;
};

export default function StaffPage() {
  const { staff } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [error, setError] = useState('');
  const canManage = (staff?.permissionLevel ?? 0) >= 100;

  const load = () => {
    api<Role[]>('/staff/roles').then(setRoles).catch((e) => setError(e.message));
    if ((staff?.permissionLevel ?? 0) >= 80) {
      api<StaffUser[]>('/staff/users').then(setUsers).catch(() => {});
    }
  };

  useEffect(() => {
    load();
  }, [staff?.permissionLevel]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Staff & Roles</h2>
      <p className="text-sm text-ink-muted">
        All roles and names live in MySQL — update personnel here without code changes.
      </p>

      {error && <p className="badge-red px-3 py-2 rounded-lg text-sm">{error}</p>}

      <section className="card p-6">
        <h3 className="font-semibold mb-4">Roles (RBAC)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-soft-purple/40">
                <th className="py-2">Role</th>
                <th className="py-2">Permission level</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.role_id} className="border-b border-white/40">
                  <td className="py-2">
                    <span className="badge-purple px-2 py-0.5 rounded-full">{r.role_name}</span>
                  </td>
                  <td className="py-2">{r.permission_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(staff?.permissionLevel ?? 0) >= 80 && (
        <section className="card p-6">
          <h3 className="font-semibold mb-4">Staff users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-soft-purple/40">
                  <th className="py-2">Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.staff_id} className="border-b border-white/40">
                    <td className="py-2 font-medium">{u.full_name}</td>
                    <td className="py-2">{u.role_name}</td>
                    <td className="py-2 font-mono text-xs">{u.phone_number}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          u.account_status === 'ACTIVE' ? 'badge-blue' : 'badge-red'
                        }`}
                      >
                        {u.account_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!canManage && (
        <p className="text-xs text-ink-muted">
          Branch Manager permission (100+) required to add or edit staff.
        </p>
      )}
    </div>
  );
}
