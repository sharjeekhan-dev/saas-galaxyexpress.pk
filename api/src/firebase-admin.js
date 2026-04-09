import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        console.log('📦 Firebase Admin: Using Service Account Credentials (ENV)');
      } catch (parseErr) {
        console.error('❌ Firebase Admin: Failed to parse Service Account JSON from ENV:', parseErr.message);
      }
    }

    // Priority 2: Service Account JSON in local file (Local Development)
    const localSA = path.join(__dirname, '../service-account.json');
    if (!firebaseConfig.credential && fs.existsSync(localSA)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(localSA, 'utf8'));
        firebaseConfig = {
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        };
        console.log('📂 Firebase Admin: Using local service-account.json');
      } catch (fileErr) {
        console.error('❌ Firebase Admin: Failed to read local service-account.json:', fileErr.message);
      }
    }

    // Priority 3: Project ID Fallback
    if (!firebaseConfig.credential) {
      firebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'galaxy-express-saas'
      };
      console.log(`🔗 Firebase Admin: Initialized with Project ID Only (${firebaseConfig.projectId})`);
    }

    admin.initializeApp(firebaseConfig);
    console.log('✅ Firebase Admin: Global Service Initialized Successfully');
  } catch (err) {
    console.error('❌ Firebase Admin: Initialization Error:', err.message);
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export default admin;
