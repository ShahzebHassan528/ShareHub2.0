/**
 * Authentication Context
 * Production-level authentication state management
 */

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authAPI from '../api/auth.api';
import { getToken, setToken, getUser, setUser as saveUser, clearAuthData } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      const token = getToken();
      const savedUser = getUser();

      if (token && savedUser) {
        // Verify token is still valid
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData.user || userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear auth data
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      
      // Save token and user data
      setToken(response.token);
      saveUser(response.user);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, user: response.user };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(userData);
      
      // Save token and user data
      setToken(response.token);
      saveUser(response.user);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, user: response.user };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API (optional)
      await authAPI.logout().catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      // Note: Navigation should be handled by the component calling logout
    }
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(userData);
    saveUser(userData);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.user || response;
      setUser(userData);
      saveUser(userData);
      return userData;
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    hasRole,
    hasAnyRole,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
