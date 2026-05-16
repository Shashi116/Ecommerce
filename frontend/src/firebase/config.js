import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
};

let app;

try {
  if (!firebaseConfig.apiKey) {
    console.error("Missing Firebase API Key");
  }

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

} catch (error) {
  console.error("Firebase initialization error:", error);
}

export const auth = app ? getAuth(app) : null;

export const provider = new GoogleAuthProvider();