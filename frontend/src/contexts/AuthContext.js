import { reportError } from '../services/errorReporter';
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { clearAccessToken, getAccessToken, setAccessToken } from '../services/tokenStore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expire = () => { clearAccessToken(); setToken(null); setUser(null); };
    window.addEventListener('green:session-expired', expire);
    return () => window.removeEventListener('green:session-expired', expire);
  }, []);

  // Set axios default header
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await apiClient.get('/auth/me', { requiresAuthentication: true });
      setUser(response.data.data);
    } catch (error) {
      reportError('frontend.error', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      setAccessToken(token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, user } = response.data.data;
      
      setAccessToken(token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    clearAccessToken();
        setToken(null);
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
