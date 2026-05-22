import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, unauthorized, notFound, serverError, validationError } from "@/lib/response";

const updateSchema = z.object({
  full_name:          z.string().min(2).max(150).optional(),
  date_of_birth:      z.string().optional(),
  guardian_name:      z.string().min(2).max(150).optional(),
  guardian_phone:     z.string().regex(/^\+[1-9]\d{7,14}$/).optional(),
  guardian_photo_url: z.string().url().optional().nullable(),
  child_photo_url:    z.string().url().optional().nullable(),
  notes:              z.string().max(1000).optional().nullable(),
  is_active:          z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const child = await prisma.child.findUnique({ where: { child_id: parseInt(id) } });
    if (!child) return notFound("Child");
    return ok(child);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = updateSchema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const child = await prisma.child.findUnique({ where: { child_id: parseInt(id) } });
    if (!child) return notFound("Child");

    const updated = await prisma.child.update({
      where: { child_id: parseInt(id) },
      data: {
        ...body.data,
        ...(body.data.date_of_birth ? { date_of_birth: new Date(body.data.date_of_birth) } : {}),
      },
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}
