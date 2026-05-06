import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  deleteDoc,
  query,
  where,
  or,
  limit,
  Timestamp,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.warn('Firestore unavailable (non-fatal):', errInfo.error);
}

export const SUPER_ADMIN_EMAILS = ['gfreyria@gmail.com', 'gabrielfreyria@gmail.com'];

/**
 * ensureUserRecord — V2 Multi-Tenant aware.
 * On first login, creates the user document.
 * If the user is registering without a companyId invite,
 * they are treated as a solo trial user (no tenant yet).
 */
export async function ensureUserRecord(user: any) {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: isSuperAdmin ? 'super-admin' : 'pending',
        companyId: null,
        companyRole: null,
        isBanned: false,
        queriesUsed: 0,
        imagesUsed: 0,
        maxQueries: isSuperAdmin ? 999999 : 0,
        maxImages: isSuperAdmin ? 999999 : 0,
        unlimitedUsage: isSuperAdmin,
        subscriptionLevel: isSuperAdmin ? 'admin' : 'pending',
        subscriptionApprovedAt: null,
        subscriptionExpiresAt: null,
        trialRequestedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now()
      });
    } else {
      // For existing users, ensure Super Admin privileges are always up to date if they match the admin emails
      const isAdmin = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
      const existingData = snap.data();
      
      const updates: any = { lastActive: Timestamp.now() };
      if (isAdmin && (existingData.role !== 'super-admin' || !existingData.unlimitedUsage)) {
        updates.role = 'super-admin';
        updates.unlimitedUsage = true;
      }
      
      await updateDoc(userRef, updates);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
}

export async function incrementImageCount(uid: string) {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      imagesUsed: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'users');
  }
}

export async function flagUser(uid: string, reason: string) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { 
      flagged: true, 
      flaggedAt: serverTimestamp(),
      flagReason: reason 
    }, { merge: true });
  } catch (error) {
    console.error("Error flagging user:", error);
  }
}

export async function incrementQueryCount(uid: string) {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      queriesUsed: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'users');
  }
}

export async function saveGPT(uid: string, gptData: any, companyId?: string) {
  const MAX_GPT_SIZE = 500 * 1024; // 500KB max GPT data
  const serialized = JSON.stringify(gptData);
  if (serialized.length > MAX_GPT_SIZE) {
    throw new Error(`GPT data too large. Max ${MAX_GPT_SIZE / 1024}KB allowed.`);
  }

  const gptId = gptData.id || Math.random().toString(36).substr(2, 9);
  const gptRef = doc(db, 'gpts', gptId);
  const finalData = {
    ...gptData,
    id: gptId,
    userId: uid,
    companyId: companyId || gptData.companyId || null,
    visibility: companyId ? 'company' : (gptData.visibility || 'personal'),
    updatedAt: serverTimestamp(),
    createdAt: gptData.createdAt || serverTimestamp()
  };
  
  Object.keys(finalData).forEach(key => finalData[key] === undefined && delete finalData[key]);

  try {
    await setDoc(gptRef, finalData, { merge: true });
    return gptId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `gpts`);
  }
}

interface GPTSnapshot {
  id: string;
  userId: string;
  companyId?: string;
  visibility?: string;
  isPublic?: boolean;
  updatedAt?: { seconds: number };
  [key: string]: any;
}

export function subscribeToGPTs(uid: string, callback: (gpts: GPTSnapshot[]) => void, companyId?: string) {
  const gptsRef = collection(db, 'gpts');
  
  let q;
  if (companyId) {
    q = query(gptsRef, or(
      where('userId', '==', uid),
      where('companyId', '==', companyId),
      where('visibility', '==', 'company')
    ));
  } else {
    q = query(gptsRef, or(
      where('userId', '==', uid),
      where('isPublic', '==', true)
    ));
  }
  
  return onSnapshot(q, (snapshot) => {
    const allGPTs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as GPTSnapshot);
    
    let filteredGPTs: GPTSnapshot[];
    if (companyId) {
      filteredGPTs = allGPTs.filter(gpt => 
        gpt.userId === uid || 
        gpt.companyId === companyId || 
        gpt.visibility === 'company'
      );
    } else {
      filteredGPTs = allGPTs.filter(gpt => 
        gpt.userId === uid || 
        gpt.isPublic === true
      );
    }
    
    const uniqueGpts = Array.from(new Map(filteredGPTs.map(g => [g.id, g])).values());
    uniqueGpts.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    callback(uniqueGpts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `gpts`);
  });
}

