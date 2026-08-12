import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Briefcase,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { userService } from '../../services/userService';
import Button from '../common/Button';

export const UserManagement = () => {
  // Main Data States
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // UI Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modal State: { type: 'create' | 'edit' | 'resetPassword' | 'delete' | null, user: object | null }
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Data States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    password: '',
    role: 'employee',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Users from Backend API
  const fetchUsers = useCallback(async (page = pagination.page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      });

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, pagination.limit, sortBy, sortOrder, pagination.page]);

  // Debounced & Filter Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter, pagination.limit, sortBy, sortOrder]);

  // Auto-dismiss alerts after 5s
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  // Modal Open Handlers
  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      secondaryEmail: '',
      phone: '',
      password: '',
      role: 'employee',
      isActive: true,
    });
    setSelectedUser(null);
    setModalType('create');
    setActionError(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      secondaryEmail: user.secondaryEmail || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'employee',
      isActive: user.isActive ?? true,
    });
    setModalType('edit');
    setActionError(null);
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setFormData({ ...formData, password: '' });
    setModalType('resetPassword');
    setActionError(null);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setActionError(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setSubmitting(false);
    setShowPassword(false);
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        secondaryEmail: formData.secondaryEmail || undefined,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      const res = await userService.createUser(payload);
      setActionSuccess(res.message || 'User created successfully');
      closeModal();
      fetchUsers(1);
    } catch (err) {
      setActionError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        secondaryEmail: formData.secondaryEmail,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      };

      const res = await userService.updateUser(selectedUser.id || selectedUser._id, payload);
      setActionSuccess(res.message || 'User updated successfully');
      closeModal();
      fetchUsers(pagination.page);
    } catch (err) {
      setActionError(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formData.password || formData.password.length < 6) {
      setActionError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await userService.resetUserPassword(
        selectedUser.id || selectedUser._id,
        formData.password
      );
      setActionSuccess(res.message || 'Password reset successfully');
      closeModal();
    } catch (err) {
      setActionError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete User (Soft Delete)
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await userService.deleteUser(selectedUser.id || selectedUser._id);
      setActionSuccess(res.message || 'User deleted successfully');
      closeModal();
      fetchUsers(pagination.page);
    } catch (err) {
      setActionError(err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Toggle User Status
  const handleToggleStatus = async (user) => {
    const targetId = user.id || user._id;
    const newStatus = !user.isActive;
    try {
      const res = await userService.updateUserStatus(targetId, newStatus);
      setActionSuccess(res.message || `User status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      fetchUsers(pagination.page);
    } catch (err) {
      setActionError(err.message || 'Failed to toggle status');
    }
  };

  // Role Badge Styling Helper
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'founder':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            <Briefcase className="w-3 h-3" /> Founder
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            <UserCheck className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-montserrat uppercase tracking-wide">
            <Users className="w-6 h-6 text-indigo-400" />
            User Management & Admin Controls
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, audit, update roles, toggle status, and manage security credentials across all company workspace accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchUsers(pagination.page)}
            disabled={loading}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Users List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={openCreateModal} variant="primary" size="md" icon={UserPlus} className="w-full sm:w-auto">
            Create New User
          </Button>
        </div>
      </div>

      {/* Alert Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 text-slate-100 placeholder-slate-500 text-xs font-medium rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin Only</option>
            <option value="founder">Founder Only</option>
            <option value="employee">Employee Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="inactive">Inactive Accounts Only</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="relative">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="w-full px-3 py-2 bg-slate-950 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="role-asc">Role Order</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">User Info</th>
                <th className="py-3.5 px-4">Primary Email</th>
                <th className="py-3.5 px-4">Secondary Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                    Loading users list...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-rose-400 font-medium">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((userItem) => {
                  const uid = userItem.id || userItem._id;
                  return (
                    <tr key={uid} className="hover:bg-slate-800/40 transition-colors">
                      {/* User Info / Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase text-xs">
                            {userItem.name ? userItem.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{userItem.name}</div>
                            <div className="text-[10px] text-slate-500">ID: {uid.slice(-6)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Primary Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {userItem.email}
                      </td>

                      {/* Secondary Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {userItem.secondaryEmail || <span className="text-slate-600 italic">None</span>}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {userItem.phone || <span className="text-slate-600 italic">None</span>}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(userItem.role)}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(userItem)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                            userItem.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                          title={`Click to ${userItem.isActive ? 'Deactivate' : 'Activate'}`}
                        >
                          {userItem.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(userItem)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => openResetPasswordModal(userItem)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-amber-900/40 text-amber-400 hover:text-amber-300 transition-colors"
                            title="Admin Password Reset"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Soft Delete User Button */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(userItem)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Soft Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</strong> to{' '}
            <strong className="text-white">{Math.min(pagination.page * pagination.limit, pagination.totalUsers)}</strong> of{' '}
            <strong className="text-white">{pagination.totalUsers}</strong> accounts
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Create User Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Create New Account
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Email (Login) *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="alex@tectha.com"
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secondary Email (Recovery)</label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={formData.secondaryEmail}
                    onChange={handleInputChange}
                    placeholder="alex.personal@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="founder">Founder</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set initial password"
                    className="w-full px-3 py-2 pr-9 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <Button type="button" onClick={closeModal} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} variant="primary" size="sm">
                  {submitting ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {modalType === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" /> Edit User ({selectedUser.name})
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secondary Email</label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={formData.secondaryEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="founder">Founder</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300 font-semibold cursor-pointer">
                  Account is Active
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <Button type="button" onClick={closeModal} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} variant="primary" size="sm">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {modalType === 'resetPassword' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <KeyRound className="w-5 h-5" /> Admin Reset Password
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Set a new password for <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3 py-2 pr-9 bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <Button type="button" onClick={closeModal} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} variant="primary" size="sm">
                  {submitting ? 'Resetting...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete User Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Confirm Account Deletion
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Are you sure you want to soft delete account <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email})?
              </p>
              <p className="text-rose-400 bg-rose-950/40 p-3 rounded-lg border border-rose-900/50">
                ⚠️ The user account will be marked inactive and soft-deleted. The user will be immediately barred from logging in.
              </p>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <Button type="button" onClick={closeModal} variant="ghost" size="sm">
                Cancel
              </Button>
              <Button onClick={handleDeleteUser} disabled={submitting} variant="outline" size="sm" className="border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white">
                {submitting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
