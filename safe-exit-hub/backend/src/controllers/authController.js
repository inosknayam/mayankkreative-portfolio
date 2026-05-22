import jwt from 'jsonwebtoken';
import { requestOtp, verifyOtp } from '../services/otpService.js';

export async function sendOtp(req, res) {
  try {
    const { phoneNumber, channel } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }
    const result = await requestOtp(phoneNumber, channel || 'sms');
    if (!result.ok) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

export async function loginWithOtp(req, res) {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'phoneNumber and code are required' });
    }

    const result = await verifyOtp(phoneNumber, code);
    if (!result.ok) {
      return res.status(401).json({ error: result.error });
    }

    const s = result.staff;
    const token = jwt.sign(
      {
        staffId: s.staff_id,
        roleId: s.role_id,
        roleName: s.role_name,
        fullName: s.full_name,
        permissionLevel: s.permission_level,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      staff: {
        staffId: s.staff_id,
        fullName: s.full_name,
        roleName: s.role_name,
        permissionLevel: s.permission_level,
        phoneNumber: s.phone_number,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function getMe(req, res) {
  res.json({
    staffId: req.staff.staffId,
    fullName: req.staff.fullName,
    roleName: req.staff.roleName,
    permissionLevel: req.staff.permissionLevel,
  });
}
