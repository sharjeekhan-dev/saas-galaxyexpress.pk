import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Initial Check: Try to recover local session
    const initializeAuth = async () => {
      const localUserJson = localStorage.getItem('erp_user');
      const token = localStorage.getItem('erp_token');

      if (localUserJson && token) {
        try {
          const localUser = JSON.parse(localUserJson);
          setUser(localUser);
          
          // Verify token/session with backend
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const freshUser = await response.json();
            setUser(freshUser);
            localStorage.setItem('erp_user', JSON.stringify(freshUser));
          } else {
            // Token expired or user deleted
            logout();
          }
        } catch (e) {
          console.warn("⚠️ Auth initialization failed:", e);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    const { email, phone, password } = credentials;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email?.trim(), phone, password })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('erp_token', data.token);
        localStorage.setItem('erp_user', JSON.stringify(data.user));
        return data.user;
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Authentication Failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
    // Optional: Redirect to login page
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPER_ADMIN',
    isTenantAdmin: user?.role === 'TENANT_ADMIN',
    isVendor: user?.role === 'VENDOR',
    isStaff: ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'].includes(user?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
