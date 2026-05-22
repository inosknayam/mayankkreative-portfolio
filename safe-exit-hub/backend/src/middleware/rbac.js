export function requirePermission(minLevel) {
  return (req, res, next) => {
    const level = req.staff?.permissionLevel ?? 0;
    if (level < minLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: minLevel,
        current: level,
      });
    }
    next();
  };
}

export const PERMISSIONS = {
  CHECK_IN: 30,
  SAFE_EXIT: 50,
  MANAGE_EVENTS: 80,
  MANAGE_STAFF: 100,
};
