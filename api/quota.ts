/**
 * api/quota.ts — Server-Side Quota Validation
 * 
 * Validates user quotas on the server before processing AI requests.
 * This prevents client-side quota manipulation attacks.
 */

import { VercelRequest } from '@vercel/node';

let adminInstance: any = null;

async function getAdmin() {
  if (adminInstance) return adminInstance;
  try {
    const mod = await import('firebase-admin');
    adminInstance = mod.apps?.length ? mod : null;
    return mod;
  } catch {
    return null;
  }
}

async function ensureFirebase() {
  try {
    const mod = await getAdmin();
    if (!mod || mod.apps.length) return;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      mod.initializeApp({
        credential: mod.credential.cert({ projectId, clientEmail, privateKey })
      });
    }
  } catch {
    // Firebase unavailable — quota checks skipped
  }
}

interface UserQuota {
  tokensUsed: number;
  tokensLimit: number;
  purchased_credits: number;
  ecoModeActive: boolean;
  date: string;
}

function getMexicoDateString(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Mexico_City',
  });
}

export async function validateUserQuota(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remainingTokens: number;
  ecoMode: boolean;
}> {
  try {
    const todayMX = getMexicoDateString();
    await ensureFirebase();

    const admin = await getAdmin();
    const db = admin?.apps?.length ? admin.firestore() : null;
    if (!db) {
      return { allowed: true, remainingTokens: 5000, ecoMode: false };
    }
    
    const quotaDoc = await db.collection('users').doc(userId)
      .collection('quota').doc('daily').get();

    if (!quotaDoc.exists) {
      return { allowed: true, remainingTokens: 5000, ecoMode: false };
    }

    const quota = quotaDoc.data() as UserQuota;

    if (quota.date !== todayMX) {
      return { allowed: true, remainingTokens: 20000, ecoMode: false };
    }

    const availableTokens = Math.max(0, quota.tokensLimit - quota.tokensUsed);
    const availablePurchased = quota.purchased_credits || 0;
    const totalAvailable = availableTokens + availablePurchased;

    if (totalAvailable <= 0) {
      return { allowed: false, reason: 'QUOTA_EXHAUSTED', remainingTokens: 0, ecoMode: true };
    }

    return { allowed: true, remainingTokens: totalAvailable, ecoMode: quota.ecoModeActive };
  } catch {
    return { allowed: true, remainingTokens: 5000, ecoMode: false };
  }
}

export async function consumeServerQuota(userId: string, tokensUsed: number): Promise<boolean> {
  try {
    const todayMX = getMexicoDateString();
    await ensureFirebase();

    const admin = await getAdmin();
    const db = admin?.apps?.length ? admin.firestore() : null;
    if (!db) return false;
    
    const quotaRef = db.collection('users').doc(userId)
      .collection('quota').doc('daily');

    await db.runTransaction(async (transaction: any) => {
      const quotaDoc = await transaction.get(quotaRef);
      
      if (!quotaDoc.exists) {
        transaction.set(quotaRef, {
          date: todayMX, tokensUsed, tokensLimit: 20000,
          multimediaUsed: 0, multimediaLimit: 5,
          ecoModeActive: false, purchased_credits: 0,
        });
        return;
      }

      const quota = quotaDoc.data() as UserQuota;
      let newTokensUsed = quota.tokensUsed + tokensUsed;
      let newPurchasedCredits = quota.purchased_credits || 0;
      let remainingToConsume = 0;

      if (newTokensUsed > quota.tokensLimit) {
        remainingToConsume = newTokensUsed - quota.tokensLimit;
        newTokensUsed = quota.tokensLimit;
      }

      if (remainingToConsume > 0) {
        if (newPurchasedCredits >= remainingToConsume) {
          newPurchasedCredits -= remainingToConsume;
          remainingToConsume = 0;
        } else {
          remainingToConsume -= newPurchasedCredits;
          newPurchasedCredits = 0;
        }
      }

      transaction.update(quotaRef, {
        tokensUsed: newTokensUsed,
        purchased_credits: newPurchasedCredits,
        ecoModeActive: (newTokensUsed >= quota.tokensLimit) && (newPurchasedCredits === 0),
      });
    });

    return true;
  } catch {
    return false;
  }
}

export function extractUserId(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const idToken = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    return decoded.uid || decoded.user_id || null;
  } catch {
    return null;
  }
}
