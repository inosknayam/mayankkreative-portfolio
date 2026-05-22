/**
 * Sends OTP via SMS or WhatsApp. In dev mode, logs only.
 */
export async function sendOtpMessage(phoneNumber, code, channel = 'sms') {
  if (process.env.OTP_DEV_MODE === 'true') {
    console.log(`[OTP ${channel.toUpperCase()}] ${phoneNumber} → ${code}`);
    return { sent: true, channel: 'dev' };
  }

  if (channel === 'whatsapp' && process.env.WHATSAPP_API_URL) {
    const res = await fetch(process.env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        body: `Your Safe Exit Hub code: ${code}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
      }),
    });
    if (!res.ok) throw new Error('WhatsApp delivery failed');
    return { sent: true, channel: 'whatsapp' };
  }

  if (process.env.TWILIO_ACCOUNT_SID) {
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');
    const params = new URLSearchParams({
      To: phoneNumber,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: `Safe Exit Hub login code: ${code}`,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      }
    );
    if (!res.ok) throw new Error('SMS delivery failed');
    return { sent: true, channel: 'sms' };
  }

  console.log(`[OTP fallback] ${phoneNumber} → ${code}`);
  return { sent: true, channel: 'console' };
}
