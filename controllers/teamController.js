const QRCode = require('../models/QRCode');
const LocationHint = require('../models/LocationHint');
const Answer = require('../models/Answer');
const Team = require('../models/Team');

// Get location hints for a round
exports.getLocationHints = async (req, res, next) => {
  try {
    const { round } = req.params;
    const locationHint = await LocationHint.findOne({ round });
    
    res.json({
      success: true,
      hints: locationHint?.hints || []
    });
  } catch (error) {
    next(error);
  }
};

// Get all rounds
exports.getRounds = async (req, res, next) => {
  try {
    const locationHints = await LocationHint.find().sort({ round: 1 });
    const rounds = locationHints.map(h => h.round);
    
    res.json({
      success: true,
      rounds
    });
  } catch (error) {
    next(error);
  }
};

// Scan QR code
exports.scanQR = async (req, res, next) => {
  try {
    const { qrValue } = req.body;
    const teamId = req.user.id;

    if (!qrValue) {
      return res.status(400).json({ error: 'QR value is required' });
    }

    const qrCode = await QRCode.findOne({ value: qrValue, active: true });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Check if scan limit reached
    if (qrCode.scans >= qrCode.maxScans) {
      return res.status(403).json({ error: 'QR code scan limit reached' });
    }

    // Check if team already scanned this QR
    const existingAnswer = await Answer.findOne({
      teamId,
      qrValue
    });

    if (existingAnswer) {
      return res.status(400).json({ error: 'QR code already scanned by your team' });
    }

    // Increment scan count
    qrCode.scans += 1;
    await qrCode.save();

    res.json({
      success: true,
      question: qrCode.question,
      questionLink: qrCode.questionLink,
      time: qrCode.time,
      points: qrCode.points,
      queimagename: qrCode.queimagename,
      qrNumber: qrCode.number
    });
  } catch (error) {
    next(error);
  }
};

// Submit answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { qrValue, answer } = req.body;
    const teamId = req.user.id;

    if (!qrValue || !answer) {
      return res.status(400).json({ error: 'QR value and answer are required' });
    }

    const qrCode = await QRCode.findOne({ value: qrValue, active: true });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Check if already answered
    const existingAnswer = await Answer.findOne({
      teamId,
      qrValue
    });

    if (existingAnswer) {
      return res.status(400).json({ error: 'Already answered this question' });
    }

    const isCorrect = answer.toLowerCase().trim() === qrCode.answer.toLowerCase().trim();
    const points = isCorrect ? qrCode.points : 0;

    // Save answer
    const answerDoc = await Answer.create({
      teamId,
      qrValue,
      qrCodeId: qrCode._id,
      answer: answer.trim(),
      isCorrect,
      points
    });

    // Update team score if correct
    if (isCorrect) {
      const team = await Team.findById(teamId);
      if (team) {
        team.score += points;
        await team.save();
      }
    }

    res.json({
      success: true,
      isCorrect,
      points,
      correctAnswer: isCorrect ? undefined : qrCode.answer
    });
  } catch (error) {
    next(error);
  }
};

// Get team score
exports.getTeamScore = async (req, res, next) => {
  try {
    const team = await Team.findById(req.user.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      success: true,
      score: team.score,
      teamName: team.teamName
    });
  } catch (error) {
    next(error);
  }
};

// Get leaderboard (public)
exports.getLeaderboard = async (req, res, next) => {
  try {
    const teams = await Team.find({ approved: true })
      .sort({ score: -1 })
      .select('teamName score')
      .limit(100);
    
    res.json({
      success: true,
      teams
    });
  } catch (error) {
    next(error);
  }
};


