const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      location,
      landSize,
      soilType,
      crops,
      skills,
      profileImage,
      aadharNumber,
      farmRegistrationNumber,
      irrigationType,
      documents,
    } = req.body;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized',
        code: 'NOT_AUTHORIZED'
      });
    }

    if (!name || !email || !phone || !location) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, phone, and location are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (documents && !Array.isArray(documents)) {
      return res.status(400).json({ 
        success: false,
        message: 'Documents must be an array',
        code: 'INVALID_DOCUMENTS_FORMAT'
      });
    }

    if (documents) {
      for (const doc of documents) {
        if (!doc.type || !doc.url || !doc.name) {
          return res.status(400).json({
            success: false,
            message: 'Each document must have type, url, and name',
            code: 'INVALID_DOCUMENT_FORMAT'
          });
        }
      }
    }

    const updateData = {
      name,
      email,
      phone,
      location,
      landSize: landSize || 0,
      soilType: soilType || 'Alluvial',
      crops: crops || [],
      skills: skills || [],
      profileImage,
      aadharNumber,
      farmRegistrationNumber,
      irrigationType,
      documents: documents || [],
    };

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -validTokens -validRefreshTokens');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -validTokens -validRefreshTokens');
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;