import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getCurrentUser } from '../services/authService';
import { getStoredUser, setStoredUser, getDashboardForRole } from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
      
      try {
        // Verify token session with backend /api/auth/me
        const res = await getCurrentUser();
        if (res && res.user) {
          setUser(res.user);
          setStoredUser(res.user);
        }
      } catch (err) {
        // Session expired or unauthenticated
        if (!stored) {
          setUser(null);
          setStoredUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    
    // Backend response structure: { success: true, message: "...", data: { user: { role: "admin" | "founder" | "employee", ... } } }
    const userPayload = response?.data?.user || response?.user;

    if (!userPayload) {
      throw new Error('Authentication response invalid: missing user payload');
    }

    setUser(userPayload);
    setStoredUser(userPayload);

    // Read user role returned by backend and compute target route
    const targetDashboard = getDashboardForRole(userPayload.role);
    return {
      user: userPayload,
      role: userPayload.role,
      redirectUrl: targetDashboard,
    };
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout warning:', e);
    } finally {
      setUser(null);
      setStoredUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        logout,
        getDashboardForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
