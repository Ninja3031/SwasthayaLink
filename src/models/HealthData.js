const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'glucose', 'bp'
  value: { type: Number, required: true },
  unit: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('HealthData', healthDataSchema); 