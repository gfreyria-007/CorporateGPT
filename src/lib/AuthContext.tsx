import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebase';
import { ensureUserRecord } from './db';
import { handleFirestoreError, OperationType } from './db';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { checkTrialStatus, startTrial } from './trialManager';

const ALLOWED_EMAILS = ['gfreyria@gmail.com', 'gabrielfreyria@gmail.com'];

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  showEmailModal: boolean;
  pendingEmailLink: boolean;
  confirmEmailForLink: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingEmailLink, setPendingEmailLink] = useState(false);

  const confirmEmailForLink = async (email: string) => {
    try {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      setUser(result.user);
      setPendingEmailLink(false);
      setShowEmailModal(false);
    } catch (error) {
      console.error("Magic Link Error:", error);
      setShowEmailModal(false);
    }
  };

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

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("[AUTH] Redirect result captured:", result.user.email);
        }
      } catch (error) {
        console.error("[AUTH] Redirect result error:", error);
      }
    };
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      clearTimeout(safetyTimer);
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      // Handle Email Link Auth
      if (!u && isSignInWithEmailLink(auth, window.location.href)) {
        const storedEmail = window.localStorage.getItem('emailForSignIn');
        if (storedEmail) {
          try {
            const result = await signInWithEmailLink(auth, storedEmail, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            u = result.user;
          } catch (error) {
            console.error("Magic Link Error:", error);
            setPendingEmailLink(true);
          }
        } else {
          setPendingEmailLink(true);
        }
      }

      setUser(u);
      
      if (u) {
        // Strict Security Gate: Only allow gfreyria@gmail.com
        if (u.email && !ALLOWED_EMAILS.includes(u.email.toLowerCase())) {
          console.error(`[SECURITY] Access denied for ${u.email}. Unauthorized entity.`);
          signOut(auth);
          setUser(null);
          setProfile(null);
          setLoading(false);
          alert("Acceso restringido. Solo personal autorizado.");
          return;
        }

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
    console.log("[AUTH] MODE: REDIRECT_V1 - Initiating Google Handshake...");
    try {
      const { signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("[AUTH] Fatal Neural Error:", error.code, error.message);
      alert(`Error de Conexión: ${error.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithApple = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const email = result.user.email;
      
      // Check trial status
      if (email) {
        const trialCheck = await checkTrialStatus(email);
        if (!trialCheck.eligible) {
          await signOut(auth);
          localStorage.setItem('trial_blocked', 'true');
          window.location.href = '/?status=trial_ended';
          return;
        }
        await startTrial(email);
      }
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

  useEffect(() => {
    if (pendingEmailLink) {
      setShowEmailModal(true);
    }
  }, [pendingEmailLink]);

  const [modalEmail, setModalEmail] = useState('');

  const handleModalConfirm = () => {
    if (modalEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modalEmail)) {
      confirmEmailForLink(modalEmail);
      setModalEmail('');
    }
  };

  const handleModalCancel = () => {
    setShowEmailModal(false);
    setPendingEmailLink(false);
    setModalEmail('');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isSigningIn, 
      signIn, 
      signInWithApple, 
      signInWithEmail, 
      logout,
      showEmailModal,
      pendingEmailLink,
      confirmEmailForLink
    }}>
      {children}
      
      {showEmailModal && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleModalCancel}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4">
            <div className="bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Confirmar correo electrónico</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Por favor ingresa el correo que usaste para el enlace mágico
                </p>
              </div>

              <div>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all mb-4"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleModalCancel}
                    className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleModalConfirm}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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
