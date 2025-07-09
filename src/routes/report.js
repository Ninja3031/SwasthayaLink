const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { uploadReport, listReports, getReport } = require('../controllers/reportController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination called');
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log('Multer filename called for:', file.originalname);
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + file.fieldname + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message === 'Only images and PDFs are allowed') {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' });
  }
  next(err);
};

// Test endpoint to check if route is working
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Reports route is working' });
});

router.post('/upload', auth, upload.single('file'), handleMulterError, uploadReport);
router.get('/', auth, listReports);
router.get('/:id', auth, getReport);

module.exports = router; 