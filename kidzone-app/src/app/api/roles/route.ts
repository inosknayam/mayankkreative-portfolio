import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageStaff } from "@/lib/rbac";
import { ok, created, err, unauthorized, forbidden, serverError, validationError } from "@/lib/response";

const createSchema = z.object({
  role_name:        z.string().min(2).max(100),
  permission_level: z.number().int().min(1).max(10),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const roles = await prisma.staffRole.findMany({
      orderBy: { permission_level: "asc" },
      include: { _count: { select: { staff_users: true } } },
    });

    return ok(roles);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageStaff(session)) return forbidden();

    const body = createSchema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const existing = await prisma.staffRole.findUnique({
      where: { role_name: body.data.role_name },
    });
    if (existing) return err("A role with this name already exists.", 409);

    const role = await prisma.staffRole.create({ data: body.data });
    return created(role);
  } catch (e) {
    return serverError(e);
  }
}
