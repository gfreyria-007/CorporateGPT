import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function updateUserRole(uid: string, role: 'user' | 'admin' | 'super-admin') {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
}

export async function updateUserBanStatus(uid: string, banned: boolean) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { banned });
}

export async function updateUserLimits(uid: string, maxQueries: number, maxImages: number, unlimitedUsage: boolean) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    maxQueries,
    maxImages,
    unlimitedUsage
  });
}

export async function updateAppConfig(config: any) {
  const configRef = doc(db, 'admin', 'config');
  await updateDoc(configRef, config);
}
