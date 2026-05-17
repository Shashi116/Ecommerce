/**
 * Firebase Admin SDK Configuration
 * Initialize Firebase for backend authentication verification
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS env var)
// Or initialize with service account JSON
if (!admin.apps.length) {
  try {
    // Option 1: Use environment variable pointing to service account file
    if (process.env.FIREBASE_CONFIG_PATH) {
      const serviceAccount = require(process.env.FIREBASE_CONFIG_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Option 2: Use environment variables directly
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    console.log('✓ Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message);
  }
}

module.exports = admin;
