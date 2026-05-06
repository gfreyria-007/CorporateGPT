import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, db, googleProvider, appleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, FirebaseUser,
  collection, query, where, getDocs, sendEmailVerification
} from '../../../lib/firebase';
import { UserProfile, Grade } from '../types';
import { GRADES } from '../constants';
import { logger } from '../logger';

// Use unified trial system (3 days) - shared with Corporate GPT
// Trial status is stored in CorporateGPT's 'trials' collection
const TRIAL_DAYS = 3;
const ALLOWED_EMAILS = ['gfreyria@gmail.com', 'gabrielfreyria@gmail.com'];

async function checkCorporateTrial(email: string): Promise<{ eligible: boolean; daysLeft?: number }> {
  try {
    const trialRef = doc(db, 'trials', email.toLowerCase());
    const snap = await getDoc(trialRef);
    
    if (!snap.exists()) {
      return { eligible: false };
    }
    
    const data = snap.data();
    
    // Check if used
    if (data.used) {
      return { eligible: false };
    }
    
    // Check if expired
    if (data.trialEnds) {
      const end = data.trialEnds.toDate ? data.trialEnds.toDate() : new Date(data.trialEnds);
      const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) {
        return { eligible: false };
      }
      
      return { eligible: true, daysLeft };
    }
    
    return { eligible: false };
  } catch (error) {
    console.error('[Techie] Error checking corporate trial:', error);
    return { eligible: false };
  }
}

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

export const AuthProvider: React.FC<{ children: React.ReactNode, mainUser?: FirebaseUser | null }> = ({ children, mainUser }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    // If we have a mainUser from the parent, prioritize it to avoid double login
    if (mainUser) {
      setUser(mainUser);
      loadUserProfile(mainUser);
      setLoading(false);
    }
  }, [mainUser]);

  useEffect(() => {
    // Only set up internal listener if no mainUser is provided or if it's null
    if (mainUser) return;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Strict Security Gate: Only allow gfreyria@gmail.com
        if (u.email && !ALLOWED_EMAILS.includes(u.email.toLowerCase())) {
          console.error(`[SECURITY] Access denied for ${u.email} in Techie module.`);
          signOut(auth);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

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
  }, [mainUser]);

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

        // Sync with Corporate GPT Plan if available
        if ((data as any).plan && !data.subscriptionLevel) {
          const planMap: Record<string, string> = {
            'Starter': 'explorador',
            'Professional': 'maestro',
            'Family Starter': 'family_starter',
            'Family Mega': 'family_mega'
          };
          const mappedSub = planMap[(data as any).plan];
          if (mappedSub) {
            await updateDoc(doc(db, 'users', u.uid), { subscriptionLevel: mappedSub });
            data.subscriptionLevel = mappedSub as any;
          }
        }

        // Check CorporateGPT trial status for existing users
        let corporateTrialStatus = { eligible: false, daysLeft: 0 };
        if (u.email) {
          corporateTrialStatus = await checkCorporateTrial(u.email);
        }

        // Ensure trial field exists for legacy users
        if (!data.trialExpiresAt || !data.isApproved || !data.subscriptionLevel) {
          const updates: any = {};
          
          // If corporate trial is active, use it
          if (corporateTrialStatus.eligible) {
            const trialExpires = new Date();
            trialExpires.setDate(trialExpires.getDate() + TRIAL_DAYS);
            updates.trialExpiresAt = trialExpires.toISOString();
            data.trialExpiresAt = trialExpires.toISOString();
            updates.subscriptionLevel = 'trial';
            data.subscriptionLevel = 'trial';
            updates.isSubscribed = true;
            data.isSubscribed = true;
            console.log(`[Techie] Synced corporate trial: ${corporateTrialStatus.daysLeft} days`);
          } else if (!data.trialExpiresAt) {
            const trialExpires = new Date(data.createdAt || Date.now());
            trialExpires.setDate(trialExpires.getDate() + TRIAL_DAYS);
            updates.trialExpiresAt = trialExpires.toISOString();
            data.trialExpiresAt = trialExpires.toISOString();
          }
          
          if (!data.isApproved) {
            updates.isApproved = true;
            data.isApproved = true;
          }
          if (!data.subscriptionLevel) {
            updates.subscriptionLevel = 'free';
            data.subscriptionLevel = 'free';
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

        // Check CorporateGPT's trial status for this email
        let trialStatus = { eligible: false, daysLeft: 0 };
        if (u.email) {
          trialStatus = await checkCorporateTrial(u.email);
        }

        // Check for pre-configured family profile
        let familyProfile: { name: string; age: number; gradeId: string; accessLevel: string } | null = null;
        if (u.email) {
          try {
            // Check if this user is a pre-registered family member
            const familyQuery = query(
              collection(db, 'family_invites'),
              where('childEmail', '==', u.email.toLowerCase()),
              where('parentEmail', '!=', null)
            );
            const familySnapshot = await getDocs(familyQuery);
            if (!familySnapshot.empty) {
              const familyData = familySnapshot.docs[0].data();
              familyProfile = {
                name: familyData.name || 'Estudiante',
                age: familyData.age || 10,
                gradeId: familyData.gradeId || 'primaria1',
                accessLevel: familyData.accessLevel || 'techie_only'
              };
              console.log('[Auth] Found pre-configured family profile:', familyProfile);
            }
          } catch (error) {
            console.error('Error checking family profile:', error);
          }
        }

        const trialExpires = new Date();
        trialExpires.setDate(trialExpires.getDate() + TRIAL_DAYS);

        // Use corporate trial status - if eligible, set as trial user
        const subscriptionLevel = trialStatus.eligible ? 'trial' : 'free';
        // Override isApproved based on corporate trial eligibility
        isApproved = trialStatus.eligible || u.email === 'gfreyria@gmail.com';

        // Get parent's subscription level for family members
        let parentSubscriptionLevel = subscriptionLevel;
        if (familyProfile && u.email) {
          try {
            const parentQuery = query(
              collection(db, 'users'),
              where('email', '==', u.email)
            );
            const parentDocs = await getDocs(parentQuery);
            for (const doc of parentDocs.docs) {
              const data = doc.data();
              if (data.role === 'admin' && data.subscriptionLevel) {
                parentSubscriptionLevel = data.subscriptionLevel;
                break;
              }
            }
          } catch (e) {
            console.warn('Could not get parent subscription:', e);
          }
        }

        const newProfile: UserProfile = {
          uid: u.uid,
          email: u.email || '',
          name: familyProfile?.name || u.displayName || 'Estudiante',
          role: u.email === 'gfreyria@gmail.com' ? 'admin' : 'user',
          isApproved,
          age: familyProfile?.age,
          gradeId: familyProfile?.gradeId,
          trialExpiresAt: trialStatus.eligible ? trialExpires.toISOString() : undefined,
          isSubscribed: trialStatus.eligible || !!familyProfile,
          tokensPerDay: (trialStatus.eligible || familyProfile) ? 100 : 20,
          dailyUsageCount: 0,
          lastUsageDate: new Date().toISOString().split('T')[0],
          subscriptionLevel: familyProfile ? parentSubscriptionLevel : subscriptionLevel,
          // Set permissions based on access level
          ...(familyProfile?.accessLevel === 'both' && {
            permissions: { corporate: true, techie: true }
          })
        };

        if (trialStatus.eligible) {
          console.log(`[Techie] Corporate trial active: ${trialStatus.daysLeft} days left`);
        }

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
