"use client";

import { useEffect, useState } from "react";
import { FiCalendar, FiSearch, FiRefreshCw } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { format } from "date-fns";

interface LogEntry {
  log_id: number;
  status: "CHECKED_IN" | "CHECKED_OUT";
  check_in_time: string;
  check_out_time: string | null;
  child: { full_name: string; guardian_name: string };
  checked_in_by: { staff_id: number; full_name: string; role: { role_name: string } };
  verified_by: { staff_id: number; full_name: string; role: { role_name: string } } | null;
  event: { event_name: string } | null;
  notes?: string;
}

const statusColor = { CHECKED_IN: "blue", CHECKED_OUT: "green" } as const;
const statusLabel = { CHECKED_IN: "Present", CHECKED_OUT: "Left" } as const;

export function AttendanceClient() {
  const [logs,    setLogs]    = useState<LogEntry[]>([]);
  const [total,   setTotal]   = useState(0);
  const [date,    setDate]    = useState(format(new Date(), "yyyy-MM-dd"));
  const [status,  setStatus]  = useState("");
  const [loading, setLoading] = useState(false);
  const [page,    setPage]    = useState(1);
  const pageSize = 20;

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams({ date, page: String(page), limit: String(pageSize) });
    if (status) params.set("status", status);
    try {
      const res = await fetch(`/api/attendance?${params}`);
      const d = await res.json();
      if (d.success) { setLogs(d.data.logs); setTotal(d.data.total); }
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLogs(); }, [date, status, page]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Attendance Log</h1>
        <Button variant="ghost" size="sm" onClick={fetchLogs}>
          <FiRefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-xl px-3 py-2">
          <FiCalendar size={16} className="text-[var(--color-muted)]" />
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="text-sm bg-transparent focus:outline-none text-[var(--color-text)]"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-purple-mid)]"
        >
          <option value="">All Statuses</option>
          <option value="CHECKED_IN">Present</option>
          <option value="CHECKED_OUT">Left</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {total} record{total !== 1 ? "s" : ""} for {format(new Date(date + "T00:00:00"), "dd MMM yyyy")}
          </CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[var(--color-border)] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-muted)]">
            <FiSearch size={36} className="mx-auto mb-2 opacity-30" />
            <p>No records found for this date &amp; filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)] text-xs uppercase tracking-wide">
                  <th className="pb-3 text-left font-medium">Child</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-left font-medium">Check-In</th>
                  <th className="pb-3 text-left font-medium">Checked In By</th>
                  <th className="pb-3 text-left font-medium">Check-Out</th>
                  <th className="pb-3 text-left font-medium">Verified By (Audit)</th>
                  <th className="pb-3 text-left font-medium">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-[var(--color-surface)] transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[var(--color-text)]">{log.child.full_name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{log.child.guardian_name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge color={statusColor[log.status]}>{statusLabel[log.status]}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-muted)]">
                      {format(new Date(log.check_in_time), "HH:mm")}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[var(--color-text)]">{log.checked_in_by.full_name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {log.checked_in_by.role.role_name} · ID #{log.checked_in_by.staff_id}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-muted)]">
                      {log.check_out_time
                        ? format(new Date(log.check_out_time), "HH:mm")
                        : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {log.verified_by ? (
                        <>
                          <p className="font-medium text-[var(--color-text)]">{log.verified_by.full_name}</p>
                          <p className="text-xs text-[var(--color-muted)]">
                            {log.verified_by.role.role_name} · ID #{log.verified_by.staff_id}
                          </p>
                        </>
                      ) : (
                        <span className="text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 text-[var(--color-muted)] text-xs">
                      {log.event?.event_name ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted)]">
              Page {page} of {Math.ceil(total / pageSize)}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
