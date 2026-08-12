const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper to parse cookie header string into an object
 */
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (!name) return;
    const value = parts.join('=').trim();
    if (!value) return;
    cookies[name] = decodeURIComponent(value);
  });

  return cookies;
};

/**
 * Socket.IO authentication middleware
 * Validates JWT token from HTTP-only cookie or auth handshake header
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = null;

    // 1. Try reading token from HTTP-only cookie in handshake header
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
      const parsed = parseCookies(cookieHeader);
      if (parsed.token) {
        token = parsed.token;
      }
    }

    // 2. Fallback to handshake auth payload or authorization header
    if (!token && socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }
    } else if (!token && socket.handshake.headers.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return next(new Error('Authentication failed: Token is missing.'));
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key'
    );

    if (!decoded || !decoded.userId) {
      return next(new Error('Authentication failed: Invalid token payload.'));
    }

    // Verify User exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('Authentication failed: User account no longer exists.'));
    }

    if (!user.isActive) {
      return next(new Error('Authentication failed: User account is deactivated.'));
    }

    // Attach authenticated user to socket instance
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error(`Authentication failed: ${error.message}`));
  }
};

module.exports = socketAuthMiddleware;
