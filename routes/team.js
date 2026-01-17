const express = require('express');
const router = express.Router();
const { verifyToken, verifyTeam } = require('../middleware/auth');
const {
  getLocationHints,
  getRounds,
  scanQR,
  submitAnswer,
  getTeamScore,
  getLeaderboard
} = require('../controllers/teamController');


router.use(verifyToken);
router.use(verifyTeam);

router.get('/location-hints/:round', getLocationHints);
router.get('/rounds', getRounds);
router.post('/scan-qr', scanQR);
router.post('/submit-answer', submitAnswer);
router.get('/score', getTeamScore);
router.get('/leaderboard', getLeaderboard);

module.exports = router;


