import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const TRIAL_DAYS = 3;
const TRIAL_QUERIES_PER_DAY = 10;
const TRIAL_IMAGES_PER_DAY = 5;

export interface TrialInfo {
  email: string;
  trialStarted: any; // Firestore timestamp
  trialEnds: any;
  used: boolean;
  queriesUsed: number;
  imagesUsed: number;
  lastUsageDate: string;
}

/**
 * Get today's date string inMexico City timezone
 */
export function getMexicoDateString(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Mexico_City',
  });
}

/**
 * Check if an email has already used their free trial
 */
export async function checkTrialStatus(email: string): Promise<{ eligible: boolean; reason?: string; daysLeft?: number }> {
  try {
    const trialRef = doc(db, 'trials', email.toLowerCase());
    const snap = await getDoc(trialRef);
    
    if (!snap.exists()) {
      return { eligible: true };
    }
    
    const data = snap.data() as TrialInfo;
    
    // Check if trial has been used
    if (data.used) {
      return { eligible: false, reason: 'trial_already_used' };
    }
    
    // Check if trial period has expired
    if (data.trialEnds) {
      const now = new Date();
      const end = data.trialEnds.toDate ? data.trialEnds.toDate() : new Date(data.trialEnds);
      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) {
        // Expire the trial
        await updateDoc(trialRef, { used: true });
        return { eligible: false, reason: 'trial_expired' };
      }
      
      return { eligible: true, daysLeft };
    }
    
    return { eligible: true };
  } catch (error) {
    console.error('[Trial] Error checking status:', error);
    return { eligible: true }; // Allow on error
  }
}

/**
 * Start a free trial for a new email
 */
export async function startTrial(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase();
    
    // Check if already used
    const check = await checkTrialStatus(normalizedEmail);
    if (!check.eligible) {
      return { success: false, error: check.reason };
    }
    
    const now = new Date();
    const trialEnds = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    
    const trialData: TrialInfo = {
      email: normalizedEmail,
      trialStarted: now,
      trialEnds: trialEnds,
      used: false,
      queriesUsed: 0,
      imagesUsed: 0,
      lastUsageDate: getMexicoDateString(),
    };
    
    await setDoc(doc(db, 'trials', normalizedEmail), trialData);
    
    console.log(`[Trial] Started for ${normalizedEmail}, expires ${trialEnds.toLocaleDateString()}`);
    return { success: true };
  } catch (error: any) {
    console.error('[Trial] Error starting trial:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Consume a trial query
 */
export async function consumeTrialQuery(email: string): Promise<{ allowed: boolean; remaining: number; daysLeft?: number }> {
  try {
    const normalizedEmail = email.toLowerCase();
    const trialRef = doc(db, 'trials', normalizedEmail);
    const snap = await getDoc(trialRef);
    
    if (!snap.exists()) {
      return { allowed: false, remaining: 0 };
    }
    
    const data = snap.data() as TrialInfo;
    const today = getMexicoDateString();
    
    // Reset daily if new day
    let queriesUsed = data.queriesUsed || 0;
    if (data.lastUsageDate !== today) {
      queriesUsed = 0;
    }
    
    // Check remaining
    const remaining = TRIAL_QUERIES_PER_DAY - queriesUsed;
    if (remaining <= 0) {
      return { allowed: false, remaining: 0 };
    }
    
    // Update usage
    await updateDoc(trialRef, {
      queriesUsed: queriesUsed + 1,
      lastUsageDate: today,
    });
    
    // Calculate days left
    let daysLeft = 0;
    if (data.trialEnds) {
      const end = data.trialEnds.toDate ? data.trialEnds.toDate() : new Date(data.trialEnds);
      daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
    
    return { allowed: true, remaining: remaining - 1, daysLeft };
  } catch (error) {
    console.error('[Trial] Error consuming query:', error);
    return { allowed: true, remaining: 10 };
  }
}

/**
 * Consume a trial image
 */
export async function consumeTrialImage(email: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const normalizedEmail = email.toLowerCase();
    const trialRef = doc(db, 'trials', normalizedEmail);
    const snap = await getDoc(trialRef);
    
    if (!snap.exists()) {
      return { allowed: false, remaining: 0 };
    }
    
    const data = snap.data() as TrialInfo;
    const today = getMexicoDateString();
    
    // Reset daily if new day
    let imagesUsed = data.imagesUsed || 0;
    if (data.lastUsageDate !== today) {
      imagesUsed = 0;
    }
    
    // Check remaining
    const remaining = TRIAL_IMAGES_PER_DAY - imagesUsed;
    if (remaining <= 0) {
      return { allowed: false, remaining: 0 };
    }
    
    // Update usage
    await updateDoc(trialRef, {
      imagesUsed: imagesUsed + 1,
      lastUsageDate: today,
    });
    
    return { allowed: true, remaining: remaining - 1 };
  } catch (error) {
    console.error('[Trial] Error consuming image:', error);
    return { allowed: true, remaining: 5 };
  }
}

/**
 * Get trial usage info
 */
export async function getTrialUsage(email: string): Promise<{ queriesUsed: number; imagesUsed: number; daysLeft: number } | null> {
  try {
    const normalizedEmail = email.toLowerCase();
    const trialRef = doc(db, 'trials', normalizedEmail);
    const snap = await getDoc(trialRef);
    
    if (!snap.exists()) {
      return null;
    }
    
    const data = snap.data() as TrialInfo;
    const today = getMexicoDateString();
    
    // Reset daily if new day
    let queriesUsed = data.queriesUsed || 0;
    let imagesUsed = data.imagesUsed || 0;
    if (data.lastUsageDate !== today) {
      queriesUsed = 0;
      imagesUsed = 0;
    }
    
    let daysLeft = 0;
    if (data.trialEnds) {
      const end = data.trialEnds.toDate ? data.trialEnds.toDate() : new Date(data.trialEnds);
      daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    }
    
    return { queriesUsed, imagesUsed, daysLeft };
  } catch (error) {
    console.error('[Trial] Error getting usage:', error);
    return null;
  }
}