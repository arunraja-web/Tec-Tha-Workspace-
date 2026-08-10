const express = require('express');
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createUserRules,
  updateUserRules,
  updateStatusRules,
  updateRoleRules,
  adminResetPasswordRules
} = require('../validators/userValidator');

// Protect and authorize all routes in this file for Admin role only
router.use(protect);
router.use(authorize('admin'));

// Core User Management Endpoints
router
  .route('/')
  .post(createUserRules, createUser)
  .get(getUsers);

router
  .route('/:id')
  .get(getUserById)
  .put(updateUserRules, updateUser)
  .delete(deleteUser);

router.patch('/:id/status', updateStatusRules, updateUserStatus);
router.patch('/:id/role', updateRoleRules, updateUserRole);
router.patch('/:id/reset-password', adminResetPasswordRules, resetUserPassword);

module.exports = router;
