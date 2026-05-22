import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const dateStr    = searchParams.get("date");
    const childId    = searchParams.get("child_id");
    const statusFilter = searchParams.get("status");
    const page       = parseInt(searchParams.get("page") ?? "1");
    const pageSize   = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

    const where: Record<string, unknown> = {};

    if (dateStr) {
      const date = new Date(dateStr);
      const next = new Date(date);
      next.setDate(date.getDate() + 1);
      where.check_in_time = { gte: date, lt: next };
    }
    if (childId) where.child_id = parseInt(childId);
    if (statusFilter) where.status = statusFilter;

    const [logs, total] = await prisma.$transaction([
      prisma.attendanceLog.findMany({
        where,
        include: {
          child:          true,
          checked_in_by:  { include: { role: true } },
          verified_by:    { include: { role: true } },
          event:          true,
        },
        orderBy: { check_in_time: "desc" },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
      prisma.attendanceLog.count({ where }),
    ]);

    return ok({ logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (e) {
    return serverError(e);
  }
}
