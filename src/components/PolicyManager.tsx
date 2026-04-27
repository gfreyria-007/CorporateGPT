"use client";

import React, { useState, useEffect } from "react";
import { getAllPolicies, upsertPolicy, deletePolicy } from "@/lib/rag";
import type { PolicyDocument } from "@/types/agent";

export default function PolicyManager() {
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await getAllPolicies();
    setPolicies(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await upsertPolicy({ title, content, ...(editingId ? { id: editingId } : {}) });
    setTitle("");
    setContent("");
    setEditingId(null);
    await load();
    setLoading(false);
  };

  const handleEdit = (p: PolicyDocument) => {
    setTitle(p.title);
    setContent(p.content);
    setEditingId(p.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this policy document?")) return;
    await deletePolicy(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">📋 Company Policies (RAG)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            These documents are automatically injected as context into every chat conversation.
          </p>
        </div>
      </div>

      {/* Existing Policies */}
      {policies.length > 0 && (
        <div className="space-y-3">
          {policies.map((p) => (
            <div key={p.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{p.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{p.content}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(p)} className="text-xs text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-semibold">{editingId ? "Edit Policy" : "Add New Policy"}</h4>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm"
          placeholder="Policy Title (e.g. Code of Conduct)"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent resize-y text-sm"
          placeholder="Paste the policy content here…"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading || !title.trim() || !content.trim()}
            className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Saving…" : editingId ? "Update" : "Add Policy"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setTitle(""); setContent(""); }} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
