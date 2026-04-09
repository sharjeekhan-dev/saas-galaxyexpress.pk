import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  browserSessionPersistence,
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
    // Force session persistence
    setPersistence(auth, browserSessionPersistence).catch(err => console.error("Persistence error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      if (firebaseUser) {
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

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    const masterEmail = 'sharjeel@galaxyexpress.pk';

    try {
      let firebaseUser = null;
      let loginSuccess = false;

      // 1. Try Firebase Auth first
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = userCredential.user;
        loginSuccess = true;
      } catch (fbErr) {
        console.warn("⚠️ Firebase Auth failed, falling back to local API:", fbErr.message);
      }

      // 2. Fallback to Local API Login (Crucial for "Always Accessible" requirement)
      // We always trigger this if Firebase fails, OR for the master account specifically to ensure reliability.
      if (!loginSuccess || email.trim().toLowerCase() === masterEmail) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
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
          setLoading(false);
          return localUser;
        } else if (!loginSuccess) {
          // If both failed, then throw
          const errData = await response.json();
          throw new Error(errData.error || 'Authentication Failed');
        }
      }

      return firebaseUser;
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
    isVendor: user?.role === 'VENDOR' || user?.role === 'VENDOR_ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
