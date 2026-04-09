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
        setUser(null);
        localStorage.removeItem('erp_token');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
