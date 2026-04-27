"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./providers/AuthProvider";
import { getUserAgents, createAgent, updateAgent, deleteAgent } from "@/lib/agents";
import { addAgentDoc, getAgentDocs, deleteAgentDoc, uploadAgentDoc } from "@/lib/rag";
import type { Agent, AgentDocument } from "@/types/agent";

const EMOJI_OPTIONS = ["🤖", "🧠", "📊", "✍️", "💡", "🔬", "📝", "🎯", "🛡️", "🌐", "📈", "⚖️"];

export default function AgentCreator({
  onSelectAgent,
}: {
  onSelectAgent: (agent: Agent | null) => void;
}) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedAgentDocs, setSelectedAgentDocs] = useState<AgentDocument[]>([]);
  const [docUploadAgentId, setDocUploadAgentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [preferredModel, setPreferredModel] = useState("auto");

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docUploadAgentId) return;

    setIsUploading(true);
    try {
      await uploadAgentDoc(docUploadAgentId, file);
      await loadDocs(docUploadAgentId);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!docUploadAgentId) return;
    await deleteAgentDoc(docUploadAgentId, docId);
    await loadDocs(docUploadAgentId);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-white">My Expert Gems</h3>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="text-xs premium-gradient text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          + Create New Gem
        </button>
      </div>

      {/* Agent Cards */}
      {agents.length === 0 && !showForm && (
        <div className="glass-card rounded-3xl p-12 text-center border-dashed border-white/10">
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            You haven't forged any AI personas yet.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="glass-card rounded-2xl p-5 hover:border-white/20 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10" onClick={() => onSelectAgent(agent)}>
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                {agent.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{agent.name}</h4>
                <p className="text-xs text-slate-400 font-medium truncate">{agent.description}</p>
              </div>
            </div>
            
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest pt-4 border-t border-white/5 mt-4 relative z-10">
              <button onClick={() => onSelectAgent(agent)} className="text-blue-400 hover:text-white transition-colors">Launch</button>
              <button onClick={() => handleEdit(agent)} className="text-amber-400 hover:text-white transition-colors">Edit</button>
              <button onClick={() => loadDocs(agent.id)} className="text-emerald-400 hover:text-white transition-colors">Docs</button>
              <button onClick={() => handleDelete(agent.id)} className="text-rose-500 hover:text-white transition-colors">Wipe</button>
            </div>
            
            {/* Hover Decor */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-8 space-y-6 relative z-20 animate-fade-in">
          <h4 className="text-lg font-black text-white italic">{editingAgent ? "Modify Persona" : "Forge New Persona"}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Callsign</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. Legal Oracle" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operational Brief</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Short summary of capabilities" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Visual Identifier</label>
            <div className="flex gap-2 flex-wrap bg-white/5 p-4 rounded-2xl border border-white/10">
              {EMOJI_OPTIONS.map((em) => (
                <button key={em} onClick={() => setAvatar(em)} className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl transition-all ${avatar === em ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/10 grayscale hover:grayscale-0"}`}>{em}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Core Logic (System Prompt)</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none" placeholder="Define the agent's behavior, knowledge limits, and communication style..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Engine</label>
            <select value={preferredModel} onChange={(e) => setPreferredModel(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="auto">✨ Smart Routing (Optimized)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Performance)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              <option value="gpt-4o">OpenAI GPT-4o (High Fidelity)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Creative)</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={handleSave} className="flex-1 premium-gradient text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
              {editingAgent ? "Update Gem" : "Finalize Forge"}
            </button>
            <button onClick={resetForm} className="px-8 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Agent Documents Panel */}
      {docUploadAgentId && (
        <div className="glass-card rounded-3xl p-8 space-y-6 animate-fade-in border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <h4 className="text-lg font-black text-white italic">Neural Knowledge Base</h4>
            </div>
            <button onClick={() => { setDocUploadAgentId(null); setSelectedAgentDocs([]); }} className="text-xs text-slate-500 hover:text-white font-bold uppercase tracking-widest">Close</button>
          </div>

          {/* Existing docs */}
          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {selectedAgentDocs.length > 0 ? (
              selectedAgentDocs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                       <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       <p className="text-sm font-bold text-white truncate">{d.fileName}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-1">{d.content.slice(0, 100)}…</p>
                  </div>
                  <button onClick={() => handleDeleteDoc(d.id)} className="opacity-0 group-hover:opacity-100 p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all ml-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p className="text-xs font-bold uppercase tracking-widest">No Data Ingested</p>
              </div>
            )}
          </div>

          {/* Add new doc - Internal Drive Upload */}
          <div className="pt-6 border-t border-white/10">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".txt,.pdf,.md,.doc,.docx"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`w-full flex items-center justify-center gap-3 border-2 border-dashed border-emerald-500/30 rounded-2xl py-6 transition-all hover:bg-emerald-500/5 hover:border-emerald-500/50 group ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Ingest Document</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Internal Secure Drive Upload</p>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
