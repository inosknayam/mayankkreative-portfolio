import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageStaff } from "@/lib/rbac";
import { ok, err, unauthorized, forbidden, notFound, serverError, validationError } from "@/lib/response";

const updateSchema = z.object({
  role_name:        z.string().min(2).max(100).optional(),
  permission_level: z.number().int().min(1).max(10).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const role = await prisma.staffRole.findUnique({
      where: { role_id: parseInt(id) },
      include: { _count: { select: { staff_users: true } } },
    });
    if (!role) return notFound("Role");
    return ok(role);
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

    const role = await prisma.staffRole.findUnique({ where: { role_id: parseInt(id) } });
    if (!role) return notFound("Role");

    if (body.data.role_name && body.data.role_name !== role.role_name) {
      const dup = await prisma.staffRole.findUnique({ where: { role_name: body.data.role_name } });
      if (dup) return err("A role with this name already exists.", 409);
    }

    const updated = await prisma.staffRole.update({
      where: { role_id: parseInt(id) },
      data: body.data,
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
    const role = await prisma.staffRole.findUnique({
      where: { role_id: parseInt(id) },
      include: { _count: { select: { staff_users: true } } },
    });
    if (!role) return notFound("Role");
    if (role._count.staff_users > 0) {
      return err(`Cannot delete role – ${role._count.staff_users} staff member(s) are assigned to it.`, 409);
    }

    await prisma.staffRole.delete({ where: { role_id: parseInt(id) } });
    return ok({ message: "Role deleted successfully." });
  } catch (e) {
    return serverError(e);
  }
}
