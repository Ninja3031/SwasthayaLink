const Appointment = require('../models/Appointment');

// Get all appointments for a user
exports.getAppointments = async (req, res) => {
  try {
    console.log('Fetching appointments for user:', req.user.userId);
    const appointments = await Appointment.find({
      user: req.user.userId
    }).sort({ date: 1, time: 1 });
    console.log('Found appointments:', appointments.length);
    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Add a new appointment
exports.addAppointment = async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    console.log('User ID:', req.user.userId);

    // Get user details to set patient name
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);

    const appointmentData = {
      ...req.body,
      user: req.user.userId,
      patientName: user ? user.name : req.body.patientName || 'Unknown Patient'
    };

    // Convert date string to Date object if needed
    if (appointmentData.date && typeof appointmentData.date === 'string') {
      appointmentData.date = new Date(appointmentData.date);
    }

    // For now, we'll create appointments without a specific doctorId
    // In a real system, you'd have a doctor selection process
    if (!appointmentData.doctorId) {
      delete appointmentData.doctorId; // Remove undefined doctorId
    }

    console.log('Processed appointment data:', appointmentData);

    const appointment = new Appointment(appointmentData);
    await appointment.save();
    console.log('Appointment saved successfully:', appointment);
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Add appointment error:', err);
    console.error('Error details:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: err.message,
        fields: Object.keys(err.errors)
      });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
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
