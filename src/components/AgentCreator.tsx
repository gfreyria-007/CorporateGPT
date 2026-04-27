"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./providers/AuthProvider";
import { getUserAgents, createAgent, updateAgent, deleteAgent } from "@/lib/agents";
import { addAgentDoc, getAgentDocs, deleteAgentDoc } from "@/lib/rag";
import type { Agent, AgentDocument } from "@/types/agent";

const EMOJI_OPTIONS = ["🤖", "🧠", "📊", "✍️", "💡", "🔬", "📝", "🎯", "🛡️", "🌐", "📈", "⚖️"];

export default function AgentCreator({
  onSelectAgent,
}: {
  onSelectAgent: (agent: Agent | null) => void;
}) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedAgentDocs, setSelectedAgentDocs] = useState<AgentDocument[]>([]);
  const [docUploadAgentId, setDocUploadAgentId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [preferredModel, setPreferredModel] = useState("auto");
  const [docText, setDocText] = useState("");
  const [docFileName, setDocFileName] = useState("");

  const loadAgents = async () => {
    if (!user) return;
    const data = await getUserAgents(user.uid);
    setAgents(data);
  };

  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setAvatar("🤖");
    setSystemPrompt("");
    setPreferredModel("auto");
    setEditingAgent(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    if (editingAgent) {
      await updateAgent(editingAgent.id, {
        name,
        description,
        avatar,
        systemPrompt,
        preferredModel,
      });
    } else {
      await createAgent({
        ownerUid: user.uid,
        name,
        description,
        avatar,
        systemPrompt,
        preferredModel,
        tags: [],
      });
    }
    resetForm();
    await loadAgents();
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setDescription(agent.description);
    setAvatar(agent.avatar);
    setSystemPrompt(agent.systemPrompt);
    setPreferredModel(agent.preferredModel);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent?")) return;
    await deleteAgent(id);
    await loadAgents();
    onSelectAgent(null);
  };

  const loadDocs = async (agentId: string) => {
    const docs = await getAgentDocs(agentId);
    setSelectedAgentDocs(docs);
    setDocUploadAgentId(agentId);
  };

  const handleAddDoc = async () => {
    if (!docUploadAgentId || !docText.trim()) return;
    await addAgentDoc(docUploadAgentId, {
      agentId: docUploadAgentId,
      content: docText,
      fileName: docFileName || "Untitled Document",
    });
    setDocText("");
    setDocFileName("");
    await loadDocs(docUploadAgentId);
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!docUploadAgentId) return;
    await deleteAgentDoc(docUploadAgentId, docId);
    await loadDocs(docUploadAgentId);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Your Gems (Agents)</h3>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          + New Gem
        </button>
      </div>

      {/* Agent Cards */}
      {agents.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No agents yet. Create your first Gem to get started!
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer space-y-2"
          >
            <div className="flex items-center gap-3" onClick={() => onSelectAgent(agent)}>
              <span className="text-3xl">{agent.avatar}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{agent.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.description}</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs pt-1">
              <button onClick={() => onSelectAgent(agent)} className="text-blue-600 hover:underline">Chat</button>
              <button onClick={() => handleEdit(agent)} className="text-yellow-600 hover:underline">Edit</button>
              <button onClick={() => loadDocs(agent.id)} className="text-green-600 hover:underline">Docs</button>
              <button onClick={() => handleDelete(agent.id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 space-y-4">
          <h4 className="font-semibold text-base">{editingAgent ? "Edit Gem" : "Create New Gem"}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="e.g. Legal Advisor" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" placeholder="What does this agent do?" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((em) => (
                <button key={em} onClick={() => setAvatar(em)} className={`text-2xl p-1 rounded-lg transition-colors ${avatar === em ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}>{em}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">System Prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent resize-y" placeholder="You are a legal advisor specializing in corporate compliance..." />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Preferred Model</label>
            <select value={preferredModel} onChange={(e) => setPreferredModel(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
              <option value="auto">✨ Auto-Select</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="deepseek-coder">DeepSeek Coder</option>
              <option value="deepseek-chat">DeepSeek V3</option>
              <option value="llama-3.1-sonar-large-128k-online">Perplexity Online</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity">
              {editingAgent ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Agent Documents Panel */}
      {docUploadAgentId && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base">📄 Agent Reference Documents</h4>
            <button onClick={() => { setDocUploadAgentId(null); setSelectedAgentDocs([]); }} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
          </div>

          {/* Existing docs */}
          {selectedAgentDocs.length > 0 ? (
            <div className="space-y-2">
              {selectedAgentDocs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.content.slice(0, 100)}…</p>
                  </div>
                  <button onClick={() => handleDeleteDoc(d.id)} className="text-red-500 text-xs hover:underline ml-3 shrink-0">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No documents yet.</p>
          )}

          {/* Add new doc */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <input value={docFileName} onChange={(e) => setDocFileName(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="Document name (e.g. Brand Guidelines)" />
            <textarea value={docText} onChange={(e) => setDocText(e.target.value)} rows={4} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent resize-y text-sm" placeholder="Paste the document content here…" />
            <button onClick={handleAddDoc} disabled={!docText.trim()} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              Add Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
