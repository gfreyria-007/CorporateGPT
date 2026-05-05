import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  EmailAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';

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

let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Fallback to avoid crash during build or SSR
  app = {} as FirebaseApp;
}

export const db: Firestore = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const appleProvider = new OAuthProvider('apple.com');
export const emailProvider = new EmailAuthProvider();

// Re-export Auth functions
export { signInWithPopup, signOut, onAuthStateChanged, sendEmailVerification };
export type { FirebaseUser };

// Re-export Firestore functions
export { 
  doc, getDoc, setDoc, updateDoc, deleteDoc, 
  onSnapshot, collection, query, where, getDocs, 
  addDoc, serverTimestamp 
};

/**
 * Shared Firestore Error Handling for unified diagnostics
 */
export enum OperationType {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  QUERY = 'QUERY'
}

export const handleFirestoreError = async (error: any, operation: OperationType, collectionName: string) => {
  console.error(`[Firestore Error] ${operation} on ${collectionName}:`, error);
  
  const errorData = {
    code: error.code || 'unknown',
    message: error.message || 'No message',
    operation,
    collection: collectionName,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  };

  try {
    const errorLogsRef = collection(db, 'errors');
    await addDoc(errorLogsRef, errorLogsRef);
  } catch (logError) {
    console.error('Failed to log error to Firestore:', logError);
  }

  return errorData;
};

export default app;
