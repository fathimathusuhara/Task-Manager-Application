import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user profile", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/users/login', formData);
    localStorage.setItem('token', response.data.access_token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (username, email, password, role) => {
    const response = await api.post('/users/register', {
      username, email, password, role
    });
    return response.data;
  };

  const updateProfile = async (userData) => {
    const response = await api.put('/users/me', userData);
    setUser(response.data);
    return response.data;
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUser(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, uploadPhoto, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
