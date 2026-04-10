const jwt          = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User         = require('../models/User');
const { ErrorResponse } = require('./errorHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header first (works cross-domain)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fall back to cookie (works same-domain)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) throw new ErrorResponse('Not authorized, no token', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user    = await User.findById(decoded.id).select('-password');

  if (!user)          throw new ErrorResponse('User not found', 404);
  if (user.isBlocked) throw new ErrorResponse('Your account has been blocked', 403);

  req.user = user;
  next();
});

exports.admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new ErrorResponse('Access denied: Admins only', 403);
  }
  next();
};
