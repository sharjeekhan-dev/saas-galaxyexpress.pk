import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Initial Check: Try to recover local session immediately (Ensures Zero-Latency for Master Admin)
    const localUserJson = localStorage.getItem('erp_user');
    if (localUserJson) {
      try {
        const localUser = JSON.parse(localUserJson);
        setUser(localUser);
        console.log("💾 Recovered session from local storage");
      } catch (e) {
        console.warn("⚠️ Failed to parse local session:", e);
      }
    }

    // Force local persistence for better UX (no logout on refresh)
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      
      if (firebaseUser) {
        setLoading(true);
        try {
          // Get additional user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Use onSnapshot for real-time user profile updates (role changes, active status, etc.)
          const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              
              if (userData.isActive === false) {
                signOut(auth);
                setUser(null);
                setError('Account is deactivated');
              } else {
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  ...userData
                });
                
                // Save token to localStorage for backend API compatibility
                firebaseUser.getIdToken().then(token => {
                  localStorage.setItem('erp_token', token);
                });
              }
            } else {
              // User documented doesn't exist in Firestore
              console.error("User profile not found in Firestore for UID:", firebaseUser.uid);
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'GUEST'
              });
            }
            setLoading(false);
          }, (err) => {
            console.error("Profile listener error:", err);
            setError("Failed to sync user profile");
            setLoading(false);
          });

          return () => unsubProfile();

        } catch (err) {
          console.error("Auth sync error:", err);
          setError(err.message);
          setLoading(false);
        }
      } else {
        // Only clear if we don't already have a local/master session active
        const hasLocalSession = localStorage.getItem('erp_user');
        if (!hasLocalSession) {
          setUser(null);
          localStorage.removeItem('erp_token');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    const { email, phone, password } = credentials;

    try {
      // 1. PRIMARY: Try Local API Login (Custom Backend)
      // This is now the source of truth for all users including Master Admin.
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email?.trim(), phone, password })
      });

      if (response.ok) {
        const data = await response.json();
        const localUser = {
          uid: data.user.id || 'master-local-session',
          ...data.user
        };
        setUser(localUser);
        localStorage.setItem('erp_token', data.token);
        localStorage.setItem('erp_user', JSON.stringify(localUser));
        
        // Optional: Sync with Firebase Auth for real-time features if needed
        if (email) {
          signInWithEmailAndPassword(auth, email.trim(), password).catch(e => 
            console.warn("🔐 Firebase sync skipped:", e.message)
          );
        }

        setLoading(false);
        return localUser;
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

  useEffect(() => {
    // If we have a local session saved, use it as initial state
    const savedUser = localStorage.getItem('erp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
      } catch (e) {
        localStorage.removeItem('erp_user');
      }
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
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
      {children}
    </AuthContext.Provider>
  );
};
