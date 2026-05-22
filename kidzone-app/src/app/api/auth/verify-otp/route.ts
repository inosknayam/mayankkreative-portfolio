import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { err, serverError, validationError } from "@/lib/response";

const schema = z.object({
  phone_number: z.string().regex(/^\+[1-9]\d{7,14}$/),
  otp_code: z.string().min(4).max(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const { phone_number, otp_code } = body.data;

    const session = await prisma.otpSession.findFirst({
      where: {
        phone_number,
        otp_code,
        used: false,
        expires_at: { gt: new Date() },
      },
      include: {
        staff: { include: { role: true } },
      },
      orderBy: { created_at: "desc" },
    });

    if (!session) return err("Invalid or expired OTP. Please request a new code.", 401);

    // Mark OTP as consumed
    await prisma.otpSession.update({
      where: { id: session.id },
      data: { used: true },
    });

    const { staff } = session;

    if (staff.account_status !== "ACTIVE") {
      return err("Your account has been deactivated. Contact your manager.", 403);
    }

    const token = await signSession({
      staff_id:         staff.staff_id,
      full_name:        staff.full_name,
      role_name:        staff.role.role_name,
      permission_level: staff.role.permission_level,
      phone_number:     staff.phone_number,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        staff_id:         staff.staff_id,
        full_name:        staff.full_name,
        role_name:        staff.role.role_name,
        permission_level: staff.role.permission_level,
      },
    });

    const expiryHours = parseInt(process.env.JWT_EXPIRY_HOURS ?? "8", 10);
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiryHours * 3600,
      path: "/",
    });

    return response;
  } catch (e) {
    return serverError(e);
  }
}
