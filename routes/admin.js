const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const {
  getPendingTeams,
  approveTeam,
  getAllTeams,
  uploadLocationHints,
  uploadQRCodes,
  getLeaderboard
} = require('../controllers/adminController');

// All admin routes require authentication
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/pending-teams', getPendingTeams);
router.post('/approve-team/:teamId', approveTeam);
router.get('/teams', getAllTeams);
router.post('/location-hints', uploadLocationHints);
router.post('/qrcodes', uploadQRCodes);
router.get('/leaderboard', getLeaderboard);

module.exports = router;


