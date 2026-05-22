import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canCheckIn } from "@/lib/rbac";
import { ok, err, unauthorized, forbidden, serverError, validationError } from "@/lib/response";

const schema = z.object({
  child_id:  z.number().int().positive(),
  event_id:  z.number().int().positive().optional(),
  notes:     z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canCheckIn(session)) return forbidden();

    const body = schema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const child = await prisma.child.findUnique({ where: { child_id: body.data.child_id } });
    if (!child) return err("Child not found.", 404);
    if (!child.is_active) return err("This child's record is inactive.", 400);

    // Prevent duplicate check-in on the same day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existing = await prisma.attendanceLog.findFirst({
      where: {
        child_id: body.data.child_id,
        status: "CHECKED_IN",
        check_in_time: { gte: todayStart },
      },
    });
    if (existing) return err("This child is already checked in today.", 409);

    const log = await prisma.attendanceLog.create({
      data: {
        child_id:       body.data.child_id,
        event_id:       body.data.event_id,
        check_in_by_id: session.staff_id,
        notes:          body.data.notes,
        status:         "CHECKED_IN",
      },
      include: {
        child:         true,
        checked_in_by: { include: { role: true } },
        event:         true,
      },
    });

    return ok(log, 201);
  } catch (e) {
    return serverError(e);
  }
}
