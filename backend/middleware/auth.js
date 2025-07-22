const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header missing',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN_PROVIDED'
      });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found for this token',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if token is in user's validTokens array
    if (user.validTokens && !user.validTokens.includes(token)) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is no longer valid',
        code: 'TOKEN_REVOKED'
      });
    }

    // Add user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    const status = err.name === 'TokenExpiredError' ? 401 : (err.status || 500);
    const message = err.message || 'Authentication failed';
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 
                 err.name === 'JsonWebTokenError' ? 'INVALID_TOKEN' : 'AUTH_ERROR';
    
    res.status(status).json({ 
      success: false,
      message,
      code
    });
  }
};

module.exports = auth;