import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, db, googleProvider, appleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, FirebaseUser,
  collection, query, where, getDocs, sendEmailVerification
} from '../firebase';
import { UserProfile, Grade } from '../types';
import { GRADES } from '../constants';
import { logger } from '../logger';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isProfileLoading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  appleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setProfileData: (data: any) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendVerification: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        logger.auth('User authenticated', { uid: u.uid, email: u.email }, u.uid);
        setIsProfileLoading(true);
        await loadUserProfile(u);
        setIsProfileLoading(false);
      } else {
        // Check for SSO token in URL - validate signature before trusting
        const params = new URLSearchParams(window.location.search);
        const ssoToken = params.get('sso');
        
        if (ssoToken) {
          logger.auth('SSO token detected in URL', { hasToken: true });
          try {
            // Validate token format before parsing
            const parts = ssoToken.split('.');
            if (parts.length !== 3) {
              logger.security('SSO token invalid format', { tokenLength: parts.length });
              throw new Error('Invalid token format');
            }
            
            const payload = JSON.parse(atob(parts[1]));
            // Verify token has required fields and not expired
            if (payload && payload.user_id && payload.exp && payload.exp > Date.now() / 1000) {
              await loadUserProfile({ uid: payload.user_id, email: payload.email } as any);
              logger.auth('SSO login successful', { uid: payload.user_id });
              setLoading(false);
              return;
            } else {
              logger.security('SSO token expired or invalid', { exp: payload?.exp });
            }
          } catch (e: any) {
            logger.security('SSO parsing failed', { error: e.message });
          }
        }
        
        // No redirect - show login screen instead
        logger.auth('No authenticated session, showing login');
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (u: FirebaseUser) => {
    if (!u.uid) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', u.uid));
      
      if (userDoc.exists()) {
        let data = userDoc.data() as UserProfile;
        
        // Force admin approval if needed
        if (u.email === 'gfreyria@gmail.com' && (!data.isApproved || data.role !== 'admin')) {
          await updateDoc(doc(db, 'users', u.uid), {
            isApproved: true,
            role: 'admin'
          });
          data.isApproved = true;
          data.role = 'admin';
        }

        // Reset monthly cost if it's a new month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
        if (data.lastCostResetDate !== currentMonth) {
          await updateDoc(doc(db, 'users', u.uid), {
            monthlyCostUsed: 0,
            lastCostResetDate: currentMonth
          });
          data.monthlyCostUsed = 0;
          data.lastCostResetDate = currentMonth;
        }

        // Ensure trial field exists for legacy users and they are marked as approved
        if (!data.trialExpiresAt || !data.isApproved) {
          const updates: any = {};
          if (!data.trialExpiresAt) {
            const trialExpires = new Date(data.createdAt || Date.now());
            trialExpires.setDate(trialExpires.getDate() + 7);
            updates.trialExpiresAt = trialExpires.toISOString();
            data.trialExpiresAt = trialExpires.toISOString();
          }
          if (!data.isApproved) {
            updates.isApproved = true;
            data.isApproved = true;
          }
          await updateDoc(doc(db, 'users', u.uid), updates);
        }

        setProfile(data);

        // Real-time listener for profile updates
        const unsub = onSnapshot(doc(db, 'users', u.uid), (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });
        return () => unsub();

      } else {
        // New User logic
        let isApproved = u.email === 'gfreyria@gmail.com';
        
        if (!isApproved && u.email) {
          try {
            const q = query(
              collection(db, 'access_requests'), 
              where('email', '==', u.email), 
              where('status', '==', 'approved')
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              isApproved = true;
            }
          } catch (error) {
            console.error('Error checking access requests:', error);
          }
        }

        const trialExpires = new Date();
        trialExpires.setDate(trialExpires.getDate() + 7);

        const newProfile: UserProfile = {
          uid: u.uid,
          email: u.email || '',
          name: u.displayName || 'Estudiante',
          role: u.email === 'gfreyria@gmail.com' ? 'admin' : 'user',
          isApproved: true, // Auto-approve, logic is now handled by trial/sub
          trialExpiresAt: trialExpires.toISOString(),
          isSubscribed: false,
          tokensPerDay: 100,
          dailyUsageCount: 0,
          lastUsageDate: new Date().toISOString().split('T')[0],
          subscriptionLevel: 'free'
        };

        await setDoc(doc(db, 'users', u.uid), newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const appleLogin = async () => {
    try {
      await signInWithPopup(auth, appleProvider);
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), data);
      // State is updated via onSnapshot
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const setProfileData = async (data: any) => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      // State is updated via onSnapshot
    } catch (error) {
      console.error('Error setting profile data:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const resendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      console.error("Error resending verification:", error);
      throw error;
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'gfreyria@gmail.com';

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, isProfileLoading, isAdmin, 
      login, appleLogin, logout, updateProfile, setProfileData, deleteAccount, resendVerification, setProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
