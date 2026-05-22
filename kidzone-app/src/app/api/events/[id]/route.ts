import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageEvents } from "@/lib/rbac";
import { ok, err, unauthorized, forbidden, notFound, serverError, validationError } from "@/lib/response";

const updateSchema = z.object({
  event_name:  z.string().min(2).max(200).optional(),
  event_date:  z.string().date().optional(),
  managed_by:  z.number().int().positive().optional(),
  location:    z.string().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  status:      z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { event_id: parseInt(id) },
      include: {
        manager: { include: { role: true } },
        attendance: {
          include: {
            child:        true,
            checked_in_by: { include: { role: true } },
            verified_by:   { include: { role: true } },
          },
          orderBy: { check_in_time: "desc" },
        },
      },
    });
    if (!event) return notFound("Event");
    return ok(event);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageEvents(session)) return forbidden();

    const { id } = await params;
    const body = updateSchema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const event = await prisma.event.findUnique({ where: { event_id: parseInt(id) } });
    if (!event) return notFound("Event");

    if (body.data.managed_by) {
      const manager = await prisma.staffUser.findUnique({ where: { staff_id: body.data.managed_by } });
      if (!manager) return err("Selected staff member not found.", 404);
    }

    const updated = await prisma.event.update({
      where: { event_id: parseInt(id) },
      data: {
        ...body.data,
        ...(body.data.event_date ? { event_date: new Date(body.data.event_date) } : {}),
      },
      include: { manager: { include: { role: true } } },
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}
