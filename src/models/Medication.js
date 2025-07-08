const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  timeOfDay: [{ type: String }], // Array of times like ['08:00', '20:00']
  instructions: { type: String },
  taken: { type: Boolean, default: false },
  lastTaken: { type: Date },
  prescribedBy: { type: String },
  pharmacyStatus: { type: String, enum: ['pending', 'ready', 'delivered'], default: 'pending' },
  refillsRemaining: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
