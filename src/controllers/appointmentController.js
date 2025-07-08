const Appointment = require('../models/Appointment');

// Get all appointments for a user
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      user: req.user.userId 
    }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new appointment
exports.addAppointment = async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      user: req.user.userId
    };
    
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Add appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get upcoming appointments
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointments = await Appointment.find({ 
      user: req.user.userId,
      date: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ date: 1, time: 1 }).limit(5);
    
    res.json(appointments);
  } catch (err) {
    console.error('Get upcoming appointments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
