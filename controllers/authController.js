const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const Admin = require('../models/Admin');

// Generate JWT token
const generateToken = (id, username, role) => {
  return jwt.sign(
    { id, username, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Team Logout
exports.logoutTeam = async (req, res, next) => {
  try {
    const teamId = req.user.id;
    
    // Clear the active token
    await Team.findByIdAndUpdate(teamId, { activeToken: null });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin force logout team (admin only)
exports.forceLogoutTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    // Verify admin is performing this action
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can force logout teams' });
    }

    // Validate teamId is a valid MongoDB ObjectId
    if (!teamId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }

    const team = await Team.findByIdAndUpdate(teamId, { activeToken: null }, { new: true });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found in database' });
    }

    res.json({
      success: true,
      message: `Team ${team.teamName} has been forced logged out`
    });
  } catch (error) {
    next(error);
  }
};

// Team Registration
exports.registerTeam = async (req, res, next) => {
  try {
    const { teamName, leaderName, username, password, email, phone } = req.body;

    // Check if username already exists
    const existingTeam = await Team.findOne({ username });
    if (existingTeam) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if team name already exists
    const existingTeamName = await Team.findOne({ teamName });
    if (existingTeamName) {
      return res.status(400).json({ error: 'Team name already exists' });
    }

    const team = await Team.create({
      teamName,
      leaderName,
      username,
      password,
      email: email || '',
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for admin approval.',
      teamId: team._id
    });
  } catch (error) {
    next(error);
  }
};

// Team Login
exports.loginTeam = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }

    const team = await Team.findOne({ username }).select('+password');
    
    if (!team) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!team.approved) {
      return res.status(403).json({ error: 'Team not approved by admin yet' });
    }

    // Check if team is already logged in from another device
    if (team.activeToken) {
      return res.status(403).json({ 
        error: 'Team is already logged in from another device. Please logout from that device first or contact admin to force logout.' 
      });
    }

    const isMatch = await team.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(team._id, team.username, 'team');

    // Store the active token in database
    team.activeToken = token;
    await team.save();

    res.json({
      success: true,
      token,
      team: {
        id: team._id,
        teamName: team.teamName,
        leaderName: team.leaderName,
        score: team.score
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin Login
exports.loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    const token = generateToken(admin._id, admin.username, 'admin');

    res.json({
      success: true,
      token,
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};


