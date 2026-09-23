import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('pathforge_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('pathforge_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        localStorage.removeItem('pathforge_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('pathforge_token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('pathforge_token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('pathforge_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const isStudent = user?.role === 'student';
  const isCompany = user?.role === 'company';
  const isAdmin = user?.role === 'admin';
  const isApprovedCompany = isCompany && user?.isApproved;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isStudent,
        isCompany,
        isAdmin,
        isApprovedCompany,
        isAuthenticated: !!user
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
