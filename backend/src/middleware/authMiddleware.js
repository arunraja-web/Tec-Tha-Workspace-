const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect routes - Verify JWT token from HTTP-only cookie (or auth header fallback)
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Get token from HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Bearer token in Authorization header if present
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key'
    );

    // Get user from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return sendError(res, 401, 'User account no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'User account is deactivated. Please contact an administrator.');
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized to access this route');
  }
};

/**
 * Grant access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
