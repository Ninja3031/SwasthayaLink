const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'doctor', 'admin'], default: 'user' },
  abhaId: { type: String },

  // Common user fields
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  photo: { type: String },
  address: { type: String },

  // Doctor-specific fields
  specialization: { type: String },
  licenseNumber: { type: String },
  hospital: { type: String },
  yearsOfExperience: { type: Number },
  consultationFee: { type: Number },
  qualifications: [{ type: String }],
  languages: [{ type: String }],
  availableSlots: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    isAvailable: { type: Boolean, default: true }
  }],

  // Doctor verification status
  isVerified: { type: Boolean, default: false },
  verificationDocuments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);