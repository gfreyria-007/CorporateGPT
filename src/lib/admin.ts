import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type SubscriptionType = 'trial_3day' | 'trial_7day' | 'monthly' | 'free' | 'admin';

export async function approveUserSubscription(uid: string, type: SubscriptionType, expiresAt?: Date) {
  const userRef = doc(db, 'users', uid);
  
  const subscriptionConfigs: Record<SubscriptionType, { 
    role: string;
    subscriptionLevel: string;
    maxQueries: number;
    maxImages: number;
    unlimitedUsage: boolean;
  }> = {
    trial_3day: { 
      role: 'trial', 
      subscriptionLevel: 'trial', 
      maxQueries: 50, 
      maxImages: 20, 
      unlimitedUsage: false,
      tokensPerDay: 100
    },
    trial_7day: { 
      role: 'trial', 
      subscriptionLevel: 'trial', 
      maxQueries: 100, 
      maxImages: 50, 
      unlimitedUsage: false,
      tokensPerDay: 200
    },
    monthly: { 
      role: 'paid', 
      subscriptionLevel: 'maestro', 
      maxQueries: 999999, 
      maxImages: 999999, 
      unlimitedUsage: true,
      tokensPerDay: 999999
    },
    free: { 
      role: 'free', 
      subscriptionLevel: 'free', 
      maxQueries: 999999, 
      maxImages: 999999, 
      unlimitedUsage: true,
      tokensPerDay: 999999
    },
admin: { 
      role: 'super-admin', 
      subscriptionLevel: 'admin', 
      maxQueries: 999999, 
      maxImages: 999999, 
      unlimitedUsage: true,
      tokensPerDay: 999999
    }
  };
  
  const config = subscriptionConfigs[type];
  const now = new Date();
  const expiry = type === 'trial_3day' 
    ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    : type === 'trial_7day'
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      : type === 'monthly'
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null;
  
  await updateDoc(userRef, {
    role: config.role,
    subscriptionLevel: config.subscriptionLevel,
    maxQueries: config.maxQueries,
    maxImages: config.maxImages,
    unlimitedUsage: config.unlimitedUsage,
    tokensPerDay: config.tokensPerDay || 999999,
    subscriptionApprovedAt: Timestamp.now(),
    subscriptionExpiresAt: expiry ? Timestamp.fromDate(expiry) : null,
    approvedBy: 'super-admin'
  });
}

export async function rejectUser(uid: string, reason?: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role: 'rejected',
    rejectionReason: reason || 'Not approved by admin',
    rejectedAt: Timestamp.now()
  });
}

// Legacy functions kept for backwards compatibility
export async function updateUserRole(uid: string, role: 'trial' | 'user' | 'paid' | 'admin' | 'super-admin') {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
}

export async function updateUserRole(uid: string, role: 'trial' | 'user' | 'paid' | 'admin' | 'super-admin') {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
}

export async function updateUserBanStatus(uid: string, banned: boolean) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { banned });
}

export async function updateUserLimits(uid: string, maxQueries: number, maxImages: number, unlimitedUsage: boolean) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    maxQueries,
    maxImages,
    unlimitedUsage
  });
}

export async function upgradeUserToPaid(uid: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    role: 'paid',
    unlimitedUsage: true,
    maxQueries: 999999,
    maxImages: 999999,
    subscriptionActive: true,
    subscriptionPlan: 'corporate',
    upgradedAt: new Date().toISOString()
  });
}

export async function addUserSubscription(uid: string, plan: 'starter' | 'professional' | 'enterprise', seats: number = 1) {
  const userRef = doc(db, 'users', uid);
  const planLimits: Record<string, { maxQueries: number, maxImages: number }> = {
    starter: { maxQueries: 100, maxImages: 20 },
    professional: { maxQueries: 500, maxImages: 100 },
    enterprise: { maxQueries: 999999, maxImages: 999999 }
  };
  await updateDoc(userRef, { 
    role: 'paid',
    subscriptionPlan: plan,
    subscriptionSeats: seats,
    maxQueries: planLimits[plan].maxQueries,
    maxImages: planLimits[plan].maxImages,
    unlimitedUsage: plan === 'enterprise',
    subscriptionActive: true,
    subscriptionStartedAt: new Date().toISOString()
  });
}

export interface AppConfig {
  version?: string;
  maintenanceMode?: boolean;
  features?: Record<string, boolean>;
  limits?: {
    maxUsers?: number;
    maxCompanies?: number;
  };
  [key: string]: unknown;
}

export async function updateAppConfig(config: AppConfig) {
  const configRef = doc(db, 'admin', 'config');
  await updateDoc(configRef, config);
}
