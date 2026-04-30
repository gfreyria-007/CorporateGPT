import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBR0wKkZ7TCtkA3Tgy4S6Eb6ZuafgCpRog",
  authDomain: "aiacademyjunior-2b67c.firebaseapp.com",
  projectId: "aiacademyjunior-2b67c",
  storageBucket: "aiacademyjunior-2b67c.firebasestorage.app",
  messagingSenderId: "346212318652",
  appId: "1:346212318652:web:fb1d3edd498623a4c0ffb9",
  measurementId: "G-EKSZH77MD0"
};

// Initialize Firebase lazily
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

