import pool from '../config/database.js';

/**
 * Safe-Exit: records verified_by as staff_users.staff_id for the staff
 * who pressed "Match Approved".
 */
export async function approveSafeExit(req, res) {
  const staffId = req.staff.staffId;
  const { checkInId, pickupCode, guardianPhone } = req.body;

  if (!checkInId || !pickupCode) {
    return res.status(400).json({ error: 'checkInId and pickupCode required' });
  }

  const [rows] = await pool.execute(
    `SELECT ci.check_in_id, ci.pickup_code, ci.status, c.guardian_phone
     FROM check_ins ci
     JOIN children c ON ci.child_id = c.child_id
     WHERE ci.check_in_id = :checkInId`,
    { checkInId }
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Check-in not found' });
  }

  const record = rows[0];
  if (record.status !== 'CHECKED_IN') {
    return res.status(400).json({ error: 'Child already released or cancelled' });
  }

  if (record.pickup_code !== pickupCode.toUpperCase()) {
    return res.status(400).json({ error: 'Pickup code mismatch' });
  }

  if (guardianPhone && record.guardian_phone.replace(/\s/g, '') !== guardianPhone.replace(/\s/g, '')) {
    return res.status(400).json({ error: 'Guardian phone mismatch' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `UPDATE check_ins SET status = 'RELEASED' WHERE check_in_id = :checkInId`,
      { checkInId }
    );

    await conn.execute(
      `INSERT INTO attendance_log (check_in_id, action_type, verified_by, notes)
       VALUES (:checkInId, 'SAFE_EXIT', :staffId, :notes)`,
      {
        checkInId,
        staffId,
        notes: `Safe exit approved by staff_id ${staffId}`,
      }
    );

    const [[eventRow]] = await conn.execute(
      `SELECT event_id FROM check_ins WHERE check_in_id = :checkInId`,
      { checkInId }
    );

    await conn.execute(
      `INSERT INTO event_logs (event_id, action_type, verified_by, payload)
       VALUES (:eventId, 'SAFE_EXIT_APPROVED', :staffId, :payload)`,
      {
        eventId: eventRow.event_id,
        staffId,
        payload: JSON.stringify({ checkInId, approvedBy: staffId }),
      }
    );

    await conn.commit();

    const [verifier] = await pool.execute(
      `SELECT full_name FROM staff_users WHERE staff_id = :staffId`,
      { staffId }
    );

    res.json({
      released: true,
      verifiedBy: staffId,
      verifiedByName: verifier[0]?.full_name,
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
