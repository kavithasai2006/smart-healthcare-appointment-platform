import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Authentication Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load active user from LocalStorage on initial mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('smartcareUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register a new user
  const register = (fullName, email, password) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('smartcareUsers')) || [];

      // Check if email already registered
      const userExists = existingUsers.some(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (userExists) {
        return {
          success: false,
          message: 'An account with this email already exists.',
        };
      }

      // Add new user
      const newUser = {
        id: Date.now(),
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Note: For academic/demonstration frontend project only
      };

      existingUsers.push(newUser);
      localStorage.setItem('smartcareUsers', JSON.stringify(existingUsers));

      return {
        success: true,
        message: 'Registration successful! Please login.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration. Please try again.',
      };
    }
  };

  // Login existing user
  const login = (email, password) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('smartcareUsers')) || [];
      const normalizedEmail = email.toLowerCase().trim();

      const matchedUser = existingUsers.find(
        (u) => u.email === normalizedEmail && u.password === password
      );

      if (!matchedUser) {
        return {
          success: false,
          message: 'Invalid email or password.',
        };
      }

      // Save logged in user info (excluding password)
      const sessionUser = {
        id: matchedUser.id,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
      };

      localStorage.setItem('smartcareUser', JSON.stringify(sessionUser));
      setUser(sessionUser);

      return {
        success: true,
        message: 'Login successful!',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.',
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('smartcareUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
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
