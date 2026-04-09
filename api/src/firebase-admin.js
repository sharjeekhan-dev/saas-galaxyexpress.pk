import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Singleton check to prevent multiple initializations
if (!admin.apps.length) {
  try {
    let firebaseConfig = {};

    // Priority 1: Service Account JSON in Environment Variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' 
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
          : process.env.FIREBASE_SERVICE_ACCOUNT;
        
        firebaseConfig = {
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        };
        console.log('📦 Firebase Admin: Using Service Account Credentials');
      } catch (parseErr) {
        console.error('❌ Firebase Admin: Failed to parse Service Account JSON:', parseErr.message);
      }
    }

    // Priority 2: Project ID Fallback (Requires manual credential loading if not on GCP/Firebase hosting)
    if (!firebaseConfig.credential) {
      firebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'galaxy-express-saas'
      };
      console.log(`🔗 Firebase Admin: Initialized with Project ID (${firebaseConfig.projectId})`);
    }

    admin.initializeApp(firebaseConfig);
    console.log('✅ Firebase Admin: Global Service Initialized Successfully');
  } catch (err) {
    console.error('❌ Firebase Admin: Initialization Error:', err.message);
    // Do not throw here to prevent server crash, but provide null db
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export default admin;
