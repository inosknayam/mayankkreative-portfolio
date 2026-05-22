import pool from '../config/database.js';

function randomPickupCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function listActiveCheckIns(req, res) {
  const [rows] = await pool.execute(
    `SELECT ci.check_in_id, ci.pickup_code, ci.check_in_time, ci.status,
            c.child_id, c.full_name AS child_name, c.guardian_name, c.guardian_phone,
            e.event_id, e.event_name,
            su.full_name AS checked_in_by_name
     FROM check_ins ci
     JOIN children c ON ci.child_id = c.child_id
     JOIN events e ON ci.event_id = e.event_id
     JOIN staff_users su ON ci.checked_in_by = su.staff_id
     WHERE ci.status = 'CHECKED_IN'
     ORDER BY ci.check_in_time DESC`
  );
  res.json(rows);
}

export async function checkInChild(req, res) {
  const staffId = req.staff.staffId;
  const { childId, eventId } = req.body;

  if (!childId || !eventId) {
    return res.status(400).json({ error: 'childId and eventId required' });
  }

  const pickupCode = randomPickupCode();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [insert] = await conn.execute(
      `INSERT INTO check_ins (child_id, event_id, checked_in_by, pickup_code)
       VALUES (:childId, :eventId, :staffId, :code)`,
      { childId, eventId, staffId, code: pickupCode }
    );

    const checkInId = insert.insertId;

    await conn.execute(
      `INSERT INTO attendance_log (check_in_id, action_type, verified_by, notes)
       VALUES (:checkInId, 'CHECK_IN', :staffId, :notes)`,
      {
        checkInId,
        staffId,
        notes: `Checked in by staff_id ${staffId}`,
      }
    );

    await conn.execute(
      `INSERT INTO event_logs (event_id, action_type, verified_by, payload)
       VALUES (:eventId, 'CHILD_CHECK_IN', :staffId, :payload)`,
      {
        eventId,
        staffId,
        payload: JSON.stringify({ checkInId, childId }),
      }
    );

    await conn.commit();
    res.status(201).json({ checkInId, pickupCode });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listChildren(req, res) {
  const [rows] = await pool.execute(
    `SELECT child_id, full_name, guardian_name, guardian_phone FROM children ORDER BY full_name`
  );
  res.json(rows);
}

export async function listEvents(req, res) {
  const [rows] = await pool.execute(
    `SELECT e.event_id, e.event_name, e.event_date, e.location, e.status,
            su.full_name AS event_lead_name,
            su.staff_id AS event_lead_staff_id
     FROM events e
     LEFT JOIN staff_users su ON e.lead_staff_id = su.staff_id
     ORDER BY e.event_date DESC`
  );
  res.json(rows);
}

export async function getDashboard(req, res) {
  const staffId = req.staff.staffId;

  const [[counts]] = await pool.execute(
    `SELECT
       (SELECT COUNT(*) FROM check_ins WHERE status = 'CHECKED_IN') AS active_check_ins,
       (SELECT COUNT(*) FROM events WHERE status = 'ACTIVE') AS active_events`
  );

  const [onDuty] = await pool.execute(
    `SELECT s.full_name, r.role_name
     FROM staff_users s
     JOIN staff_roles r ON s.role_id = r.role_id
     WHERE s.staff_id = :staffId`,
    { staffId }
  );

  const [activeEvent] = await pool.execute(
    `SELECT e.event_name, su.full_name AS event_managed_by
     FROM events e
     LEFT JOIN staff_users su ON e.lead_staff_id = su.staff_id
     WHERE e.status = 'ACTIVE'
     ORDER BY e.event_date DESC
     LIMIT 1`
  );

  res.json({
    managerOnDuty: onDuty[0]?.full_name ?? req.staff.fullName,
    managerRole: onDuty[0]?.role_name ?? req.staff.roleName,
    eventManagedBy: activeEvent[0]?.event_managed_by ?? '—',
    activeEventName: activeEvent[0]?.event_name ?? 'No active event',
    loggedInAs: req.staff.fullName,
    loggedInRole: req.staff.roleName,
    ...counts,
  });
}
