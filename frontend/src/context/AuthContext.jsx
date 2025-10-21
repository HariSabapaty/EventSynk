import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axiosInstance.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => logout());
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    await axiosInstance.post('/auth/register', { name, email, password });
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
