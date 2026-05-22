import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateOtp, otpExpiresAt, sendOtp } from "@/lib/otp";
import { err, ok, serverError, validationError } from "@/lib/response";

const schema = z.object({
  phone_number: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Phone number must be in E.164 format (e.g. +91XXXXXXXXXX)"),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) return validationError(body.error);

    const { phone_number } = body.data;

    const staff = await prisma.staffUser.findUnique({
      where: { phone_number },
      include: { role: true },
    });

    if (!staff) return err("No active staff account found for this phone number.", 404);
    if (staff.account_status !== "ACTIVE") return err("This account is inactive. Contact your manager.", 403);

    // Invalidate any previously unused OTPs for this staff member
    await prisma.otpSession.updateMany({
      where: { staff_id: staff.staff_id, used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const expires_at = otpExpiresAt();

    await prisma.otpSession.create({
      data: {
        staff_id: staff.staff_id,
        phone_number,
        otp_code: otp,
        expires_at,
      },
    });

    await sendOtp(phone_number, otp);

    return ok({ message: "OTP sent successfully.", expires_at });
  } catch (e) {
    return serverError(e);
  }
}
