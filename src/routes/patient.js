const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/auth');
const doctorMiddleware = require('../middleware/doctorAuth');

// All routes require authentication and doctor role
router.use(authMiddleware);
router.use(doctorMiddleware);

// Patient management routes
router.get('/', patientController.getPatients);
router.post('/', patientController.addPatient);
router.get('/stats', patientController.getPatientStats);
router.get('/:patientId', patientController.getPatientDetails);
router.put('/:patientId', patientController.updatePatient);
router.post('/:patientId/notes', patientController.addPatientNote);

// Patient records routes
router.post('/:patientId/records', patientController.createPatientRecord);
router.get('/:patientId/records', patientController.getPatientRecords);
router.put('/records/:recordId', patientController.updatePatientRecord);

module.exports = router;
