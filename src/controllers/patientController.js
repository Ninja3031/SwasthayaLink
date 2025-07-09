const Patient = require('../models/Patient');
const PatientRecord = require('../models/PatientRecord');
const Appointment = require('../models/Appointment');

// Get all patients assigned to the doctor
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { search, page = 1, limit = 10, status = 'active' } = req.query;
    
    let query = { 
      assignedDoctors: doctorId,
      status: status 
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const patients = await Patient.find(query)
      .populate('primaryDoctor', 'name specialization')
      .sort({ lastVisit: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Patient.countDocuments(query);
    
    res.json({
      patients,
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
    
    // Verify doctor has access to this patient
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctors: doctorId
    }).populate('primaryDoctor', 'name specialization');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or access denied' });
    }
    
    // Get patient's medical records with this doctor
    const medicalRecords = await PatientRecord.find({
      patientId: patientId,
      doctorId: doctorId
    }).sort({ visitDate: -1 }).limit(10);
    
    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({
      user: patientId,
      doctorId: doctorId
    }).sort({ date: -1 }).limit(5);
    
    res.json({
      patient,
      medicalRecords,
      appointments
    });
  } catch (err) {
    console.error('Get patient details error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new patient
exports.addPatient = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patientData = {
      ...req.body,
      assignedDoctors: [doctorId],
      primaryDoctor: doctorId,
      registrationDate: new Date()
    };
    
    // Check if patient already exists
    const existingPatient = await Patient.findOne({
      $or: [
        { email: patientData.email },
        { phone: patientData.phone }
      ]
    });
    
    if (existingPatient) {
      // If patient exists, add doctor to assigned doctors if not already assigned
      if (!existingPatient.assignedDoctors.includes(doctorId)) {
        existingPatient.assignedDoctors.push(doctorId);
        await existingPatient.save();
      }
      return res.json({ 
        message: 'Patient already exists and has been assigned to you',
        patient: existingPatient 
      });
    }
    
    const patient = new Patient(patientData);
    await patient.save();
    
    res.status(201).json({ 
      message: 'Patient added successfully',
      patient 
    });
  } catch (err) {
    console.error('Add patient error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update patient information
exports.updatePatient = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patientId = req.params.patientId;
    
    // Verify doctor has access to this patient
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctors: doctorId
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or access denied' });
    }
    
    // Update patient data
    Object.assign(patient, req.body);
    await patient.save();
    
    res.json({ 
      message: 'Patient updated successfully',
      patient 
    });
  } catch (err) {
    console.error('Update patient error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add doctor's note to patient
exports.addPatientNote = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patientId = req.params.patientId;
    const { note, isPrivate = false } = req.body;
    
    // Verify doctor has access to this patient
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctors: doctorId
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or access denied' });
    }
    
    patient.doctorNotes.push({
      doctorId: doctorId,
      note: note,
      isPrivate: isPrivate,
      date: new Date()
    });
    
    await patient.save();
    
    res.json({ 
      message: 'Note added successfully',
      patient 
    });
  } catch (err) {
    console.error('Add patient note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get patient statistics for doctor dashboard
exports.getPatientStats = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    const totalPatients = await Patient.countDocuments({
      assignedDoctors: doctorId,
      status: 'active'
    });
    
    const newPatientsThisMonth = await Patient.countDocuments({
      assignedDoctors: doctorId,
      status: 'active',
      registrationDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    
    // Get recent patients (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPatients = await Patient.find({
      assignedDoctors: doctorId,
      lastVisit: { $gte: thirtyDaysAgo }
    }).sort({ lastVisit: -1 }).limit(5);
    
    res.json({
      totalPatients,
      newPatientsThisMonth,
      recentPatients
    });
  } catch (err) {
    console.error('Get patient stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new patient record
exports.createPatientRecord = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patientId = req.params.patientId;

    // Verify doctor has access to this patient
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctors: doctorId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or access denied' });
    }

    const recordData = {
      ...req.body,
      patientId: patientId,
      doctorId: doctorId
    };

    const record = new PatientRecord(recordData);
    await record.save();

    // Update patient's last visit date
    patient.lastVisit = new Date();
    await patient.save();

    res.status(201).json({
      message: 'Patient record created successfully',
      record
    });
  } catch (err) {
    console.error('Create patient record error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get patient records
exports.getPatientRecords = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patientId = req.params.patientId;
    const { page = 1, limit = 10 } = req.query;

    // Verify doctor has access to this patient
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctors: doctorId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or access denied' });
    }

    const records = await PatientRecord.find({
      patientId: patientId,
      doctorId: doctorId
    })
    .sort({ visitDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await PatientRecord.countDocuments({
      patientId: patientId,
      doctorId: doctorId
    });

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get patient records error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update patient record
exports.updatePatientRecord = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const recordId = req.params.recordId;

    const record = await PatientRecord.findOne({
      _id: recordId,
      doctorId: doctorId
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }

    Object.assign(record, req.body);
    await record.save();

    res.json({
      message: 'Record updated successfully',
      record
    });
  } catch (err) {
    console.error('Update patient record error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
