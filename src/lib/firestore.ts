import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { CompanyConfig, defaultCompanyConfig } from "@/types/company";

// For this template, we assume a single overarching company config 
// stored in a document called "main" in the "companies" collection.
// In a true multi-tenant system, this would be scoped by the user's organization ID.
const COMPANY_DOC_ID = "main";
const COLLECTION_NAME = "companies";

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
