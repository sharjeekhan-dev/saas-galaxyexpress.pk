import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

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
    // 1. Listen for Firebase Auth Changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Get ID Token for backend verification
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('erp_token', token);

          // Fetch Full Profile from SQL (Sync happens on backend req.user)
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const sqlUser = await response.json();
            setUser(sqlUser);
            localStorage.setItem('erp_user', JSON.stringify(sqlUser));
          } else {
             // Fallback: If SQL fetch fails, at least set the Firebase basic info
             setUser({ id: firebaseUser.uid, email: firebaseUser.email, role: 'VENDOR' });
          }
        } catch (e) {
          console.warn("⚠️ Auth sync failed:", e);
        }
      } else {
        // Check for Bypass/Local Session
        const localUserJson = localStorage.getItem('erp_user');
        const token = localStorage.getItem('erp_token');
        if (localUserJson && token && token.startsWith('dev-token')) {
          setUser(JSON.parse(localUserJson));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    const { email, password } = credentials;

    try {
      // 1. Authenticate with Firebase first
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('erp_token', token);

      // 2. Fetch full profile to verify SQL sync
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const sqlUser = await response.json();
        setUser(sqlUser);
        localStorage.setItem('erp_user', JSON.stringify(sqlUser));
        return sqlUser;
      }
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setUserManually = (userData, token) => {
    setUser(userData);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    localStorage.setItem('erp_token', token);
  };

  const logout = async () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    await signOut(auth);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setUserManually,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPER_ADMIN',
    isVendor: user?.role === 'VENDOR' || user?.role === 'VENDOR_ADMIN',
    isStaff: ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'].includes(user?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
