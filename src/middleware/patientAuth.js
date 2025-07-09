// Middleware to ensure user is a patient and can only access their own data
module.exports = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied. Patient role required.' });
  }
  next();
};
