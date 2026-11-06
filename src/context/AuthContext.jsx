import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

// Create Authentication Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load active user from LocalStorage / verify token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('smartcareUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Verify with backend if token exists
        const token = localStorage.getItem('smartcareToken');
        if (token) {
          const profile = await authApi.getMe();
          if (profile) {
            setUser(profile);
            localStorage.setItem('smartcareUser', JSON.stringify(profile));
          }
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register a new user
  const register = async (fullName, email, password, phone = '') => {
    try {
      const res = await authApi.register(fullName, email, password, phone);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration. Please try again.',
      };
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.',
      };
    }
  };

  // Refresh profile from server
  const refreshProfile = async () => {
    try {
      const profile = await authApi.getMe();
      if (profile) {
        setUser(profile);
        localStorage.setItem('smartcareUser', JSON.stringify(profile));
      }
      return profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  // Update profile
  const updateUserProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('smartcareUser', JSON.stringify(res.user));
      }
      return res;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile.' };
    }
  };

  // Logout user
  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        register,
        login,
        logout,
        loading,
        refreshProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenient access to AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
