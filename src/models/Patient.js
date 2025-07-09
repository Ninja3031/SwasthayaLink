const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  
  // Address Information
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'India' }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  
  // Medical Information
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    startDate: { type: Date }
  }],
  
  // Insurance Information
  insurance: {
    provider: { type: String },
    policyNumber: { type: String },
    groupNumber: { type: String }
  },
  
  // Doctor Assignment
  assignedDoctors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // References doctors
  }],
  primaryDoctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Status and Metadata
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'transferred'], 
    default: 'active' 
  },
  registrationDate: { type: Date, default: Date.now },
  lastVisit: { type: Date },
  
  // Notes (only visible to assigned doctors)
  doctorNotes: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String },
    date: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],
  
  // Vital Signs (latest)
  latestVitals: {
    bloodPressure: { type: String },
    heartRate: { type: Number },
    temperature: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    recordedDate: { type: Date },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating age from date of birth
patientSchema.virtual('calculatedAge').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return this.age;
});

// Index for efficient queries
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ assignedDoctors: 1 });
patientSchema.index({ primaryDoctor: 1 });
patientSchema.index({ status: 1 });

module.exports = mongoose.model('Patient', patientSchema);
