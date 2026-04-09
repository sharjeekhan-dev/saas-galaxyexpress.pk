import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('🔥 Firebase Admin Initialized (Singleton)');
  } catch (err) {
    console.error('❌ Firebase Admin Init Error:', err.message);
  }
}

export default admin;
export const db = admin.apps.length ? admin.firestore() : { collection: () => ({ doc: () => ({ get: () => Promise.reject('Firebase not initialized') }) }) };
