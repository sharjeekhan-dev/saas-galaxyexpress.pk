import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR FIREBASE CONFIG FROM CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "galaxyexpress-pk.firebaseapp.com",
  projectId: "galaxyexpress-pk",
  storageBucket: "galaxyexpress-pk.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
