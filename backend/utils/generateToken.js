const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  // Cookie settings — secure only in production
  const cookieOptions = {
    expires:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Always send token in BOTH cookie AND response body
  // Frontend uses the body token (Authorization header) — works cross-domain
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,   // ← frontend stores this in localStorage and sends as Bearer token
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
        token,  // ← also nested so localStorage item has it
      },
    });
};

module.exports = { generateToken, sendTokenResponse };
