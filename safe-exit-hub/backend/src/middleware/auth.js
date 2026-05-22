import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.staff = {
      staffId: payload.staffId,
      roleId: payload.roleId,
      roleName: payload.roleName,
      fullName: payload.fullName,
      permissionLevel: payload.permissionLevel,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
