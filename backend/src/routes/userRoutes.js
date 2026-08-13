const express = require('express');
const router = express.Router();

const {
  createUser,
  getUsers,
  getChatDirectory,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateUserId,
  createUserRules,
  updateUserRules,
  updateStatusRules,
  updateRoleRules,
  adminResetPasswordRules
} = require('../validators/userValidator');

// All user routes require authentication.
router.use(protect);

// Any workspace member may read this limited directory to begin a direct chat.
router.get('/directory', getChatDirectory);

// User management remains Admin-only.
router.use(authorize('admin'));

// Core User Management Endpoints
router
  .route('/')
  .post(createUserRules, createUser)
  .get(getUsers);

router
  .route('/:id')
  .get(validateUserId, getUserById)
  .put(updateUserRules, updateUser)
  .delete(validateUserId, deleteUser);

router.patch('/:id/status', updateStatusRules, updateUserStatus);
router.patch('/:id/role', updateRoleRules, updateUserRole);
router.patch('/:id/reset-password', adminResetPasswordRules, resetUserPassword);

module.exports = router;
