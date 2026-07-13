import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const GUEST_USER = {
  _id: '60c72b2f9b1d8b2bad888888',
  email: 'guest@example.com'
};

export const AuthProvider = ({ children }) => {
  // Pre-authenticate with a Guest user by default
  const [user, setUser] = useState(GUEST_USER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set guest token on mount
  useEffect(() => {
    localStorage.setItem('token', 'guest_mode_token');
  }, []);

  // Mock handlers
  const login = async (email, password) => {
    setUser(GUEST_USER);
    localStorage.setItem('token', 'guest_mode_token');
    return true;
  };

  const signup = async (email, password) => {
    setUser(GUEST_USER);
    localStorage.setItem('token', 'guest_mode_token');
    return true;
  };

  const logout = () => {
    // In guest mode, logout does nothing or resets user to Guest
    setUser(GUEST_USER);
    localStorage.setItem('token', 'guest_mode_token');
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
