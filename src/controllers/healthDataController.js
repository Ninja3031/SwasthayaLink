const HealthData = require('../models/HealthData');

exports.addHealthData = async (req, res) => {
  try {
    const { type, value, unit, date } = req.body;
    if (!type || value === undefined) {
      return res.status(400).json({ error: 'type and value are required' });
    }
    const healthData = new HealthData({
      user: req.user.userId,
      type,
      value,
      unit,
      date: date || Date.now(),
    });
    await healthData.save();
    res.status(201).json({ message: 'Health data added', healthData });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listHealthData = async (req, res) => {
  try {
    const data = await HealthData.find({ user: req.user.userId }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 