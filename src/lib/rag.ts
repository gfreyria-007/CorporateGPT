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
import { db } from "./firebase";
import type { PolicyDocument, AgentDocument } from "@/types/agent";

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

/** Get ALL policy documents (small set – company‑wide) */
export const getAllPolicies = async (): Promise<PolicyDocument[]> => {
  const snap = await getDocs(collection(db, "policies"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PolicyDocument));
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

/* ================================================================
   AGENT RAG  –  /agents/{agentId}/documents/{docId}
   ================================================================ */

/** Add a document to an agent's knowledge base */
export const addAgentDoc = async (
  agentId: string,
  data: Omit<AgentDocument, "id" | "createdAt">
): Promise<string> => {
  const colRef = collection(db, "agents", agentId, "documents");
  const ref = await addDoc(colRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

/** Delete a document from an agent's knowledge base */
export const deleteAgentDoc = async (agentId: string, docId: string) => {
  await deleteDoc(doc(db, "agents", agentId, "documents", docId));
};

/** Get all documents for an agent */
export const getAgentDocs = async (agentId: string): Promise<AgentDocument[]> => {
  const snap = await getDocs(collection(db, "agents", agentId, "documents"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AgentDocument));
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
