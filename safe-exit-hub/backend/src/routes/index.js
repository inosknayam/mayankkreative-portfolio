import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission, PERMISSIONS } from '../middleware/rbac.js';
import * as auth from '../controllers/authController.js';
import * as staff from '../controllers/staffController.js';
import * as checkIn from '../controllers/checkInController.js';
import * as safeExit from '../controllers/safeExitController.js';
import * as attendance from '../controllers/attendanceController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.post('/auth/otp/send', auth.sendOtp);
router.post('/auth/otp/verify', auth.loginWithOtp);
router.get('/auth/me', requireAuth, auth.getMe);

router.get('/dashboard', requireAuth, checkIn.getDashboard);
router.get('/children', requireAuth, checkIn.listChildren);
router.get('/events', requireAuth, checkIn.listEvents);
router.get('/check-ins/active', requireAuth, checkIn.listActiveCheckIns);
router.post(
  '/check-ins',
  requireAuth,
  requirePermission(PERMISSIONS.CHECK_IN),
  checkIn.checkInChild
);

router.post(
  '/safe-exit/approve',
  requireAuth,
  requirePermission(PERMISSIONS.SAFE_EXIT),
  safeExit.approveSafeExit
);

router.get('/attendance/logs', requireAuth, attendance.getAttendanceLogs);

router.get('/staff/roles', requireAuth, staff.listRoles);
router.get('/staff/users', requireAuth, requirePermission(PERMISSIONS.MANAGE_EVENTS), staff.listStaff);
router.post('/staff/users', requireAuth, requirePermission(PERMISSIONS.MANAGE_STAFF), staff.createStaff);
router.patch('/staff/users/:staffId', requireAuth, requirePermission(PERMISSIONS.MANAGE_STAFF), staff.updateStaff);
router.post('/staff/roles', requireAuth, requirePermission(PERMISSIONS.MANAGE_STAFF), staff.createRole);

export default router;
