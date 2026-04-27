/**
 * src/lib/rag.ts
 * ---------------------------------------------------------------
 * Dual RAG system for Corporate GPT:
 *
 *  1️⃣  POLICY RAG – company‑wide policies / compliance docs that
 *      the main chatbot references for every conversation.
 *
 *  2️⃣  AGENT RAG – per‑agent (gem) documents that only that
 *      specific agent can access during its conversations.
 * ---------------------------------------------------------------
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import type { PolicyDocument, AgentDocument } from "@/types/agent";

/** Upload a file to storage and link it to an agent */
export const uploadAgentDoc = async (
  agentId: string,
  file: File
): Promise<string> => {
  const filePath = `agents/${agentId}/docs/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);
  
  // 1. Upload to Storage
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);
  
  // 2. Extract text (Simulated for now, would typically use a Cloud Function or library)
  // For basic text files we can read them directly
  let content = `Reference file: ${file.name}`;
  if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
    content = await file.text();
  } else {
    content = `Binary file uploaded: ${file.name}. URL: ${fileUrl}`;
  }

  // 3. Save metadata in Firestore
  return await addAgentDoc(agentId, {
    agentId,
    content,
    fileName: file.name,
    fileUrl
  });
};

/* ================================================================
   POLICY RAG  –  /policies/{docId}
   ================================================================ */

/** Add or update a company‑wide policy document */
export const upsertPolicy = async (
  policy: Omit<PolicyDocument, "id" | "createdAt"> & { id?: string }
): Promise<string> => {
  if (policy.id) {
    const ref = doc(db, "policies", policy.id);
    await setDoc(ref, { ...policy, createdAt: new Date().toISOString() }, { merge: true });
    return policy.id;
  }
  const ref = await addDoc(collection(db, "policies"), {
    ...policy,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

/** Delete a policy document */
export const deletePolicy = async (id: string) => {
  await deleteDoc(doc(db, "policies", id));
};

/** Helper for timeout wrapping */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs))
  ]);
};

/** Get ALL policy documents (small set – company‑wide) */
export const getAllPolicies = async (): Promise<PolicyDocument[]> => {
  try {
    const snap = await withTimeout(getDocs(collection(db, "policies")), 2000, { docs: [] } as any);
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as PolicyDocument));
  } catch (e) {
    console.error("Policy fetch error:", e);
    return [];
  }
};

/** Build a context string from policy docs that match the user query (keyword) */
export const getPolicyContext = async (queryText: string): Promise<string> => {
  const policies = await getAllPolicies();
  if (!policies.length) return "";
  const terms = queryText.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  // Score each policy by how many query terms appear in its content
  const scored = policies
    .map((p) => {
      const lower = p.content.toLowerCase();
      const score = terms.reduce((s, t) => s + (lower.includes(t) ? 1 : 0), 0);
      return { ...p, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (!scored.length) {
    // If nothing matches, return all policies (they're company‑wide and presumably few)
    return policies.map((p) => `## ${p.title}\n${p.content}`).join("\n\n---\n\n");
  }
  return scored.map((p) => `## ${p.title}\n${p.content}`).join("\n\n---\n\n");
};

/** Get all documents for an agent */
export const getAgentDocs = async (agentId: string): Promise<AgentDocument[]> => {
  try {
    const snap = await withTimeout(getDocs(collection(db, "agents", agentId, "documents")), 2000, { docs: [] } as any);
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as AgentDocument));
  } catch (e) {
    console.error("Agent docs fetch error:", e);
    return [];
  }
};

/** Build a context string from agent docs that match the user query */
export const getAgentContext = async (
  agentId: string,
  queryText: string
): Promise<string> => {
  const docs = await getAgentDocs(agentId);
  if (!docs.length) return "";
  const terms = queryText.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const scored = docs
    .map((d) => {
      const lower = d.content.toLowerCase();
      const score = terms.reduce((s, t) => s + (lower.includes(t) ? 1 : 0), 0);
      return { ...d, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return scored.map((d) => `[${d.fileName}]\n${d.content}`).join("\n\n---\n\n");
};
