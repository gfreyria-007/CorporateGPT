"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { isUserBanned } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isBanned: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isBanned: false,
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if banned
        const banned = await isUserBanned(user.uid);
        if (banned) {
          setIsBanned(true);
          setUser(null);
        } else {
          setIsBanned(false);
          setUser(user);
        }
      } else {
        setIsBanned(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Log tester in Firestore
        await logTesterInDB(result.user);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const logTesterInDB = async (user: User) => {
    try {
      const { db } = await import("@/lib/firebase");
      if (!db) return;
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      
      await setDoc(doc(db, "testers", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastSeen: serverTimestamp(),
        registeredAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to log tester:", e);
    }
  };


  const logOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isBanned, signInWithGoogle, logOut }}>
      {isBanned ? (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(244,63,94,0.1)]">
               <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white italic tracking-tight">ACCESS TERMINATED</h1>
              <p className="text-[11px] text-rose-400 font-black uppercase tracking-[0.4em]">Neural Security Protocol Violation</p>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your account has been permanently flagged for suspicious activity. All access to the Neural Core has been revoked to protect the integrity of the platform.
            </p>
            <div className="pt-4">
               <button onClick={logOut} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">Return to Surface</button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-white/5 border-t-white rounded-full animate-spin"></div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Syncing Neural Link...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
