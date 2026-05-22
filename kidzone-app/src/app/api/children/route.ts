import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, created, unauthorized, serverError, validationError } from "@/lib/response";

const createSchema = z.object({
  full_name:          z.string().min(2).max(150),
  date_of_birth:      z.string().datetime({ offset: true }).or(z.string().date()),
  guardian_name:      z.string().min(2).max(150),
  guardian_phone:     z.string().regex(/^\+[1-9]\d{7,14}$/, "Guardian phone must be E.164 format"),
  guardian_photo_url: z.string().url().optional(),
  child_photo_url:    z.string().url().optional(),
  notes:              z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const activeOnly = searchParams.get("active") !== "false";

    const children = await prisma.child.findMany({
      where: {
        is_active: activeOnly || undefined,
        ...(query
          ? {
              OR: [
                { full_name: { contains: query } },
                { guardian_name: { contains: query } },
                { guardian_phone: { contains: query } },
              ],
            }
          : {}),
      },
      orderBy: { full_name: "asc" },
    });

    return ok(children);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = createSchema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const child = await prisma.child.create({
      data: {
        ...body.data,
        date_of_birth: new Date(body.data.date_of_birth),
      },
    });

    return created(child);
  } catch (e) {
    return serverError(e);
  }
}
