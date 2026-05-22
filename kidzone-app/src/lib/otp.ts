import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN) are not configured.");
  }
  return twilio(accountSid, authToken);
}

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export function otpExpiresAt(): Date {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES ?? "5", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function sendOtp(phoneNumber: string, otp: string): Promise<void> {
  const channel = process.env.OTP_CHANNEL ?? "sms";
  const client = getTwilioClient();
  const body = `Your KidZone verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES ?? 5} minutes. Do not share this code.`;

  const jobs: Promise<unknown>[] = [];

  if (channel === "sms" || channel === "both") {
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) throw new Error("TWILIO_PHONE_NUMBER is not configured.");
    jobs.push(
      client.messages.create({ to: phoneNumber, from, body })
    );
  }

  if (channel === "whatsapp" || channel === "both") {
    const from = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
    jobs.push(
      client.messages.create({
        to: `whatsapp:${phoneNumber}`,
        from,
        body,
      })
    );
  }

  if (jobs.length === 0) throw new Error("No OTP channel is configured.");
  await Promise.all(jobs);
}
