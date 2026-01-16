const express = require('express');
const router = express.Router();
const { registerTeam, loginTeam, loginAdmin } = require('../controllers/authController');


router.post('/register', registerTeam);
router.post('/login', loginTeam);


router.post('/admin/login', loginAdmin);

module.exports = router;


