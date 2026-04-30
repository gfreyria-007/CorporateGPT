/**
 * useQuota.ts — React hook for real-time quota state
 *
 * Subscribes to the user's daily quota document in Firestore.
 * Exposes eco mode status, token/multimedia usage, and helpers
 * to deduct credits from UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from './firebase';
import {
  DailyQuota,
  getDailyQuota,
  consumeTokens,
  consumeMultimediaCredits,
  getMexicoDateString,
  MULTIMEDIA_COSTS,
} from './quotaManager';

export interface QuotaState {
  quota: DailyQuota | null;
  isLoading: boolean;
  ecoModeActive: boolean;
  tokenPercent: number;          // 0–100
  multimediaRemaining: number;
  // Actions
  deductTokens: (count: number) => Promise<void>;
  deductImage: () => Promise<{ success: boolean; remaining: number }>;
  deductPresentation: () => Promise<{ success: boolean; remaining: number }>;
}

/**
 * @param uid - Firebase user UID
 * @param tier - company tier for limit resolution
 */
export function useQuota(
  uid: string | null | undefined,
  tier: 'starter' | 'professional' | 'enterprise' | 'trial' = 'trial'
): QuotaState {
  const [quota, setQuota] = useState<DailyQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize quota and subscribe to Firestore updates
  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    // Ensure today's quota doc exists (will auto-reset if stale date)
    getDailyQuota(uid, tier).then(q => {
      setQuota(q);
      setIsLoading(false);
    });

    // Subscribe to real-time updates (so eco banner reacts instantly)
    const ref = doc(db, 'users', uid, 'quota', 'daily');
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data() as DailyQuota;
        const todayMX = getMexicoDateString();
        if (data.date === todayMX) {
          setQuota(data);
        }
      }
    });

    return () => unsub();
  }, [uid, tier]);

  const deductTokens = useCallback(async (count: number) => {
    if (!uid) return;
    await consumeTokens(uid, count, tier);
  }, [uid, tier]);

  const deductImage = useCallback(async () => {
    if (!uid) return { success: false, remaining: 0 };
    return consumeMultimediaCredits(uid, MULTIMEDIA_COSTS.image, tier);
  }, [uid, tier]);

  const deductPresentation = useCallback(async () => {
    if (!uid) return { success: false, remaining: 0 };
    return consumeMultimediaCredits(uid, MULTIMEDIA_COSTS.presentation, tier);
  }, [uid, tier]);

  const tokenPercent = quota
    ? Math.round((quota.tokensUsed / quota.tokensLimit) * 100)
    : 0;

  const multimediaRemaining = quota
    ? quota.multimediaLimit - quota.multimediaUsed
    : 0;

  return {
    quota,
    isLoading,
    ecoModeActive: quota?.ecoModeActive ?? false,
    tokenPercent,
    multimediaRemaining,
    deductTokens,
    deductImage,
    deductPresentation,
  };
}
