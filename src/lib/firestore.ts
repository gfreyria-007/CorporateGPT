import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getFirestore } from "firebase/firestore";
import { db } from "./firebase";
import { CompanyConfig, defaultCompanyConfig } from "@/types/company";

// For this template, we assume a single overarching company config
// stored in a document called "main" in the "companies" collection.
// In a true multi-tenant system, this would be scoped by the user's organization ID.
const COMPANY_DOC_ID = "main";
const COLLECTION_NAME = "companies";

/* ----------------------------------------------------------------
   Company Config
   ---------------------------------------------------------------- */

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, defaultValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(defaultValue), timeoutMs))
  ]);
};

export const getCompanyConfig = async (): Promise<CompanyConfig> => {
  if (!db) return defaultCompanyConfig;
  try {
    const docRef = doc(db, COLLECTION_NAME, COMPANY_DOC_ID);
    const docSnap = await withTimeout(getDoc(docRef), 2000, { exists: () => false } as any);

    if (docSnap.exists()) {
      return docSnap.data() as CompanyConfig;
    } else {
      return defaultCompanyConfig;
    }
  } catch (error) {
    console.error("Error fetching company config:", error);
    return defaultCompanyConfig;
  }
};

export const updateCompanyConfig = async (config: Partial<CompanyConfig>): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, COLLECTION_NAME, COMPANY_DOC_ID);
    await setDoc(docRef, config, { merge: true });
  } catch (error) {
    console.error("Error updating company config:", error);
    throw error;
  }
};

/* ----------------------------------------------------------------
   User Token Usage & Budget Tracking
   ---------------------------------------------------------------- */

export const getUserUsage = async (
  uid: string
): Promise<{ tokensUsed: number; queriesUsed: number; month: string }> => {
  if (uid === "GUEST_DEMO_UID") {
    return { tokensUsed: 0, queriesUsed: 0, month: "DEMO" };
  }

  const now = new Date();
  const month = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const fallback = { tokensUsed: 0, queriesUsed: 0, month };

  try {
    if (!db) return fallback;
    const usageRef = doc(db, "usage", uid);
    const snap = await withTimeout(getDoc(usageRef), 2000, { exists: () => false } as any);

    if (snap.exists()) {
      const data = snap.data() as any;
      if (data.month === month) {
        return { 
          tokensUsed: data.tokensUsed || 0, 
          queriesUsed: data.queriesUsed || 0,
          month 
        };
      }
    }
    return fallback;
  } catch (e) {
    console.error("Error fetching usage:", e);
    return fallback;
  }
};

export const incrementUserUsage = async (uid: string, tokens: number, model: string = "auto") => {
  if (uid === "GUEST_DEMO_UID" || !db) return; // Skip for demo or if no db
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const month = `${now.getFullYear()}-${now.getMonth() + 1}`;
  
  const { tokensUsed, queriesUsed } = await getUserUsage(uid);
  const usageRef = doc(db, "usage", uid);
  
  // 1. Update Monthly Totals
  await setDoc(usageRef, { 
    tokensUsed: tokensUsed + tokens, 
    queriesUsed: queriesUsed + 1,
    month 
  }, { merge: true });

  // 2. Update Daily Detailed Log
  const dailyRef = doc(db, "usage", uid, "daily", dateStr);
  const dailySnap = await getDoc(dailyRef);
  const dailyData = dailySnap.exists() ? dailySnap.data() : { tokens: 0, queries: 0, models: {} };
  
  const modelUsage = dailyData.models || {};
  modelUsage[model] = (modelUsage[model] || 0) + tokens;

  await setDoc(dailyRef, {
    tokens: (dailyData.tokens || 0) + tokens,
    queries: (dailyData.queries || 0) + 1,
    models: modelUsage,
    updatedAt: now.toISOString()
  }, { merge: true });
};

/** Get daily usage for a specific user and date */
export const getDailyUsage = async (uid: string, dateStr: string) => {
  const dailyRef = doc(db, "usage", uid, "daily", dateStr);
  const snap = await getDoc(dailyRef);
  return snap.exists() ? snap.data() : null;
};

/**
 * SECURITY: Log a violation and potentially ban the user
 */
export const logSecurityViolation = async (uid: string, email: string, reason: string) => {
  if (!db) return;
  try {
    await addDoc(collection(db, "security_logs"), {
      uid,
      email,
      reason,
      timestamp: new Date().toISOString(),
      severity: "CRITICAL"
    });

    // Auto-ban after any security violation in public mode
    await banUser(uid, email, reason);
  } catch (e) {
    console.error("Failed to log violation:", e);
  }
};

/**
 * Ban a user permanently
 */
export const banUser = async (uid: string, email: string, reason: string) => {
  if (!db) return;
  try {
    await setDoc(doc(db, "banned_users", uid), {
      uid,
      email,
      reason,
      bannedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to ban user:", e);
  }
};

/**
 * Check if a user is banned
 */
export const isUserBanned = async (uid: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const banRef = doc(db, "banned_users", uid);
    const banSnap = await getDoc(banRef);
    return banSnap.exists();
  } catch (e) {
    return false;
  }
};
