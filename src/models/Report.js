const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  ocrResult: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema); 