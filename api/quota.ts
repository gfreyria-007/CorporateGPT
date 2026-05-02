/**
 * api/quota.ts — Server-Side Quota Validation
 * 
 * Validates user quotas on the server before processing AI requests.
 * This prevents client-side quota manipulation attacks.
 */

import { VercelRequest } from '@vercel/node';
import * as admin from 'firebase-admin';

// Removed top-level initialization to prevent Vercel boot crashes

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
    
    // Lazy Initialize inside the function
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') })
        });
      }
    }

    const db = admin.apps.length ? admin.firestore() : null;
    if (!db) {
      console.warn('⚠️ Quota check skipped: Firebase not initialized');
      return { allowed: true, remainingTokens: 5000, ecoMode: false };
    }
    
    const quotaDoc = await db.collection('users').doc(userId)
      .collection('quota').doc('daily').get();

    if (!quotaDoc.exists) {
      return {
        allowed: true,
        remainingTokens: 5000,
        ecoMode: false,
      };
    }

    const quota = quotaDoc.data() as UserQuota;

    if (quota.date !== todayMX) {
      return {
        allowed: true,
        remainingTokens: 20000,
        ecoMode: false,
      };
    }

    const availableTokens = Math.max(0, quota.tokensLimit - quota.tokensUsed);
    const availablePurchased = quota.purchased_credits || 0;
    const totalAvailable = availableTokens + availablePurchased;

    if (totalAvailable <= 0) {
      return {
        allowed: false,
        reason: 'QUOTA_EXHAUSTED: Daily quota and purchased credits exhausted',
        remainingTokens: 0,
        ecoMode: true,
      };
    }

    return {
      allowed: true,
      remainingTokens: totalAvailable,
      ecoMode: quota.ecoModeActive,
    };
  } catch (error) {
    console.error('[QuotaValidation] Error:', error);
    return {
      allowed: true,
      remainingTokens: 5000,
      ecoMode: false,
    };
  }
}

export async function consumeServerQuota(userId: string, tokensUsed: number): Promise<boolean> {
  try {
    const todayMX = getMexicoDateString();
    
    // Lazy Initialize inside the function
    if (!admin.apps.length) {
       const projectId = process.env.FIREBASE_PROJECT_ID;
       const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
       const privateKey = process.env.FIREBASE_PRIVATE_KEY;
       if (projectId && clientEmail && privateKey) {
         admin.initializeApp({
           credential: admin.credential.cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') })
         });
       }
    }

    const db = admin.apps.length ? admin.firestore() : null;
    if (!db) return false;
    
    const quotaRef = db.collection('users').doc(userId)
      .collection('quota').doc('daily');

    await db.runTransaction(async (transaction) => {
      const quotaDoc = await transaction.get(quotaRef);
      
      if (!quotaDoc.exists) {
        transaction.set(quotaRef, {
          date: todayMX,
          tokensUsed: tokensUsed,
          tokensLimit: 20000,
          multimediaUsed: 0,
          multimediaLimit: 5,
          ecoModeActive: false,
          purchased_credits: 0,
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

      const ecoModeActive = (newTokensUsed >= quota.tokensLimit) && (newPurchasedCredits === 0);

      transaction.update(quotaRef, {
        tokensUsed: newTokensUsed,
        purchased_credits: newPurchasedCredits,
        ecoModeActive,
      });
    });

    return true;
  } catch (error) {
    console.error('[QuotaConsumption] Error:', error);
    return false;
  }
}

export function extractUserId(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const idToken = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    return decoded.uid || decoded.user_id || null;
  } catch {
    return null;
  }
}