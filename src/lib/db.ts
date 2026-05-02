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

export const SUPER_ADMIN_EMAIL = 'gfreyria@gmail.com';

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
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.email === SUPER_ADMIN_EMAIL ? 'super-admin' : 'user',
        companyId: null,          // V2: assigned later via invite or self-onboard
        companyRole: null,        // V2: 'owner' | 'admin' | 'member'
        isBanned: false,
        queriesUsed: 0,
        imagesUsed: 0,
        maxQueries: 10,
        maxImages: 10,
        unlimitedUsage: user.email === SUPER_ADMIN_EMAIL,
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now()
      });
    } else {
      await updateDoc(userRef, { lastActive: Timestamp.now() });
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

export async function saveGPT(uid: string, gptData: any) {
  const gptId = gptData.id || Math.random().toString(36).substr(2, 9);
  const gptRef = doc(db, 'gpts', gptId);
  const finalData = {
    ...gptData,
    id: gptId,
    userId: uid, // Ensure owner is tracked
    updatedAt: serverTimestamp(),
    createdAt: gptData.createdAt || serverTimestamp()
  };
  
  // Firestore rejects undefined values, so we sanitize the object
  Object.keys(finalData).forEach(key => finalData[key] === undefined && delete finalData[key]);

  try {
    await setDoc(gptRef, finalData, { merge: true });
    return gptId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `gpts`);
  }
}

export function subscribeToGPTs(uid: string, callback: (gpts: any[]) => void) {
  const gptsRef = collection(db, 'gpts');
  const q = query(gptsRef, or(
    where('userId', '==', uid),
    where('isPublic', '==', true)
  ));
  
  return onSnapshot(q, (snapshot) => {
    const gpts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(gpts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `gpts`);
  });
}

export async function deleteGPT(uid: string, gptId: string) {
  const gptRef = doc(db, 'gpts', gptId);
  try {
    // Only owner should delete - rules will enforce this, 
    // but we can check here too if we want.
    await deleteDoc(gptRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gpts`);
  }
}

