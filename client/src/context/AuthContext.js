import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await auth.getProfile();
        setUser(data);
      } catch (error) {
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const { data } = await auth.login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data);
      setError(null);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await auth.register(userData);
      localStorage.setItem('token', data.token);
      setUser(data);
      setError(null);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await auth.updateProfile(userData);
      setUser(data);
      setError(null);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
