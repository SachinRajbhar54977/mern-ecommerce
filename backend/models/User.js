const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  fullName:   { type: String, required: true },
  phone:      { type: String, required: true },
  street:     { type: String, required: true },
  city:       { type: String, required: true },
  state:      { type: String, required: true },
  postalCode: { type: String, required: true },
  country:    { type: String, required: true, default: 'India' },
  isDefault:  { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      public_id: String,
      url: { type: String, default: '' },
    },
    phone:     { type: String, default: '' },
    addresses: [addressSchema],
    isBlocked: { type: Boolean, default: false },
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
    emailVerifyToken:     String,
    isEmailVerified:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
