import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Server-side injected config fallback for production
const config = (window as any).ENV_CONFIG || {};

const firebaseConfig = {
  apiKey: config.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: config.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: config.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: config.VITE_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID
};

// Log initialization source for debugging
if (typeof window !== 'undefined') {
  const source = config.VITE_FIREBASE_API_KEY ? 'Server' : 'Build';
  const maskedKey = firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...` : 'MISSING';
  console.log(`[FIREBASE] Source: ${source} | Key: ${maskedKey} | Domain: ${firebaseConfig.authDomain}`);
}

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export const db = app ? getFirestore(app) : null as any;
export const auth = app ? getAuth(app) : null as any;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const appleProvider = new OAuthProvider('apple.com');
export const emailProvider = new EmailAuthProvider();

export default app;
