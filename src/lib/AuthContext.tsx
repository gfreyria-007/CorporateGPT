import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
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

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
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
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // Handle cancelled or closed popup gracefully
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Sign in cancelled by user or pending request.");
      } else {
        console.error("Sign in error:", error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSigningIn, signIn, logout }}>
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
