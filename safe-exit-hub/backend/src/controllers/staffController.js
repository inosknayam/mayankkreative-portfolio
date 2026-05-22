import pool from '../config/database.js';

export async function listRoles(req, res) {
  const [rows] = await pool.execute(
    `SELECT role_id, role_name, permission_level FROM staff_roles ORDER BY permission_level DESC`
  );
  res.json(rows);
}

export async function listStaff(req, res) {
  const [rows] = await pool.execute(
    `SELECT s.staff_id, s.full_name, s.phone_number, s.account_status,
            r.role_id, r.role_name, r.permission_level
     FROM staff_users s
     JOIN staff_roles r ON s.role_id = r.role_id
     ORDER BY s.full_name`
  );
  res.json(rows);
}

export async function createStaff(req, res) {
  const { roleId, fullName, phoneNumber, accountStatus } = req.body;
  if (!roleId || !fullName || !phoneNumber) {
    return res.status(400).json({ error: 'roleId, fullName, phoneNumber required' });
  }

  const [result] = await pool.execute(
    `INSERT INTO staff_users (role_id, full_name, phone_number, account_status)
     VALUES (:roleId, :fullName, :phone, :status)`,
    {
      roleId,
      fullName,
      phone: phoneNumber.replace(/\s/g, ''),
      status: accountStatus || 'ACTIVE',
    }
  );

  res.status(201).json({ staffId: result.insertId });
}

export async function updateStaff(req, res) {
  const { staffId } = req.params;
  const { roleId, fullName, accountStatus } = req.body;

  await pool.execute(
    `UPDATE staff_users SET
       role_id = COALESCE(:roleId, role_id),
       full_name = COALESCE(:fullName, full_name),
       account_status = COALESCE(:status, account_status)
     WHERE staff_id = :staffId`,
    { staffId, roleId: roleId ?? null, fullName: fullName ?? null, status: accountStatus ?? null }
  );

  res.json({ updated: true });
}

export async function createRole(req, res) {
  const { roleName, permissionLevel } = req.body;
  if (!roleName || permissionLevel == null) {
    return res.status(400).json({ error: 'roleName and permissionLevel required' });
  }

  const [result] = await pool.execute(
    `INSERT INTO staff_roles (role_name, permission_level) VALUES (:name, :level)`,
    { name: roleName, level: permissionLevel }
  );

  res.status(201).json({ roleId: result.insertId });
}
