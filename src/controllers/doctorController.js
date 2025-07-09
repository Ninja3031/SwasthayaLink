const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');
const Patient = require('../models/Patient');
const PatientRecord = require('../models/PatientRecord');
const TimeSlot = require('../models/TimeSlot');

// Get doctor dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.find({
      doctorId: doctorId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('user', 'name phone email');
    
    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingAppointments = await Appointment.find({
      doctorId: doctorId,
      date: { $gte: today, $lt: nextWeek },
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('user', 'name phone email').sort({ date: 1, time: 1 });
    
    // Get total patients count
    const totalPatients = await Appointment.distinct('user', { doctorId: doctorId });
    
    // Get recent patients (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPatients = await Appointment.find({
      doctorId: doctorId,
      date: { $gte: thirtyDaysAgo }
    }).populate('user', 'name phone email gender bloodGroup').distinct('user');
    
    res.json({
      todayAppointments: todayAppointments.length,
      upcomingAppointments: upcomingAppointments.slice(0, 5), // Next 5 appointments
      totalPatients: totalPatients.length,
      recentPatients: recentPatients.slice(0, 10) // Last 10 patients
    });
  } catch (err) {
    console.error('Get dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get doctor's appointments
exports.getAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let query = { doctorId: doctorId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }
    
    const appointments = await Appointment.find(query)
      .populate('user', 'name phone email gender bloodGroup abhaId')
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Appointment.countDocuments(query);
    
    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update appointment (for diagnosis, prescription, etc.)
exports.updateAppointment = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const appointmentId = req.params.id;
    const { status, diagnosis, prescription, notes } = req.body;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorId
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Update appointment
    if (status) appointment.status = status;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;
    
    await appointment.save();
    
    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get doctor's patients
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { search, page = 1, limit = 10 } = req.query;
    
    // Get unique patient IDs from appointments
    let patientIds = await Appointment.distinct('user', { doctorId: doctorId });
    
    let query = { _id: { $in: patientIds } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const patients = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get last appointment for each patient
    const patientsWithLastVisit = await Promise.all(
      patients.map(async (patient) => {
        const lastAppointment = await Appointment.findOne({
          user: patient._id,
          doctorId: doctorId
        }).sort({ date: -1, time: -1 });
        
        return {
          ...patient.toObject(),
          lastVisit: lastAppointment ? lastAppointment.date : null,
          lastAppointmentStatus: lastAppointment ? lastAppointment.status : null
        };
      })
    );
    
    const total = await User.countDocuments(query);
    
    res.json({
      patients: patientsWithLastVisit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get patients error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get patient details with medical history
exports.getPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patientId = req.params.patientId;
    
    // Verify doctor has treated this patient
    const hasAppointment = await Appointment.findOne({
      user: patientId,
      doctorId: doctorId
    });
    
    if (!hasAppointment) {
      return res.status(403).json({ error: 'Access denied. You have not treated this patient.' });
    }
    
    // Get patient details
    const patient = await User.findById(patientId).select('-password');
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({
      user: patientId,
      doctorId: doctorId
    }).sort({ date: -1, time: -1 });
    
    // Get patient's medications
    const medications = await Medication.find({
      user: patientId,
      isActive: true
    });
    
    res.json({
      patient,
      appointments,
      medications
    });
  } catch (err) {
    console.error('Get patient details error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create appointment for patient
exports.createAppointment = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const {
      patientId,
      patientName,
      date,
      time,
      type,
      symptoms,
      consultationFee,
      estimatedDuration
    } = req.body;

    // Get doctor details
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // If patientId is provided, verify patient exists and assign doctor
    let patient = null;
    if (patientId) {
      patient = await Patient.findById(patientId);
      if (patient && !patient.assignedDoctors.includes(doctorId)) {
        patient.assignedDoctors.push(doctorId);
        await patient.save();
      }
    }

    // Create appointment
    const appointmentData = {
      doctorId: doctorId,
      doctorName: doctor.name,
      patientName: patientName,
      date: new Date(date),
      time: time,
      type: type || 'consultation',
      symptoms: symptoms,
      consultationFee: consultationFee || doctor.consultationFee || 500,
      estimatedDuration: estimatedDuration || 30,
      hospital: doctor.hospital,
      specialty: doctor.specialization,
      status: 'scheduled'
    };

    // Only add user field if patientId is provided and valid
    if (patientId) {
      appointmentData.user = patientId;
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const {
      name,
      phone,
      specialization,
      hospital,
      consultationFee,
      qualifications,
      languages,
      availableSlots,
      address
    } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Update fields
    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (hospital) doctor.hospital = hospital;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (qualifications) doctor.qualifications = qualifications;
    if (languages) doctor.languages = languages;
    if (availableSlots) doctor.availableSlots = availableSlots;
    if (address) doctor.address = address;

    await doctor.save();

    // Return updated doctor profile
    const updatedDoctor = await User.findById(doctorId).select('-password');
    res.json({ message: 'Profile updated successfully', doctor: updatedDoctor });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { period = '6months' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get total patients assigned to this doctor
    const totalPatients = await Patient.countDocuments({
      assignedDoctors: doctorId
    });

    // Get new patients in the period
    const newPatients = await Patient.countDocuments({
      assignedDoctors: doctorId,
      registrationDate: { $gte: startDate }
    });

    // Get appointments data
    const totalAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      date: { $gte: startDate }
    });

    const completedAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      status: 'completed',
      date: { $gte: startDate }
    });

    const cancelledAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      status: 'cancelled',
      date: { $gte: startDate }
    });

    const scheduledAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      status: { $in: ['scheduled', 'confirmed'] },
      date: { $gte: startDate }
    });

    // Calculate revenue (from completed appointments)
    const revenueData = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          status: 'completed',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$consultationFee' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get monthly breakdown
    const monthlyData = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          appointments: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                '$consultationFee',
                0
              ]
            }
          },
          patients: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          _id: 1,
          appointments: 1,
          revenue: 1,
          patients: { $size: { $ifNull: ['$patients', []] } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get appointment status breakdown
    const appointmentStatusData = [
      { name: 'Completed', value: completedAppointments, color: '#10B981' },
      { name: 'Cancelled', value: cancelledAppointments, color: '#EF4444' },
      { name: 'Scheduled', value: scheduledAppointments, color: '#3B82F6' }
    ];

    // Get popular time slots
    const timeSlotData = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$time',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      summary: {
        totalPatients,
        newPatients,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        scheduledAppointments,
        totalRevenue,
        averageRevenue: totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 0
      },
      monthlyData: monthlyData.map(item => ({
        month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
        appointments: item.appointments,
        revenue: item.revenue,
        patients: item.patients
      })),
      appointmentStatusData,
      timeSlotData: timeSlotData.map(item => ({
        time: item._id,
        appointments: item.count
      }))
    });
  } catch (err) {
    console.error('Get analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get doctor's time slots
exports.getTimeSlots = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { date, status, page = 1, limit = 20 } = req.query;

    let query = { doctorId: doctorId };

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    if (status) {
      query.status = status;
    }

    const timeSlots = await TimeSlot.find(query)
      .sort({ date: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TimeSlot.countDocuments(query);

    res.json({
      timeSlots,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get time slots error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create time slot
exports.createTimeSlot = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const {
      date,
      startTime,
      endTime,
      duration = 30,
      isRecurring = false,
      recurringPattern,
      recurringEndDate,
      maxPatients = 1,
      notes
    } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }

    // Validate recurring fields
    if (isRecurring && (!recurringPattern || !recurringEndDate)) {
      return res.status(400).json({ error: 'Recurring pattern and end date are required for recurring slots' });
    }

    const timeSlotData = {
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      isRecurring,
      recurringPattern,
      recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
      maxPatients,
      notes
    };

    if (isRecurring) {
      // Create multiple slots based on recurring pattern
      const slots = [];
      const startDate = new Date(date);
      const endDate = new Date(recurringEndDate);

      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const slotData = {
          ...timeSlotData,
          date: new Date(currentDate)
        };

        const slot = new TimeSlot(slotData);
        slots.push(slot);

        // Move to next occurrence based on pattern
        switch (recurringPattern) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }

      const savedSlots = await TimeSlot.insertMany(slots);
      res.status(201).json({
        message: `${savedSlots.length} recurring time slots created successfully`,
        timeSlots: savedSlots
      });
    } else {
      // Create single slot
      const timeSlot = new TimeSlot(timeSlotData);
      await timeSlot.save();

      res.status(201).json({
        message: 'Time slot created successfully',
        timeSlot
      });
    }
  } catch (err) {
    console.error('Create time slot error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update time slot
exports.updateTimeSlot = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const timeSlotId = req.params.id;
    const updateData = req.body;

    const timeSlot = await TimeSlot.findOne({
      _id: timeSlotId,
      doctorId: doctorId
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    Object.assign(timeSlot, updateData);
    await timeSlot.save();

    res.json({
      message: 'Time slot updated successfully',
      timeSlot
    });
  } catch (err) {
    console.error('Update time slot error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete time slot
exports.deleteTimeSlot = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const timeSlotId = req.params.id;

    const timeSlot = await TimeSlot.findOneAndDelete({
      _id: timeSlotId,
      doctorId: doctorId
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.json({
      message: 'Time slot deleted successfully'
    });
  } catch (err) {
    console.error('Delete time slot error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
