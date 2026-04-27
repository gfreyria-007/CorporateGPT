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
): Promise<{ tokensUsed: number; month: string }> => {
  try {
    const usageRef = doc(db, "usage", uid);
    const snap = await getDoc(usageRef);
    const now = new Date();
    const month = `${now.getFullYear()}-${now.getMonth() + 1}`;

    if (snap.exists()) {
      const data = snap.data() as any;
      if (data.month === month) {
        return { tokensUsed: data.tokensUsed || 0, month };
      }
    }
    // No record for this month → initialise
    await setDoc(usageRef, { tokensUsed: 0, month }, { merge: true });
    return { tokensUsed: 0, month };
  } catch (e) {
    console.error("Error fetching usage:", e);
    return { tokensUsed: 0, month: "" };
  }
};

export const incrementUserUsage = async (uid: string, tokens: number) => {
  const { tokensUsed, month } = await getUserUsage(uid);
  const usageRef = doc(db, "usage", uid);
  await setDoc(usageRef, { tokensUsed: tokensUsed + tokens, month }, { merge: true });
};
