const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const user = await User.findByCredentials(email, password);
    
    const tokens = user.generateAuthTokens();
    
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.validTokens;
    delete userData.validRefreshTokens;

    res.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userData,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Detailed login error:', error);
    res.status(401).json({ 
      success: false,
      message: error.message || 'Login failed',
      code: 'LOGIN_FAILED'
    });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, landSize, soilType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role cannot be assigned via signup',
        code: 'INVALID_ROLE'
      });
    }

    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use',
        code: 'EMAIL_IN_USE'
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'farmer',
      phone,
      location,
      landSize,
      soilType,
      documents: [],
    });

    await newUser.save();
    const { accessToken, refreshToken } = newUser.generateAuthTokens();
    await newUser.save();

    const userData = newUser.toObject();
    delete userData.password;
    delete userData.validTokens;
    delete userData.validRefreshTokens;

    res.status(201).json({ 
      success: true,
      token: accessToken,
      refreshToken,
      user: userData,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message,
      code: 'REGISTRATION_FAILED'
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid user',
        code: 'INVALID_USER'
      });
    }

    user.invalidateAllTokens();
    await user.save();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    if (!user.validRefreshTokens.includes(refreshToken)) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token revoked',
        code: 'REFRESH_TOKEN_REVOKED'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = user.generateAuthTokens();
    user.validRefreshTokens = user.validRefreshTokens.filter(t => t !== refreshToken);
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.validTokens;
    delete userData.validRefreshTokens;

    res.json({
      success: true,
      token: accessToken,
      refreshToken: newRefreshToken,
      user: userData,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    let message = 'Token refresh failed';
    let code = 'REFRESH_FAILED';
    let status = 401;
    
    if (error.name === 'TokenExpiredError') {
      message = 'Refresh token expired';
      code = 'REFRESH_TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid refresh token';
      code = 'INVALID_REFRESH_TOKEN';
    }
    
    res.status(status).json({ 
      success: false,
      message,
      code
    });
  }
});

module.exports = router;