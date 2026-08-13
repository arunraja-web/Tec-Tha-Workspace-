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

// Zoho-style User Initials Helper (e.g. "Alex Morgan" -> "AM")
const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

  // Role Badge Styling Helper (Zoho Directory Style)
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-bold bg-blue-50 text-[#0562ff] border border-blue-200 uppercase tracking-wider font-montserrat">
            <Shield className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'founder':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider font-montserrat">
            <Briefcase className="w-3.5 h-3.5" /> Founder
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider font-montserrat">
            <UserCheck className="w-3.5 h-3.5" /> Employee
          </span>
        );
    }
  };

  return (
    <div className="font-montserrat">
      
      {/* Unified Single Card Container with NO gap between sections (divide-y divide-slate-200) */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm divide-y divide-slate-200 w-full">
        
        {/* Section 1: Page Header & Global Actions */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3 font-montserrat uppercase tracking-wide">
              <Users className="w-7 h-7 text-[#0562ff]" />
              User Directory & Accounts
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage organization users, access levels, roles, security credentials, and directory parameters across TEC THA Workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => fetchUsers(pagination.page)}
              disabled={loading}
              className="p-3 rounded-none bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Users Directory"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-sm px-5 py-3 rounded-none shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat whitespace-nowrap"
            >
              <UserPlus className="w-4.5 h-4.5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Section 2: Alert Banners */}
        {actionSuccess && (
          <div className="p-4 rounded-none bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-none bg-rose-50 text-rose-800 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Section 3: Filters Toolbar */}
        <div className="p-4 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium rounded-none border border-slate-300 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all font-montserrat"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-sm font-medium rounded-none border border-slate-300 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all cursor-pointer font-montserrat"
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
              className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-sm font-medium rounded-none border border-slate-300 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all cursor-pointer font-montserrat"
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
              className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-sm font-medium rounded-none border border-slate-300 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all cursor-pointer font-montserrat"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="role-asc">Role Order</option>
            </select>
          </div>
        </div>

        {/* Section 4: Zoho Directory Users Table (Including Serial Number S.NO & User Letters) */}
        <div className="w-full">
          <table className="w-full text-left text-sm border-collapse font-montserrat table-auto">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-xs">
                <th className="py-3.5 px-3 w-12 text-center">S.No</th>
                <th className="py-3.5 px-3 w-12 text-center">User</th>
                <th className="py-3.5 px-4 min-w-[140px]">Full Name</th>
                <th className="py-3.5 px-4 min-w-[160px]">Primary Email</th>
                <th className="py-3.5 px-4 min-w-[160px]">Secondary Email</th>
                <th className="py-3.5 px-3 min-w-[110px]">Phone</th>
                <th className="py-3.5 px-3 min-w-[100px]">Role</th>
                <th className="py-3.5 px-3 min-w-[95px]">Status</th>
                <th className="py-3.5 px-4 text-right min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-14 text-center text-slate-500 font-medium text-sm">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#0562ff] mb-2" />
                    Loading directory accounts...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-rose-600 font-semibold text-sm">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-14 text-center text-slate-500 font-medium text-sm">
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((userItem, index) => {
                  const uid = userItem.id || userItem._id;
                  const initials = getUserInitials(userItem.name);
                  const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                  return (
                    <tr key={uid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Serial Number S.NO */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-600 text-xs sm:text-sm font-mono">
                        {serialNumber}
                      </td>

                      {/* User Letters / Initials Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="w-9 h-9 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0562ff] uppercase text-xs font-montserrat shadow-xs mx-auto">
                          {initials}
                        </div>
                      </td>

                      {/* Full Name & User ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm font-montserrat leading-tight">{userItem.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {uid.slice(-6)}</div>
                      </td>

                      {/* Primary Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-800 font-medium text-xs sm:text-sm truncate max-w-[180px]" title={userItem.email}>
                        {userItem.email}
                      </td>

                      {/* Secondary Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-xs sm:text-sm truncate max-w-[180px]" title={userItem.secondaryEmail || 'None'}>
                        {userItem.secondaryEmail || <span className="text-slate-400 italic">None</span>}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 text-slate-800 font-mono text-xs sm:text-sm font-medium whitespace-nowrap">
                        {userItem.phone || <span className="text-slate-400 italic">None</span>}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getRoleBadge(userItem.role)}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(userItem)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-bold border transition-all cursor-pointer font-montserrat ${
                            userItem.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                          title={`Click to ${userItem.isActive ? 'Deactivate' : 'Activate'}`}
                        >
                          {userItem.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-500" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(userItem)}
                            className="p-1.5 rounded-none bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => openResetPasswordModal(userItem)}
                            className="p-1.5 rounded-none bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                            title="Admin Password Reset"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Soft Delete User Button */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(userItem)}
                            className="p-1.5 rounded-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
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

        {/* Section 5: Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-slate-50 text-xs sm:text-sm text-slate-600 font-medium">
          <div>
            Showing <strong className="text-slate-900">{users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.totalUsers)}</strong> of{' '}
            <strong className="text-slate-900">{pagination.totalUsers}</strong> accounts
          </div>

          <div className="flex items-center gap-2.5">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="p-2 rounded-none bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-900 text-xs sm:text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="p-2 rounded-none bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Add User Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
          <div className="bg-white border border-slate-200 rounded-none max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-montserrat text-slate-900 flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-[#0562ff]" /> Add New User
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm font-montserrat">
              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Primary Email (Login) *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="alex@tectha.com"
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Secondary Email (Recovery)</label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={formData.secondaryEmail}
                    onChange={handleInputChange}
                    placeholder="alex.personal@gmail.com"
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none cursor-pointer transition-all font-medium font-montserrat"
                  >
                    <option value="employee">Employee</option>
                    <option value="founder">Founder</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">Initial Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set initial password"
                    className="w-full px-4 py-2.5 pr-11 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer font-montserrat"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-none bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-70 font-montserrat"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {modalType === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
          <div className="bg-white border border-slate-200 rounded-none max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-montserrat text-slate-900 flex items-center gap-2.5">
                <Edit2 className="w-6 h-6 text-[#0562ff]" /> Edit User ({selectedUser.name})
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4 text-sm font-montserrat">
              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none font-medium font-montserrat"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Primary Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none font-medium font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Secondary Email</label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={formData.secondaryEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none font-medium font-montserrat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none font-medium font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] focus:outline-none cursor-pointer font-medium font-montserrat"
                  >
                    <option value="employee">Employee</option>
                    <option value="founder">Founder</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4.5 h-4.5 accent-[#0562ff] rounded-none cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-slate-800 font-semibold text-sm cursor-pointer">
                  Account is Active
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer font-montserrat"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-none bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-70 font-montserrat"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {modalType === 'resetPassword' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
          <div className="bg-white border border-slate-200 rounded-none max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-montserrat text-amber-700 flex items-center gap-2.5">
                <KeyRound className="w-6 h-6 text-amber-600" /> Admin Reset Password
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 font-medium">
              Set a new password for <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            {actionError && (
              <div className="p-3.5 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-sm font-montserrat">
              <div>
                <label className="block text-slate-800 font-semibold mb-1.5">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-4 py-2.5 pr-11 bg-slate-50 text-slate-900 text-sm rounded-none border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium font-montserrat"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer font-montserrat"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-none bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-70 font-montserrat"
                >
                  {submitting ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete User Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
          <div className="bg-white border border-slate-200 rounded-none max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-montserrat text-rose-700 flex items-center gap-2.5">
                <Trash2 className="w-6 h-6 text-rose-600" /> Confirm Account Deletion
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600 font-medium">
              <p>
                Are you sure you want to soft delete account <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email})?
              </p>
              <div className="text-rose-700 bg-rose-50 p-4 rounded-none border border-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>The user account will be marked inactive and soft-deleted. The user will be immediately barred from logging in.</span>
              </div>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                {actionError}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer font-montserrat"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={submitting}
                className="px-6 py-2.5 rounded-none bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-70 font-montserrat"
              >
                {submitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
