/**
 * quotaManager.ts — Corporate GPT V2 Daily Quota Engine
 *
 * Manages per-user daily quotas stored in Firestore:
 *   - 20,000 premium tokens / day
 *   - 5 multimedia credits / day  (1 image = 1 credit, 1 PPT = 3 credits)
 *
 * Eco Mode activates when token budget reaches 0:
 *   - Routes only to Elite-Eco models (DeepSeek R1 / Qwen 2.5)
 *   - Shows "Modo Eco Activo" banner to user
 *
 * Reset: counters reset at 00:00 America/Mexico_City
 */

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './db';

// ─── May 2026 Promotion ───────────────────────────────────────────────────────
export const MAY_2026_PROMO = {
  discount: 0.15,           // 15% off
  starterMXN: 233,          // after discount
  professionalMXN: 191,     // after discount (per user/seat)
  validMonth: '2026-05',    // YYYY-MM
};

// ─── Daily Quota Limits per Tier ─────────────────────────────────────────────
export const DAILY_QUOTA_LIMITS = {
  starter:      { tokens: 20_000, multimedia: 5 },
  professional: { tokens: 20_000, multimedia: 5 },
  enterprise:   { tokens: 100_000, multimedia: 30 },
  trial:        { tokens: 5_000, multimedia: 2 },
};

// ─── Multimedia Credit Costs ──────────────────────────────────────────────────
export const MULTIMEDIA_COSTS = {
  image: 1,           // 1 Nano Banana 2 image = 1 credit
  presentation: 3,    // 1 PPT deck (Qwen structure + Gemini render) = 3 credits
};

// ─── Eco Mode: only these models are allowed when budget = 0 ─────────────────
export const ECO_SAFE_MODELS = [
  'deepseek/deepseek-r1',
  'qwen/qwen-2.5-72b-instruct',
  'gemini-1.5-flash-latest',
];
export const ECO_DEFAULT_MODEL = 'qwen/qwen-2.5-72b-instruct';

// ─── Mexico Timezone Helpers ──────────────────────────────────────────────────

/** Returns today's date string in Mexico City timezone: "2026-04-30" */
export function getMexicoDateString(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Mexico_City',
  });
}

/** Returns hours until next midnight in Mexico City time */
export function hoursUntilMexicoMidnight(): number {
  const now = new Date();
  const mxFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  });
  const parts = mxFormatter.formatToParts(now);
  const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const s = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  return 24 - h - m / 60 - s / 3600;
}

// ─── Firestore Quota Document Path ───────────────────────────────────────────
function quotaRef(uid: string) {
  return doc(db, 'users', uid, 'quota', 'daily');
}

// ─── Quota Data Shape ─────────────────────────────────────────────────────────
export interface DailyQuota {
  date: string;              // "2026-04-30" Mexico date
  tokensUsed: number;
  tokensLimit: number;
  multimediaUsed: number;
  multimediaLimit: number;
  ecoModeActive: boolean;
  lastReset: any;            // Firestore Timestamp
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Get or initialize today's quota for a user.
 * If the stored date differs from today (Mexico), auto-resets the counters.
 */
export async function getDailyQuota(
  uid: string,
  tier: 'starter' | 'professional' | 'enterprise' | 'trial' = 'trial'
): Promise<DailyQuota> {
  const ref = quotaRef(uid);
  const todayMX = getMexicoDateString();
  const limits = DAILY_QUOTA_LIMITS[tier];

  try {
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data()?.date !== todayMX) {
      // New day — reset counters
      const fresh: DailyQuota = {
        date: todayMX,
        tokensUsed: 0,
        tokensLimit: limits.tokens,
        multimediaUsed: 0,
        multimediaLimit: limits.multimedia,
        ecoModeActive: false,
        lastReset: serverTimestamp(),
      };
      await setDoc(ref, fresh);
      console.info(`[Quota] Daily reset for ${uid} — date: ${todayMX}`);
      return fresh;
    }

    return snap.data() as DailyQuota;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/quota/daily`);
    // Return a safe default if Firestore fails
    return {
      date: todayMX,
      tokensUsed: 0,
      tokensLimit: limits.tokens,
      multimediaUsed: 0,
      multimediaLimit: limits.multimedia,
      ecoModeActive: false,
      lastReset: null,
    };
  }
}

/**
 * Consume tokens from today's quota.
 * If remaining tokens hit 0, activates Eco Mode.
 * Returns the updated quota.
 */
export async function consumeTokens(
  uid: string,
  tokensConsumed: number,
  tier: 'starter' | 'professional' | 'enterprise' | 'trial' = 'trial'
): Promise<DailyQuota> {
  const ref = quotaRef(uid);
  const quota = await getDailyQuota(uid, tier);

  const newTokensUsed = Math.min(quota.tokensUsed + tokensConsumed, quota.tokensLimit);
  const ecoModeActive = newTokensUsed >= quota.tokensLimit;

  try {
    await updateDoc(ref, {
      tokensUsed: newTokensUsed,
      ecoModeActive,
    });

    if (ecoModeActive && !quota.ecoModeActive) {
      console.warn(`[Quota] ♻️ Eco Mode ACTIVATED for ${uid} — tokens exhausted`);
    }

    return { ...quota, tokensUsed: newTokensUsed, ecoModeActive };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/quota/daily`);
    return quota;
  }
}

/**
 * Consume multimedia credits.
 * Returns { success, remaining } — false if not enough credits.
 */
export async function consumeMultimediaCredits(
  uid: string,
  credits: number,
  tier: 'starter' | 'professional' | 'enterprise' | 'trial' = 'trial'
): Promise<{ success: boolean; remaining: number }> {
  const ref = quotaRef(uid);
  const quota = await getDailyQuota(uid, tier);

  const available = quota.multimediaLimit - quota.multimediaUsed;
  if (credits > available) {
    return { success: false, remaining: available };
  }

  try {
    await updateDoc(ref, { multimediaUsed: quota.multimediaUsed + credits });
    return { success: true, remaining: available - credits };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/quota/daily`);
    return { success: false, remaining: available };
  }
}

/**
 * Check if Eco Mode is currently active for a user.
 */
export async function isEcoModeActive(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(quotaRef(uid));
    if (!snap.exists()) return false;
    const data = snap.data() as DailyQuota;
    const todayMX = getMexicoDateString();
    if (data.date !== todayMX) return false; // stale — will reset
    return data.ecoModeActive;
  } catch {
    return false;
  }
}

/**
 * Returns whether the current month has the May 2026 promotion active.
 */
export function isMayPromoActive(): boolean {
  const currentMonth = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Mexico_City',
  }).substring(0, 7); // "2026-05"
  return currentMonth === MAY_2026_PROMO.validMonth;
}
