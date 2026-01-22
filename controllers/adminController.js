const Team = require('../models/Team');
const QRCode = require('../models/QRCode');
const LocationHint = require('../models/LocationHint');
const Answer = require('../models/Answer');

// Get pending teams
exports.getPendingTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ approved: false }).sort({ createdAt: -1 });
    res.json({ success: true, teams });
  } catch (error) {
    next(error);
  }
};

// Approve team
exports.approveTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    team.approved = true;
    await team.save();

    res.json({
      success: true,
      message: 'Team approved successfully',
      team
    });
  } catch (error) {
    next(error);
  }
};

// Get all teams
exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json({ success: true, teams });
  } catch (error) {
    next(error);
  }
};

// Upload location hints
exports.uploadLocationHints = async (req, res, next) => {
  try {
    const { round, hints } = req.body;

    if (!round || !Array.isArray(hints)) {
      return res.status(400).json({ error: 'Round number and hints array are required' });
    }

    let locationHint = await LocationHint.findOne({ round });
    
    if (locationHint) {
      locationHint.hints = hints;
      await locationHint.save();
    } else {
      locationHint = await LocationHint.create({ round, hints });
    }

    res.json({
      success: true,
      message: 'Location hints uploaded successfully',
      locationHint
    });
  } catch (error) {
    next(error);
  }
};

// Upload QR codes
exports.uploadQRCodes = async (req, res, next) => {
  try {
    const { qrcodes } = req.body;

    if (!qrcodes || typeof qrcodes !== 'object') {
      return res.status(400).json({ error: 'QR codes object is required' });
    }

    const results = [];
    
    for (const [key, qrData] of Object.entries(qrcodes)) {
      let qrCode = await QRCode.findOne({ key });
      
      if (qrCode) {
        // Update existing QR code
        Object.assign(qrCode, {
          number: qrData.number,
          value: qrData.value,
          question: qrData.question,
          questionLink:qrData.questionLink,
          answer: qrData.answer,
          time: qrData.time,
          points: qrData.points,
          maxScans: qrData.maxScans || qrCode.maxScans,
          queimagename: qrData.queimagename || '',
          round: qrData.round || qrCode.round || 1
        });
        await qrCode.save();
      } else {
        // Create new QR code
        qrCode = await QRCode.create({
          key,
          number: qrData.number,
          value: qrData.value,
          question: qrData.question,
          questionLink:qrData.questionLink,
          answer: qrData.answer,
          time: qrData.time,
          points: qrData.points,
          scans: qrData.scans || 0,
          maxScans: qrData.maxScans || 10,
          queimagename: qrData.queimagename || '',
          round: qrData.round || 1
        });
      }
      
      results.push(qrCode);
    }

    res.json({
      success: true,
      message: 'QR codes uploaded successfully',
      count: results.length
    });
  } catch (error) {
    next(error);
  }
};

// Admin resets a team's password
exports.updateTeamPassword = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const team = await Team.findById(teamId).select('+password');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    team.password = newPassword;
    team.activeToken = null; // Invalidate active sessions after password reset
    await team.save();

    res.json({
      success: true,
      message: 'Team password updated successfully and active sessions revoked'
    });
  } catch (error) {
    next(error);
  }
};

// Get leaderboard (admin view)
exports.getLeaderboard = async (req, res, next) => {
  try {
    const teams = await Team.find({ approved: true })
      .sort({ score: -1 })
      .select('teamName leaderName score createdAt');
    
    res.json({ success: true, teams });
  } catch (error) {
    next(error);
  }
};


