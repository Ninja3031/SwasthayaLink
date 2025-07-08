const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  doctorId: { type: String },
  patientName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['consultation', 'follow-up', 'routine', 'emergency'], default: 'consultation' },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled' },
  hospital: { type: String },
  specialty: { type: String },
  consultationFee: { type: Number },
  estimatedDuration: { type: Number }, // in minutes
  symptoms: { type: String },
  diagnosis: { type: String },
  prescription: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
