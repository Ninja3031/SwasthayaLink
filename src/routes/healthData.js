const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addHealthData, listHealthData } = require('../controllers/healthDataController');

router.post('/', auth, addHealthData);
router.get('/', auth, listHealthData);

module.exports = router; 