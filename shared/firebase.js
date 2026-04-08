import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBhj3W49UOLoZYB9MzAJYBsN2m2yUHixks",
  authDomain: "galaxy-express-saas.firebaseapp.com",
  projectId: "galaxy-express-saas",
  storageBucket: "galaxy-express-saas.firebasestorage.app",
  messagingSenderId: "1064319458646",
  appId: "1:1064319458646:web:849621950588983e078af7",
  measurementId: "G-S698G8Y7NX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
