const asyncHandler = require('express-async-handler');
const crypto       = require('crypto');
const User         = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { ErrorResponse }     = require('../middleware/errorHandler');

// @desc    Register
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ErrorResponse('Email already registered', 400);
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res, 'Account created successfully');
});

// @desc    Login
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ErrorResponse('Please provide email and password', 400);
  const user = await User.findOne({ email }).select('+password');
  if (!user)          throw new ErrorResponse('Invalid credentials', 401);
  if (user.isBlocked) throw new ErrorResponse('Your account has been blocked', 403);
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ErrorResponse('Invalid credentials', 401);
  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires:  new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/update-profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );
  res.json({ success: true, message: 'Profile updated', user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ErrorResponse('Current password is incorrect', 400);
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ErrorResponse('No user with that email', 404);
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  res.json({ success: true, message: 'Password reset link generated', resetUrl });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) throw new ErrorResponse('Invalid or expired reset token', 400);
  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Add address
// @route   POST /api/auth/addresses
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, message: 'Address added', addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, message: 'Address removed', addresses: user.addresses });
});
