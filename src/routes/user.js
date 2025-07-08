const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, linkAbhaId } = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.put('/abha', auth, linkAbhaId);

module.exports = router; 