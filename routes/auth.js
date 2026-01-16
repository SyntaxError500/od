const express = require('express');
const router = express.Router();
const { registerTeam, loginTeam, loginAdmin } = require('../controllers/authController');

// Team routes
router.post('/register', registerTeam);
router.post('/login', loginTeam);

// Admin routes
router.post('/admin/login', loginAdmin);

module.exports = router;


