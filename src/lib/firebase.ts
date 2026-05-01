import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDibbDHl11Dp54dMZiFIUR8CKegxqtMkT4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "corporategptv2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "corporategptv2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "corporategptv2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "282195596392",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:282195596392:web:c479ed0ff71dc349de57dd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7D88LWN0KT"
};

let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization error:", error);
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

