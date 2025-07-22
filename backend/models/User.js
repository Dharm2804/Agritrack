const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    default: 'farmer'
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  landSize: {
    type: Number,
    default: 0
  },
  soilType: {
    type: String,
    enum: ['Alluvial', 'Black', 'Red', 'Clay', 'Sandy', 'Other'],
    default: 'Alluvial'
  },
  crops: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  profileImage: {
    type: String
  },
  aadharNumber: {
    type: String,
    trim: true
  },
  farmRegistrationNumber: {
    type: String,
    trim: true
  },
  irrigationType: {
    type: String,
    enum: ['Rainfed', 'Tube Well', 'Canal', 'Drip', 'Sprinkler', 'Other', '']
  },
  documents: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    public_id: {
      type: String
    }
  }],
  validTokens: {
    type: [String],
    default: []
  },
  validRefreshTokens: {
    type: [String],
    default: []
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAuthTokens = function() {
  const user = this;
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Initialize arrays if they don't exist
  if (!user.validTokens) user.validTokens = [];
  if (!user.validRefreshTokens) user.validRefreshTokens = [];

  user.validTokens.push(accessToken);
  user.validRefreshTokens.push(refreshToken);

  return { accessToken, refreshToken };
};

userSchema.methods.invalidateAllTokens = function() {
  const user = this;
  user.validTokens = [];
  user.validRefreshTokens = [];
};

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);