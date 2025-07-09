const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const patientAuth = require('../middleware/patientAuth');
const { getProfile, linkAbhaId } = require('../controllers/userController');

// Patient-specific routes (require patient role)
router.get('/profile', auth, getProfile); // Allow both patients and doctors to get their profile
router.put('/abha', auth, patientAuth, linkAbhaId); // Only patients can link ABHA ID

module.exports = router; 