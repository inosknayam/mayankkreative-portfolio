import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageEvents } from "@/lib/rbac";
import { ok, created, err, unauthorized, forbidden, serverError, validationError } from "@/lib/response";

const createSchema = z.object({
  event_name:  z.string().min(2).max(200),
  event_date:  z.string().date(),
  managed_by:  z.number().int().positive(),
  location:    z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  status:      z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const events = await prisma.event.findMany({
      include: {
        manager: { include: { role: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: { event_date: "desc" },
    });

    return ok(events);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageEvents(session)) return forbidden();

    const body = createSchema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const manager = await prisma.staffUser.findUnique({ where: { staff_id: body.data.managed_by } });
    if (!manager) return err("Selected staff member not found.", 404);
    if (manager.account_status !== "ACTIVE") return err("Cannot assign an inactive staff member as event manager.", 400);

    const event = await prisma.event.create({
      data: {
        ...body.data,
        event_date: new Date(body.data.event_date),
      },
      include: { manager: { include: { role: true } } },
    });

    return created(event);
  } catch (e) {
    return serverError(e);
  }
}
