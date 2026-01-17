const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const Admin = require('../models/Admin');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ username: req.user.username });
    
    if (!admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error verifying admin' });
  }
};

// Verify team
const verifyTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.user.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (!team.approved) {
      return res.status(403).json({ error: 'Team not approved yet' });
    }

    // Verify that the token matches the active token
    const token = req.headers.authorization?.split(' ')[1];
    if (team.activeToken !== token) {
      return res.status(403).json({ error: 'Your session has been invalidated. Please login again.' });
    }
    
    req.team = team;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error verifying team' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyTeam
};


