import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { sendOtpMessage } from './smsService.js';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(phoneNumber, channel = 'sms') {
  const normalized = phoneNumber.replace(/\s/g, '');

  const [rows] = await pool.execute(
    `SELECT s.staff_id, s.account_status, r.role_name
     FROM staff_users s
     JOIN staff_roles r ON s.role_id = r.role_id
     WHERE s.phone_number = :phone`,
    { phone: normalized }
  );

  if (!rows.length) {
    return { ok: false, error: 'Phone number not registered' };
  }
  if (rows[0].account_status !== 'ACTIVE') {
    return { ok: false, error: 'Account is inactive' };
  }

  const code = generateCode();
  const hash = await bcrypt.hash(code, 10);
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

  await pool.execute(
    `INSERT INTO otp_sessions (phone_number, otp_hash, expires_at)
     VALUES (:phone, :hash, DATE_ADD(NOW(), INTERVAL :mins MINUTE))`,
    { phone: normalized, hash, mins: minutes }
  );

  await sendOtpMessage(normalized, code, channel);

  return { ok: true, message: 'OTP sent', expiresInMinutes: minutes };
}

export async function verifyOtp(phoneNumber, code) {
  const normalized = phoneNumber.replace(/\s/g, '');

  const [sessions] = await pool.execute(
    `SELECT otp_id, otp_hash FROM otp_sessions
     WHERE phone_number = :phone AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    { phone: normalized }
  );

  if (!sessions.length) {
    return { ok: false, error: 'No valid OTP session' };
  }

  const valid = await bcrypt.compare(code, sessions[0].otp_hash);
  if (!valid) {
    return { ok: false, error: 'Invalid OTP' };
  }

  await pool.execute(
    `UPDATE otp_sessions SET used_at = NOW() WHERE otp_id = :id`,
    { id: sessions[0].otp_id }
  );

  const [staff] = await pool.execute(
    `SELECT s.staff_id, s.role_id, s.full_name, s.phone_number,
            r.role_name, r.permission_level
     FROM staff_users s
     JOIN staff_roles r ON s.role_id = r.role_id
     WHERE s.phone_number = :phone AND s.account_status = 'ACTIVE'`,
    { phone: normalized }
  );

  if (!staff.length) {
    return { ok: false, error: 'Staff not found' };
  }

  return { ok: true, staff: staff[0] };
}
