const express = require('express');
const router = express.Router();
const glucoseTargetController = require('../controllers/glucoseTargetController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Get glucose targets
router.get('/', glucoseTargetController.getGlucoseTargets);

// Update glucose targets
router.put('/', glucoseTargetController.updateGlucoseTargets);

// Get glucose analysis with target comparison
router.get('/analysis', glucoseTargetController.getGlucoseAnalysis);

// Update reminder settings
router.put('/reminders', glucoseTargetController.updateReminderSettings);

module.exports = router;
