const Report = require('../models/Report');
const axios = require('axios');
const path = require('path');

exports.uploadReport = async (req, res) => {
  try {
    console.log('Upload report request received');
    console.log('File:', req.file);
    console.log('User:', req.user);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    console.log('File path:', filePath, 'File type:', fileType);

    // Call local PaddleOCR microservice on port 3001 (optional - will skip if not available)
    let ocrResult = null;
    try {
      console.log('Attempting OCR processing on localhost:3001...');
      const ocrRes = await axios.post('http://localhost:3001/ocr', { filePath });
      ocrResult = ocrRes.data;
      console.log('OCR processing successful');
    } catch (ocrErr) {
      console.log('OCR processing failed (this is optional):', ocrErr.message);
      ocrResult = {
        error: 'OCR service unavailable',
        details: 'OCR processing will be available when the service is running on port 3001',
        extractedText: 'OCR processing not available'
      };
    }

    console.log('Creating report record...');
    const report = new Report({
      user: req.user.userId,
      filePath,
      fileType,
      ocrResult,
    });

    await report.save();
    console.log('Report saved successfully:', report._id);

    res.status(201).json({ message: 'Report uploaded', report });
  } catch (err) {
    console.error('Upload report error:', err);
    console.error('Error details:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
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