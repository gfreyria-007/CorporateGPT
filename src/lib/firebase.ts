import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Safe initialization helper
const getSafeService = <T>(serviceInit: (app: any) => T, name: string): T | null => {
  try {
    return serviceInit(app);
  } catch (e) {
    console.error(`Firebase Service Init Failed (${name}):`, e);
    return null;
  }
};

const auth = getAuth(app);
const db = getSafeService(getFirestore, "Firestore");
const storage = getSafeService(getStorage, "Storage");
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
