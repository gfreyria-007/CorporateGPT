import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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
