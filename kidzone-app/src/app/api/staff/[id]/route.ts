import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageStaff } from "@/lib/rbac";
import { ok, err, unauthorized, forbidden, notFound, serverError, validationError } from "@/lib/response";

const updateSchema = z.object({
  role_id:        z.number().int().positive().optional(),
  full_name:      z.string().min(2).max(150).optional(),
  phone_number:   z.string().regex(/^\+[1-9]\d{7,14}$/).optional(),
  account_status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageStaff(session)) return forbidden();

    const { id } = await params;
    const staff = await prisma.staffUser.findUnique({
      where: { staff_id: parseInt(id) },
      include: { role: true },
    });
    if (!staff) return notFound("Staff member");
    return ok(staff);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageStaff(session)) return forbidden();

    const { id } = await params;
    const body = updateSchema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const staff = await prisma.staffUser.findUnique({ where: { staff_id: parseInt(id) } });
    if (!staff) return notFound("Staff member");

    if (body.data.role_id) {
      const roleExists = await prisma.staffRole.findUnique({ where: { role_id: body.data.role_id } });
      if (!roleExists) return err("Selected role does not exist.", 404);
    }

    if (body.data.phone_number && body.data.phone_number !== staff.phone_number) {
      const dup = await prisma.staffUser.findUnique({ where: { phone_number: body.data.phone_number } });
      if (dup) return err("Another staff member already uses this phone number.", 409);
    }

    const updated = await prisma.staffUser.update({
      where: { staff_id: parseInt(id) },
      data: body.data,
      include: { role: true },
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageStaff(session)) return forbidden();

    const { id } = await params;
    const staffId = parseInt(id);

    // Prevent deleting your own account
    const session2 = await getSession();
    if (session2?.staff_id === staffId) {
      return err("You cannot delete your own account.", 400);
    }

    const staff = await prisma.staffUser.findUnique({ where: { staff_id: staffId } });
    if (!staff) return notFound("Staff member");

    // Soft-delete by marking inactive (preserves audit trail in attendance_log)
    const updated = await prisma.staffUser.update({
      where: { staff_id: staffId },
      data: { account_status: "INACTIVE" },
      include: { role: true },
    });

    return ok({ message: "Staff member deactivated (audit trail preserved).", staff: updated });
  } catch (e) {
    return serverError(e);
  }
}
