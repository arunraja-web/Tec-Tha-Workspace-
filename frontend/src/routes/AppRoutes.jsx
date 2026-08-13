import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/common/LandingPage';
import Login from '../pages/auth/Login';
import FounderDashboard from '../pages/founder/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import EmployeeDashboard from '../pages/employee/Dashboard';

import AdminAttendancePage from '../pages/admin/Attendance';
import FounderAttendanceAnalyticsPage from '../pages/founder/AttendanceAnalytics';
import MyAttendancePage from '../pages/employee/MyAttendance';

import AdminGroupsPage from '../pages/admin/Groups';
import FounderGroupsPage from '../pages/founder/Groups';
import EmployeeMyGroupsPage from '../pages/employee/MyGroups';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../constants/roles';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Common Pre-Login Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Role-Based Protected Dashboards */}
      <Route
        path="/founder/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.FOUNDER]}>
              <FounderDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.EMPLOYEE]}>
              <EmployeeDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Attendance Module Routes */}
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminAttendancePage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/founder/attendance"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.FOUNDER]}>
              <FounderAttendanceAnalyticsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.EMPLOYEE]}>
              <MyAttendancePage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Group Management Module Routes */}
      <Route
        path="/admin/groups"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminGroupsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/founder/groups"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.FOUNDER]}>
              <FounderGroupsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/groups"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.EMPLOYEE]}>
              <EmployeeMyGroupsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
