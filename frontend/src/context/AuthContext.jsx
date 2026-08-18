import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [doctorProfile, setDoctorProfile] = useState(() => {
    const saved = localStorage.getItem('doctorProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setDoctorProfile(data.doctor_profile || null);
    setToken(data.token);

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    if (data.doctor_profile) {
      localStorage.setItem('doctorProfile', JSON.stringify(data.doctor_profile));
    } else {
      localStorage.removeItem('doctorProfile');
    }
  };

  const parseError = async (res) => {
    try {
      const d = await res.json();
      return d.error || d.detail || JSON.stringify(d);
    } catch (e) {
      return res.statusText || 'Server error';
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errMsg = await parseError(res);
        throw new Error(errMsg || 'Login failed');
      }
      const data = await res.json();
      handleAuthSuccess(data);
      showToast(`Welcome back, ${data.user.first_name || data.user.username}!`, 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const demoLogin = async (role = 'PATIENT', username = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/demo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username }),
      });
      if (!res.ok) {
        const errMsg = await parseError(res);
        throw new Error(errMsg || 'Demo login failed');
      }
      const data = await res.json();
      handleAuthSuccess(data);
      showToast(`Logged in as ${data.user.role === 'DOCTOR' ? 'Dr. ' : ''}${data.user.first_name || data.user.username}`, 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errMsg = await parseError(res);
        throw new Error(errMsg || 'Registration failed');
      }
      const data = await res.json();
      handleAuthSuccess(data);
      showToast('Account created successfully!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setDoctorProfile(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('doctorProfile');
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctorProfile,
        token,
        role: user?.role || 'PATIENT',
        isAuthenticated: !!token,
        login,
        demoLogin,
        register,
        logout,
        showToast,
        toast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
