import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

let db;
let bucket;

try {
  let serviceAccount;

  // 1. Try environment variable (Production / Railway)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log("🚀 Firebase Admin: Using Environment Variable");
    } catch (e) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e.message);
    }
  } 
  
  // 2. Fallback to local file
  if (!serviceAccount && fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log("📁 Firebase Admin: Using Local service-account.json");
  }

  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      });
      console.log("✅ Firebase Admin Initialized Successfully");
    }
    db = admin.firestore();
    bucket = admin.storage().bucket();
  } else {
    console.warn("⚠️ Firebase Admin: No credentials found (Env or File). Sync mode disabled.");
  }
} catch (err) {
  console.error("❌ Firebase Admin Initialization Failed:", err.message);
}

export { admin, db, bucket };
export default admin;
