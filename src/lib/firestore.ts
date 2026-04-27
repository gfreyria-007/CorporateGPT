import { doc, getDoc, setDoc } from "firebase/firestore";
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

export const getCompanyConfig = async (): Promise<CompanyConfig> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, COMPANY_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CompanyConfig;
    } else {
      // If no config exists, set and return the default
      await setDoc(docRef, defaultCompanyConfig);
      return defaultCompanyConfig;
    }
  } catch (error) {
    console.error("Error fetching company config:", error);
    return defaultCompanyConfig;
  }
};

export const updateCompanyConfig = async (config: Partial<CompanyConfig>): Promise<void> => {
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
  // ── DEMO BYPASS ──
  if (uid === "GUEST_DEMO_UID") {
    return { tokensUsed: 0, queriesUsed: 0, month: "DEMO" };
  }

  try {
    const usageRef = doc(db, "usage", uid);
    const snap = await getDoc(usageRef);
    const now = new Date();
    const month = `${now.getFullYear()}-${now.getMonth() + 1}`;

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
    // No record for this month → initialise
    const initial = { tokensUsed: 0, queriesUsed: 0, month };
    await setDoc(usageRef, initial, { merge: true });
    return initial;
  } catch (e) {
    console.error("Error fetching usage:", e);
    return { tokensUsed: 0, queriesUsed: 0, month: "" };
  }
};

export const incrementUserUsage = async (uid: string, tokens: number, model: string = "auto") => {
  if (uid === "GUEST_DEMO_UID") return; // Skip for demo
  
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
