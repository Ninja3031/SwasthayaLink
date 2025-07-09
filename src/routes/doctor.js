const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/auth');
const doctorMiddleware = require('../middleware/doctorAuth');

// All routes require authentication and doctor role
router.use(authMiddleware);
router.use(doctorMiddleware);

// Dashboard
router.get('/dashboard', doctorController.getDashboard);

// Appointments
router.get('/appointments', doctorController.getAppointments);
router.post('/appointments', doctorController.createAppointment);
router.put('/appointments/:id', doctorController.updateAppointment);

// Patients
router.get('/patients', doctorController.getPatients);
router.get('/patients/:patientId', doctorController.getPatientDetails);

// Analytics
router.get('/analytics', doctorController.getAnalytics);

// Time Slots
router.get('/timeslots', doctorController.getTimeSlots);
router.post('/timeslots', doctorController.createTimeSlot);
router.put('/timeslots/:id', doctorController.updateTimeSlot);
router.delete('/timeslots/:id', doctorController.deleteTimeSlot);

// Profile
router.put('/profile', doctorController.updateProfile);

module.exports = router;
