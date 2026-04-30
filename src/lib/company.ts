/**
 * company.ts — Corporate GPT V2 Multi-Tenant Engine
 * Handles creation, retrieval, and membership of Companies.
 * Each Company is an NDA-Proof isolated tenant.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Company, CompanyTier, CompanyBranding } from '../types';
import { handleFirestoreError, OperationType } from './db';

// Seat limits per tier
export const TIER_SEAT_LIMITS: Record<CompanyTier, number> = {
  starter: 5,
  professional: 25,
  enterprise: 200,
};

// App version mapping per tier
export const TIER_APP_VERSION: Record<CompanyTier, string> = {
  starter: 'v2-starter',
  professional: 'v2-professional',
  enterprise: 'v2-enterprise',
};

/**
 * Create a new Company document.
 * Called when a Super Admin onboards a new PyME client.
 */
export async function createCompany(params: {
  name: string;
  tier: CompanyTier;
  adminUid: string;
  adminEmail: string;
  branding?: CompanyBranding;
}): Promise<string> {
  // Generate a deterministic but unique company ID
  const companyId = `${params.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
  const companyRef = doc(db, 'companies', companyId);

  try {
    await setDoc(companyRef, {
      id: companyId,
      name: params.name,
      tier: params.tier,
      appVersion: TIER_APP_VERSION[params.tier],
      branding: {
        logo_url: params.branding?.logo_url || null,
        primary_color: params.branding?.primary_color || '#2563EB',
        app_name: params.branding?.app_name || params.name,
      },
      adminUid: params.adminUid,
      adminEmail: params.adminEmail,
      maxSeats: TIER_SEAT_LIMITS[params.tier],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } satisfies Omit<Company, 'id'> & { id: string });

    console.log(`[Company] Created: ${companyId} (${params.tier})`);
    return companyId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `companies/${companyId}`);
    throw error;
  }
}

/**
 * Fetch a Company by ID (single read, no subscription).
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  try {
    const snap = await getDoc(doc(db, 'companies', companyId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Company;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `companies/${companyId}`);
    return null;
  }
}

/**
 * Subscribe to a Company document in real-time.
 * Use in React context to reactively update branding / tier.
 */
export function subscribeToCompany(
  companyId: string,
  callback: (company: Company | null) => void
): () => void {
  const companyRef = doc(db, 'companies', companyId);
  return onSnapshot(
    companyRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as Company);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `companies/${companyId}`);
    }
  );
}

/**
 * Update company branding (logo, color, name).
 * Only callable by Company Admins / Super Admin.
 */
export async function updateCompanyBranding(
  companyId: string,
  branding: Partial<CompanyBranding>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'companies', companyId), {
      branding,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}`);
  }
}

/**
 * Upgrade or downgrade a Company tier.
 * Automatically updates appVersion and maxSeats.
 */
export async function updateCompanyTier(
  companyId: string,
  newTier: CompanyTier
): Promise<void> {
  try {
    await updateDoc(doc(db, 'companies', companyId), {
      tier: newTier,
      appVersion: TIER_APP_VERSION[newTier],
      maxSeats: TIER_SEAT_LIMITS[newTier],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}`);
  }
}

/**
 * Assign a user to a company.
 * Writes companyId and companyRole to the user's profile.
 * This is the critical tenant-linking step.
 */
export async function assignUserToCompany(
  uid: string,
  companyId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      companyId,
      companyRole: role,
    });
    console.log(`[Company] User ${uid} assigned to ${companyId} as ${role}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * List all users belonging to a company.
 * Super Admin / Company Admin only.
 */
export async function getCompanyMembers(companyId: string) {
  try {
    const q = query(collection(db, 'users'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users?companyId=${companyId}`);
    return [];
  }
}
