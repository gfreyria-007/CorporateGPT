/**
 * useVersionGatekeeper.ts — V2 Version Gatekeeper Hook
 *
 * Reads the company's `appVersion` from Firestore in real-time.
 * Exposes engine health state so the UI can show a subtle indicator
 * if the fallback was triggered (Super Admin diagnostic mode).
 */

import { useState, useEffect, useCallback } from 'react';
import { subscribeToCompany } from './company';
import { Company } from '../types';

export type EngineStatus = 'primary' | 'fallback' | 'unknown';

export interface GatekeeperState {
  appVersion: string | null;
  company: Company | null;
  engineStatus: EngineStatus;
  fallbackReason: string | null;
  setEngineStatus: (status: EngineStatus, reason?: string) => void;
}

/**
 * Hook that subscribes to the company doc and tracks engine health.
 * @param companyId - from user profile (null for trial/solo users)
 */
export function useVersionGatekeeper(companyId: string | null | undefined): GatekeeperState {
  const [company, setCompany] = useState<Company | null>(null);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [engineStatus, setEngineStatusState] = useState<EngineStatus>('unknown');
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  // Subscribe to company doc for real-time appVersion updates
  useEffect(() => {
    if (!companyId) {
      // Solo / trial user — no company tenant yet
      setAppVersion('v2-starter');
      setEngineStatusState('unknown');
      return;
    }

    const unsub = subscribeToCompany(companyId, (co) => {
      if (co) {
        setCompany(co);
        setAppVersion(co.appVersion);
        console.info(`[Gatekeeper] App version synced: ${co.appVersion} | Tier: ${co.tier}`);
      }
    });

    return () => unsub();
  }, [companyId]);

  const setEngineStatus = useCallback((status: EngineStatus, reason?: string) => {
    setEngineStatusState(status);
    if (reason) setFallbackReason(reason);
    if (status === 'primary') setFallbackReason(null);

    // Super Admin console event for diagnostics
    if (status === 'fallback') {
      console.warn(`[Gatekeeper] ⚡ Safe-Fallback ACTIVE — Reason: ${reason}`);
    } else if (status === 'primary') {
      console.info('[Gatekeeper] ✅ Primary engine restored');
    }
  }, []);

  return {
    appVersion,
    company,
    engineStatus,
    fallbackReason,
    setEngineStatus,
  };
}
