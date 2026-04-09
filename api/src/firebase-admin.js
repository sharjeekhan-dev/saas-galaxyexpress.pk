import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
  try {
    // Check if we have a service account in ENV, otherwise use project ID fallback
    const firebaseConfig = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? { credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) }
      : { projectId: process.env.FIREBASE_PROJECT_ID || 'galaxy-express-saas' };

    admin.initializeApp(firebaseConfig);
    console.log(`🔥 Firebase Admin Initialized (${firebaseConfig.projectId || 'Service Account'})`);
  } catch (err) {
    console.error('❌ Firebase Admin Init Error:', err.message);
  }
}

export default admin;
export const db = admin.apps.length ? admin.firestore() : { collection: () => ({ doc: () => ({ get: () => Promise.reject('Firebase not initialized') }) }) };
