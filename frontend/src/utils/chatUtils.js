/**
 * Format timestamp for message bubbles and conversation list
 */
export const formatChatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Format date divider pill for chat timeline
 */
export const formatDateDivider = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Format full date-time for detailed tooltips
 */
export const formatFullDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Deterministic color picker for group chat sender names
 */
export const getSenderColor = (nameOrId = '') => {
  const colors = [
    '#53bdeb', // Cyan / Light Blue
    '#e542a3', // Pink
    '#25d366', // Green
    '#ffad1f', // Amber / Orange
    '#a855f7', // Purple
    '#00b5d8', // Teal
    '#f43f5e', // Rose
    '#6366f1', // Indigo
  ];
  let hash = 0;
  const str = String(nameOrId || 'User');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Check if a message or participant belongs to the current user
 */
export const checkIsOwnMessage = (sender, currentUserId, currentUserEmail, authUser) => {
  if (!sender) return false;

  const extractId = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'object') {
      if (val._id) return String(val._id).trim();
      if (val.id) return String(val.id).trim();
      if (typeof val.toString === 'function' && val.toString() !== '[object Object]') {
        return val.toString().trim();
      }
    }
    return String(val).trim();
  };

  const extractEmail = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && val.includes('@')) return val.toLowerCase().trim();
    if (typeof val === 'object' && val.email) return String(val.email).toLowerCase().trim();
    return '';
  };

  // LocalStorage session fallback
  let storedUser = null;
  try {
    const raw = localStorage.getItem('vcw_authenticated_user');
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {}

  const senderId = extractId(sender);
  const senderEmail = extractEmail(sender);

  const myIds = [
    extractId(currentUserId),
    extractId(authUser?._id),
    extractId(authUser?.id),
    extractId(storedUser?._id),
    extractId(storedUser?.id),
  ].filter(Boolean);

  const myEmails = [
    extractEmail(currentUserEmail),
    extractEmail(authUser?.email),
    extractEmail(storedUser?.email),
  ].filter(Boolean);

  if (senderId && myIds.some((id) => id === senderId)) {
    return true;
  }

  if (senderEmail && myEmails.some((email) => email === senderEmail)) {
    return true;
  }

  return false;
};

/**
 * Extract recipient user details for direct conversation preview
 */
export const getDirectRecipient = (conversation, currentUserId, currentUserEmail, authUser) => {
  if (!conversation || conversation.type !== 'direct') return null;

  if (Array.isArray(conversation.participants)) {
    const recipient = conversation.participants.find(
      (p) => !checkIsOwnMessage(p, currentUserId, currentUserEmail, authUser)
    );
    if (typeof recipient === 'object') return recipient;
  }

  // Fallback to recipient property if populated
  return conversation.recipient || { name: 'Direct User' };
};

/**
 * Trigger file download for chat attachments
 */
export const downloadFile = async (url, fileName) => {
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Format file size in human-readable bytes (KB, MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Safely check if a user is online, accounting for _id, id, string, or object representations
 */
export const getIsUserOnline = (userOrId, onlineUsers = {}) => {
  if (!userOrId || !onlineUsers) return { isOnline: false, lastSeen: null };

  const idsToCheck = [];

  if (typeof userOrId === 'string') {
    idsToCheck.push(userOrId.trim());
  } else if (typeof userOrId === 'object') {
    if (userOrId._id) idsToCheck.push(String(userOrId._id).trim());
    if (userOrId.id) idsToCheck.push(String(userOrId.id).trim());
  }

  for (const id of idsToCheck) {
    if (id && onlineUsers[id]) {
      return {
        isOnline: !!onlineUsers[id].isOnline,
        lastSeen: onlineUsers[id].lastSeen || null,
      };
    }
  }

  return { isOnline: false, lastSeen: null };
};

/**
 * Safely extract group member objects from conversation
 */
export const getGroupMembers = (conversation) => {
  if (!conversation || conversation.type !== 'group') return [];

  let rawMembers = [];

  if (conversation.group && Array.isArray(conversation.group.members) && conversation.group.members.length > 0) {
    rawMembers = conversation.group.members;
  } else if (Array.isArray(conversation.participants) && conversation.participants.length > 0) {
    rawMembers = conversation.participants;
  } else if (Array.isArray(conversation.members) && conversation.members.length > 0) {
    rawMembers = conversation.members;
  }

  return rawMembers.map((m) => {
    if (typeof m === 'object' && m !== null) {
      return {
        _id: m._id || m.id,
        id: m.id || m._id,
        name: m.name || m.email || 'Group Member',
        email: m.email || '',
        role: m.role || 'employee',
      };
    }
    return {
      _id: m,
      id: m,
      name: 'Group Member',
      email: '',
      role: '',
    };
  });
};



