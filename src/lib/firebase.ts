import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const getFirebaseConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missing = requiredVars.filter(v => !import.meta.env[v]);
  if (missing.length > 0) {
    console.error(`Firebase configuration error: ${missing.join(', ')}`);
    return null;
  }

  return {
    apiKey: import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: import.meta.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined
  };
};

const firebaseConfig = getFirebaseConfig();

let app = null;
if (firebaseConfig) {
  try {
    const existingApp = getApps().find(a => a.name === '[DEFAULT]');
    if (existingApp) {
      try {
        app = getApp();
      } catch {
        existingApp.delete().catch(() => {});
        app = initializeApp(firebaseConfig);
      }
    } else {
      app = initializeApp(firebaseConfig);
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase not initialized due to missing configuration. Please set all required VITE_FIREBASE_* environment variables.");
}

export const analytics = typeof window !== 'undefined' && app ? getAnalytics(app) : null;
export const db = app ? getFirestore(app) : null as any;
export const auth = app ? getAuth(app) : { onAuthStateChanged: (cb: any) => { cb(null); return () => {}; } } as any;
export const googleProvider = new GoogleAuthProvider();
import { OAuthProvider, EmailAuthProvider } from 'firebase/auth';
export const appleProvider = new OAuthProvider('apple.com');
export const emailProvider = new EmailAuthProvider();

export async function testConnection() {
  try {
    if (!app) return;
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('permission-denied'))) {
      console.warn("Firebase connection restricted or offline. Check configuration or network.");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

