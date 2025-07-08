const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/medications - Get all medications for user
router.get('/', medicationController.getMedications);

// POST /api/medications - Add new medication
router.post('/', medicationController.addMedication);

// PUT /api/medications/:id - Update medication
router.put('/:id', medicationController.updateMedication);

// DELETE /api/medications/:id - Delete medication
router.delete('/:id', medicationController.deleteMedication);

// PUT /api/medications/:id/taken - Mark medication as taken
router.put('/:id/taken', medicationController.markMedicationTaken);

module.exports = router;
