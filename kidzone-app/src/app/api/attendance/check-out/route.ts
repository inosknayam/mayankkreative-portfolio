import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canVerifyCheckOut } from "@/lib/rbac";
import { ok, err, unauthorized, forbidden, serverError, validationError } from "@/lib/response";

const schema = z.object({
  log_id: z.number().int().positive(),
  notes:  z.string().max(500).optional(),
});

/**
 * Safe-Exit Audit: verified_by is always set to the exact staff_id of the
 * authenticated staff member who presses "Match Approved" – never a text field.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canVerifyCheckOut(session)) return forbidden();

    const body = schema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const log = await prisma.attendanceLog.findUnique({
      where: { log_id: body.data.log_id },
      include: { child: true },
    });

    if (!log) return err("Attendance record not found.", 404);
    if (log.status !== "CHECKED_IN") return err("Child is not currently checked in.", 400);

    // Record the EXACT staff_id of who pressed "Match Approved"
    const updated = await prisma.attendanceLog.update({
      where: { log_id: body.data.log_id },
      data: {
        check_out_time: new Date(),
        verified_by_id: session.staff_id,   // strictly the FK – never free text
        status:         "CHECKED_OUT",
        ...(body.data.notes ? { notes: body.data.notes } : {}),
      },
      include: {
        child:         true,
        checked_in_by: { include: { role: true } },
        verified_by:   { include: { role: true } },
        event:         true,
      },
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}
