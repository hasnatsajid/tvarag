export const verifyRole = (role) => (req, res, next) => {
  if (role !== 0) return res.status(403).json({ error: 'Only Admin can call this API. ' });
  next();
};
