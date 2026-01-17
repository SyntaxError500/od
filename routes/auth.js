const express = require('express');
const router = express.Router();
const { registerTeam, loginTeam, loginAdmin, logoutTeam, forceLogoutTeam } = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/register', registerTeam);
router.post('/login', loginTeam);
router.post('/logout', verifyToken, logoutTeam);

router.post('/admin/login', loginAdmin);
router.post('/admin/force-logout/:teamId', verifyToken, verifyAdmin, forceLogoutTeam);

module.exports = router;


