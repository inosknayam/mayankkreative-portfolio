import pool from '../config/database.js';

export async function getAttendanceLogs(req, res) {
  const { checkInId, eventId } = req.query;
  let sql = `
    SELECT al.log_id, al.check_in_id, al.action_type, al.verified_by,
           al.notes, al.created_at,
           su.full_name AS verified_by_name,
           sr.role_name AS verified_by_role
    FROM attendance_log al
    JOIN staff_users su ON al.verified_by = su.staff_id
    JOIN staff_roles sr ON su.role_id = sr.role_id
    WHERE 1=1`;
  const params = {};

  if (checkInId) {
    sql += ' AND al.check_in_id = :checkInId';
    params.checkInId = checkInId;
  }
  if (eventId) {
    sql += ` AND al.check_in_id IN (
      SELECT check_in_id FROM check_ins WHERE event_id = :eventId
    )`;
    params.eventId = eventId;
  }

  sql += ' ORDER BY al.created_at DESC LIMIT 200';

  const [rows] = await pool.execute(sql, params);
  res.json(rows);
}
