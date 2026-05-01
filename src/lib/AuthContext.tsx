import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebase';
import { ensureUserRecord } from './db';
import { handleFirestoreError, OperationType } from './db';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    
    // Safety timeout to prevent infinite loading if Firebase hangs
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn("Auth synchronization taking too long, forcing load state completion.");
        setLoading(false);
      }
    }, 5000);

    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      console.error("Firebase Auth not initialized correctly.");
      setLoading(false);
      clearTimeout(safetyTimer);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      clearTimeout(safetyTimer);
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      // Handle Email Link Auth
      if (!u && isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            u = result.user;
          } catch (error) {
            console.error("Magic Link Error:", error);
          }
        }
      }

      setUser(u);
      
      if (u) {
        try {
          ensureUserRecord(u).catch(e => console.error("ensureUserRecord failed", e));
          unsubProfile = onSnapshot(doc(db, 'users', u.uid), (snap) => {
            if (snap.exists()) {
              setProfile(snap.data());
            }
          }, (error) => {
            // Only report error if we still have a user (avoid errors on logout)
            if (auth.currentUser) {
              handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
            }
          });
        } catch (error) {
          console.error("Error setting up user session:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      console.log("Initializing Google Auth Synthesis...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Auth Success:", result.user.email);
    } catch (error: any) {
      console.error("Neural Auth Error Details:", {
        code: error.code,
        message: error.message,
        custom: "If you see 'auth/unauthorized-domain', please add 'corporate-gpt.vercel.app' to Firebase Authorized Domains."
      });
      
      // Handle cancelled or closed popup gracefully
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Sign in cancelled by user or pending request.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithApple = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, appleProvider);
    } catch (error) {
      console.error("Apple Auth Error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/auth/verify',
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      alert('Se ha enviado un enlace de acceso seguro a tu correo corporativo.');
    } catch (error) {
      console.error("Email Link Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSigningIn, signIn, signInWithApple, signInWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
