"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertCircle, FiShield } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import type { StaffSession } from "@/lib/auth";
import { getRoleColor } from "@/lib/rbac";

interface LogEntry {
  log_id: number;
  child: { full_name: string; guardian_name: string; guardian_phone: string };
  check_in_time: string;
  checked_in_by: { full_name: string; role: { role_name: string } };
  notes?: string;
}

export function CheckOutClient({ session }: { session: StaffSession }) {
  const [logs,    setLogs]    = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<number | null>(null);

  const roleColor = getRoleColor(session.role_name) as "blue" | "pink" | "yellow" | "purple" | "red";

  async function fetchActive() {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance?status=CHECKED_IN");
      const d = await res.json();
      if (d.success) setLogs(d.data.logs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchActive(); }, []);

  async function handleMatchApproved(logId: number, childName: string) {
    setConfirming(logId);
    try {
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_id: logId }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Check-out failed."); return; }
      toast.success(
        `Safe exit confirmed for ${childName}. Verified by: ${session.full_name} (ID #${session.staff_id})`
      );
      await fetchActive();
    } catch {
      toast.error("Network error.");
    } finally {
      setConfirming(null);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Staff on duty */}
      <div className="mb-6 p-4 rounded-2xl bg-[var(--color-pink-soft)] border border-[var(--color-pink-muted)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-pink-mid)] flex items-center justify-center text-white font-bold">
          {session.full_name.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Approving Staff</p>
          <p className="font-semibold text-[var(--color-text)]">{session.full_name}</p>
          <Badge color={roleColor}>{session.role_name}</Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <FiShield size={14} className="text-[var(--color-pink-accent)]" />
          Your ID is recorded on every approval
        </div>
      </div>

      <Card accent="pink">
        <CardHeader>
          <CardTitle>Safe-Exit &amp; Check-Out</CardTitle>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Verify the guardian&apos;s identity before pressing <strong>Match Approved</strong>.
            Your staff ID ({session.staff_id}) will be permanently recorded in the audit log.
          </p>
        </CardHeader>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-border)] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-muted)]">
            <FiAlertCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p>No children are currently checked in.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {logs.map((log) => (
              <li key={log.log_id} className="py-4 flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-pink-soft)] flex items-center justify-center font-bold text-[var(--color-pink-accent)]">
                  {log.child.full_name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)] truncate">{log.child.full_name}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Guardian: {log.child.guardian_name} · {log.child.guardian_phone}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Checked in {format(new Date(log.check_in_time), "HH:mm")} by{" "}
                    <span className="font-medium">{log.checked_in_by.full_name}</span>
                  </p>
                </div>

                <Button
                  variant="pink"
                  size="sm"
                  loading={confirming === log.log_id}
                  onClick={() => handleMatchApproved(log.log_id, log.child.full_name)}
                >
                  Match Approved
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
