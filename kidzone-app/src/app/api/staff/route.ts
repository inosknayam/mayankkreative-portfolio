import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageStaff } from "@/lib/rbac";
import { ok, created, err, unauthorized, forbidden, serverError, validationError } from "@/lib/response";

const createSchema = z.object({
  role_id:        z.number().int().positive(),
  full_name:      z.string().min(2).max(150),
  phone_number:   z.string().regex(/^\+[1-9]\d{7,14}$/, "Must be E.164 format, e.g. +91XXXXXXXXXX"),
  account_status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!canManageStaff(session)) return forbidden();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const staff = await prisma.staffUser.findMany({
      where: status ? { account_status: status as "ACTIVE" | "INACTIVE" } : undefined,
      include: { role: true },
      orderBy: [{ role: { permission_level: "desc" } }, { full_name: "asc" }],
    });

    return ok(
      staff.map((s) => ({
        staff_id:       s.staff_id,
        full_name:      s.full_name,
        phone_number:   s.phone_number,
        account_status: s.account_status,
        role:           s.role,
      }))
    );
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

    const roleExists = await prisma.staffRole.findUnique({ where: { role_id: body.data.role_id } });
    if (!roleExists) return err("Selected role does not exist.", 404);

    const dup = await prisma.staffUser.findUnique({ where: { phone_number: body.data.phone_number } });
    if (dup) return err("A staff member with this phone number already exists.", 409);

    const staff = await prisma.staffUser.create({
      data: body.data,
      include: { role: true },
    });

    return created({
      staff_id:       staff.staff_id,
      full_name:      staff.full_name,
      phone_number:   staff.phone_number,
      account_status: staff.account_status,
      role:           staff.role,
    });
  } catch (e) {
    return serverError(e);
  }
}
