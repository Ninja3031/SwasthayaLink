const Report = require('../models/Report');
const axios = require('axios');
const path = require('path');

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    // Call local PaddleOCR microservice
    let ocrResult = null;
    try {
      const ocrRes = await axios.post('http://localhost:5001/ocr', { filePath });
      ocrResult = ocrRes.data;
    } catch (ocrErr) {
      ocrResult = { error: 'OCR failed', details: ocrErr.message };
    }
    const report = new Report({
      user: req.user.userId,
      filePath,
      fileType,
      ocrResult,
    });
    await report.save();
    res.status(201).json({ message: 'Report uploaded', report });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user.userId });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 