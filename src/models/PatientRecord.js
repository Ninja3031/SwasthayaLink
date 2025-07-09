const mongoose = require('mongoose');

const patientRecordSchema = new mongoose.Schema({
  // References
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  
  // Visit Information
  visitDate: { type: Date, required: true, default: Date.now },
  visitType: { 
    type: String, 
    enum: ['consultation', 'follow-up', 'routine-checkup', 'emergency', 'procedure'], 
    default: 'consultation' 
  },
  
  // Chief Complaint and History
  chiefComplaint: { type: String, required: true },
  historyOfPresentIllness: { type: String },
  symptoms: [{ type: String }],
  duration: { type: String }, // e.g., "3 days", "2 weeks"
  
  // Physical Examination
  physicalExamination: {
    general: { type: String },
    vitals: {
      bloodPressure: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      respiratoryRate: { type: Number },
      oxygenSaturation: { type: Number },
      weight: { type: Number },
      height: { type: Number },
      bmi: { type: Number }
    },
    systemicExamination: {
      cardiovascular: { type: String },
      respiratory: { type: String },
      gastrointestinal: { type: String },
      neurological: { type: String },
      musculoskeletal: { type: String },
      dermatological: { type: String }
    }
  },
  
  // Diagnosis and Assessment
  provisionalDiagnosis: { type: String },
  finalDiagnosis: { type: String },
  differentialDiagnosis: [{ type: String }],
  severity: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe', 'critical'] 
  },
  
  // Investigations
  investigationsOrdered: [{
    test: { type: String },
    reason: { type: String },
    urgency: { type: String, enum: ['routine', 'urgent', 'stat'] },
    status: { type: String, enum: ['ordered', 'completed', 'pending'], default: 'ordered' }
  }],
  
  investigationResults: [{
    test: { type: String },
    result: { type: String },
    normalRange: { type: String },
    date: { type: Date },
    interpretation: { type: String }
  }],
  
  // Treatment Plan
  treatment: {
    medications: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String },
      instructions: { type: String },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date }
    }],
    procedures: [{
      name: { type: String },
      description: { type: String },
      date: { type: Date },
      outcome: { type: String }
    }],
    lifestyle: {
      diet: { type: String },
      exercise: { type: String },
      restrictions: [{ type: String }],
      recommendations: [{ type: String }]
    }
  },
  
  // Follow-up
  followUp: {
    required: { type: Boolean, default: false },
    date: { type: Date },
    reason: { type: String },
    instructions: { type: String }
  },
  
  // Doctor's Notes
  notes: { type: String },
  privateNotes: { type: String }, // Only visible to the treating doctor
  
  // Attachments
  attachments: [{
    filename: { type: String },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    uploadDate: { type: Date, default: Date.now },
    description: { type: String }
  }],
  
  // Status and Metadata
  status: { 
    type: String, 
    enum: ['draft', 'completed', 'reviewed', 'archived'], 
    default: 'completed' 
  },
  isConfidential: { type: Boolean, default: false },
  
  // Billing Information
  billing: {
    consultationFee: { type: Number },
    procedureFees: [{ 
      procedure: { type: String }, 
      fee: { type: Number } 
    }],
    totalAmount: { type: Number },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'partially-paid', 'waived'], 
      default: 'pending' 
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
patientRecordSchema.index({ patientId: 1, visitDate: -1 });
patientRecordSchema.index({ doctorId: 1, visitDate: -1 });
patientRecordSchema.index({ appointmentId: 1 });
patientRecordSchema.index({ visitDate: -1 });
patientRecordSchema.index({ status: 1 });

// Virtual for visit summary
patientRecordSchema.virtual('visitSummary').get(function() {
  return `${this.chiefComplaint} - ${this.finalDiagnosis || this.provisionalDiagnosis}`;
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
