/**
 * src/lib/agents.ts
 * Firestore helpers for managing user‑created Agents (Gems).
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Agent } from "@/types/agent";

const AGENTS_COL = "agents";

/** Create a new agent */
export const createAgent = async (
  data: Omit<Agent, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, AGENTS_COL), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
};

/** Update an existing agent */
export const updateAgent = async (
  id: string,
  data: Partial<Agent>
): Promise<void> => {
  const ref = doc(db, AGENTS_COL, id);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
};

/** Delete an agent and its sub‑documents would remain (manual cleanup if needed) */
export const deleteAgent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, AGENTS_COL, id));
};

/** Get all agents owned by a specific user */
export const getUserAgents = async (uid: string): Promise<Agent[]> => {
  const q = query(collection(db, AGENTS_COL), where("ownerUid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Agent));
};
