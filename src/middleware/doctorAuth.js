// Middleware to ensure user is a doctor
module.exports = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctor role required.' });
  }
  next();
};
