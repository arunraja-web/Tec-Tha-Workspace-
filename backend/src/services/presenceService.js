/**
 * In-memory presence service
 * Tracks active Socket.IO connections per user to handle multi-tab / multi-device scenarios cleanly.
 */

// Map of userId -> Set of socket.id strings
const userSocketsMap = new Map();

/**
 * Register a user socket connection
 * @param {string} userId
 * @param {string} socketId
 * @returns {boolean} returns true if user was previously offline (first connection)
 */
const addUserSocket = (userId, socketId) => {
  const key = userId.toString();
  if (!userSocketsMap.has(key)) {
    userSocketsMap.set(key, new Set());
  }

  const userSockets = userSocketsMap.get(key);
  const wasOffline = userSockets.size === 0;

  userSockets.add(socketId);

  return wasOffline;
};

/**
 * Remove a user socket connection
 * @param {string} userId
 * @param {string} socketId
 * @returns {boolean} returns true if user is now completely offline (0 active sockets)
 */
const removeUserSocket = (userId, socketId) => {
  const key = userId.toString();
  if (!userSocketsMap.has(key)) {
    return false;
  }

  const userSockets = userSocketsMap.get(key);
  userSockets.delete(socketId);

  if (userSockets.size === 0) {
    userSocketsMap.delete(key);
    return true; // User became offline
  }

  return false;
};

/**
 * Check if a user is online
 * @param {string} userId
 * @returns {boolean}
 */
const isUserOnline = (userId) => {
  const key = userId.toString();
  const userSockets = userSocketsMap.get(key);
  return userSockets ? userSockets.size > 0 : false;
};

/**
 * Get count of active sockets for a user
 * @param {string} userId
 * @returns {number}
 */
const getUserSocketCount = (userId) => {
  const key = userId.toString();
  const userSockets = userSocketsMap.get(key);
  return userSockets ? userSockets.size : 0;
};

/**
 * Get array of all currently online user IDs
 * @returns {string[]}
 */
const getOnlineUserIds = () => {
  return Array.from(userSocketsMap.keys());
};

module.exports = {
  addUserSocket,
  removeUserSocket,
  isUserOnline,
  getUserSocketCount,
  getOnlineUserIds
};
