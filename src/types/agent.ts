/**
 * Agent (Gem) – a custom AI persona created by the user.
 * Each agent has its own system prompt, preferred model, and
 * an optional set of reference documents (agent‑level RAG).
 */
export interface Agent {
  id: string;
  /** Owner's Firebase UID */
  ownerUid: string;
  name: string;
  description: string;
  /** Emoji or image URL used as the agent's avatar */
  avatar: string;
  /** The system prompt that defines this agent's personality/role */
  systemPrompt: string;
  /** Preferred model – "auto" means use smart routing */
  preferredModel: string;
  /** Tags for filtering reference documents */
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** A document attached to an agent for RAG retrieval */
export interface AgentDocument {
  id: string;
  agentId: string;
  /** Plain‑text content (extracted from uploaded file) */
  content: string;
  /** Original file name for display */
  fileName: string;
  createdAt: string;
}

/** A company‑wide policy document for the main chatbot RAG */
export interface PolicyDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
