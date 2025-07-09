const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');
const patientAuth = require('../middleware/patientAuth');

// All routes require authentication and patient role
router.use(authMiddleware);
router.use(patientAuth);

// GET /api/appointments - Get all appointments for user
router.get('/', appointmentController.getAppointments);

// GET /api/appointments/upcoming - Get upcoming appointments
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// POST /api/appointments - Add new appointment
router.post('/', appointmentController.addAppointment);

// PUT /api/appointments/:id - Update appointment
router.put('/:id', appointmentController.updateAppointment);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
