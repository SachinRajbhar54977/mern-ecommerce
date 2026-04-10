const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { ErrorResponse } = require('./errorHandler');

// Protect routes — require valid JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) throw new ErrorResponse('Not authorized, no token', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user)       throw new ErrorResponse('User not found', 404);
  if (user.isBlocked) throw new ErrorResponse('Your account has been blocked', 403);

  req.user = user;
  next();
});

// Restrict to admin role
exports.admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new ErrorResponse('Access denied: Admin only', 403);
  }
  next();
};
