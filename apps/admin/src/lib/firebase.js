import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "SET_YOUR_API_KEY",
  authDomain: "SET_YOUR_AUTH_DOMAIN",
  projectId: "SET_YOUR_PROJECT_ID",
  storageBucket: "SET_YOUR_STORAGE_BUCKET",
  messagingSenderId: "SET_YOUR_MESSAGING_SENDER_ID",
  appId: "SET_YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
