const jwt = require('jsonwebtoken');

/**
 * Generate JWT token containing only userId
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Send JWT in an HTTP-Only secure cookie and return standardized payload
 */
const sendTokenCookie = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id || user.id);

  const expiresDays = parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10);
  const cookieOptions = {
    expires: new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  const userObj = typeof user.toObject === 'function' ? user.toObject() : user;

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        id: userObj.id || userObj._id,
        name: userObj.name,
        email: userObj.email,
        secondaryEmail: userObj.secondaryEmail || null,
        phone: userObj.phone,
        role: userObj.role,
        isActive: userObj.isActive,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt
      }
    }
  });
};

module.exports = {
  generateToken,
  sendTokenCookie
};
