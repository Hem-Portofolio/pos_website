export function roleMiddleware(allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ success: false, data: null, message: `Akses ditolak untuk role '${role || "unknown"}'` });
    }
    next();
  };
}
