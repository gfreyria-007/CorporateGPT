import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDibbDHl11Dp54dMZiFIUR8CKegxqtMkT4",
  authDomain: "corporategptv2.firebaseapp.com",
  projectId: "corporategptv2",
  storageBucket: "corporategptv2.firebasestorage.app",
  messagingSenderId: "282195596392",
  appId: "1:282195596392:web:c479ed0ff71dc349de57dd",
  measurementId: "G-7D88LWN0KT"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