export async function deleteGPT(uid: string, gptId: string) {
  const gptRef = doc(db, 'gpts', gptId);
  try {
    await deleteDoc(gptRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gpts`);
  }
}

const GPT_KEYWORDS: Record<string, string[]> = {
  'analyze': ['analyze', 'analysis', 'examine', 'review', 'evaluate', 'assess', 'check'],
  'write': ['write', 'draft', 'create', 'compose', 'generate', 'make', 'create document'],
  'code': ['code', 'program', 'function', 'script', 'debug', 'developer', 'developer'],
  'data': ['data', ' spreadsheet', 'excel', 'csv', 'calculate', ' numbers', 'metrics'],
  'research': ['research', 'search', 'find', 'information', 'learn about', 'investigate'],
  'summarize': ['summarize', 'summary', 'overview', 'recap', 'brief'],
  'translate': ['translate', 'language', 'español', 'english', 'spanish'],
  'presentation': ['presentation', 'slides', 'powerpoint', 'pptx', 'deck'],
  'email': ['email', 'correo', 'reply', 'message'],
  'contract': ['contract', 'legal', 'agreement', 'terms', 'clause'],
};

export function matchGPTByIntent(userMessage: string, gpts: GPTSnapshot[]): GPTSnapshot | null {
  if (!gpts || gpts.length === 0) return null;
  
  const lowerMessage = userMessage.toLowerCase();
  const messageWords = lowerMessage.replace(/[^\w\s]/g, '').split(/\s+/);
  
  for (const [category, keywords] of Object.entries(GPT_KEYWORDS)) {
    const matchedKeywords = keywords.filter(kw => {
      const cleanKw = kw.replace(' ', '');
      return messageWords.some(w => w.includes(cleanKw) || cleanKw.includes(w));
    });
    
    if (matchedKeywords.length > 0) {
      const matchedGPT = gpts.find(gpt => {
        const gptDesc = (gpt.description || '').toLowerCase();
        const gptName = (gpt.name || '').toLowerCase();
        const gptInstr = (gpt.instructions || '').toLowerCase();
        const combined = `${gptName} ${gptDesc} ${gptInstr}`;
        
        const categoryMatch = 
          (category === 'code' && (combined.includes('code') || combined.includes('programming') || combined.includes('developer'))) ||
          (category === 'write' && (combined.includes('write') || combined.includes('content') || combined.includes('draft'))) ||
          (category === 'data' && (combined.includes('data') || combined.includes('excel') || combined.includes('analytics') || combined.includes('spreadsheet'))) ||
          (category === 'research' && (combined.includes('research') || combined.includes('search') || combined.includes('web'))) ||
          (category === 'analyze' && (combined.includes('analyze') || combined.includes('review') || combined.includes('audit') || combined.includes('examine'))) ||
          (category === 'translate' && (combined.includes('translate') || combined.includes('language') || combined.includes('spanish') || combined.includes('english'))) ||
          (category === 'presentation' && (combined.includes('presentation') || combined.includes('slides') || combined.includes('deck') || combined.includes('powerpoint'))) ||
          (category === 'email' && (combined.includes('email') || combined.includes('correo') || combined.includes('mail'))) ||
          (category === 'contract' && (combined.includes('legal') || combined.includes('contract') || combined.includes('agreement'))) ||
          (category === 'summarize' && (combined.includes('summary') || combined.includes('overview') || combined.includes('recap')));
        
        const keywordMatch = matchedKeywords.some(kw => {
          const cleanKw = kw.replace(/[^\w]/g, '');
          return combined.includes(cleanKw);
        });
        
        return categoryMatch || keywordMatch;
      });
      
      if (matchedGPT) return matchedGPT;
    }
  }
  
  return null;
}

