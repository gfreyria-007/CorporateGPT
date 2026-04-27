"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import { useCompany } from "./providers/CompanyProvider";
import { useAuth } from "./providers/AuthProvider";
import type { Agent } from "@/types/agent";

interface ChatInterfaceProps {
  activeAgent?: Agent | null;
  onBackToAgents?: () => void;
}

export default function ChatInterface({ activeAgent, onBackToAgents }: ChatInterfaceProps) {
  const { config } = useCompany();
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState(
    activeAgent?.preferredModel || "auto"
  );

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      selectedModel: activeAgent?.preferredModel !== "auto" ? activeAgent?.preferredModel : selectedModel,
      systemPrompt: activeAgent?.systemPrompt || config.systemPrompt,
      uid: user?.uid || "",
      agentId: activeAgent?.id || null,
    },
  });

  const chatTitle = activeAgent
    ? `${activeAgent.avatar} ${activeAgent.name}`
    : `${config.name} Assistant`;

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Chat Header */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeAgent && onBackToAgents && (
            <button
              onClick={onBackToAgents}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-1"
            >
              ←
            </button>
          )}
          {!activeAgent && config.logoUrl && (
            <img src={config.logoUrl} alt="Company Logo" className="h-8 object-contain" />
          )}
          <h2 className="font-semibold">{chatTitle}</h2>
          {activeAgent && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
              Agent
            </span>
          )}
        </div>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="auto">✨ Auto-Select (Smart Routing)</option>
          <option value="gpt-4o">OpenAI GPT-4o</option>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="deepseek-coder">DeepSeek Coder</option>
          <option value="deepseek-chat">DeepSeek V3</option>
          <option value="llama-3.1-sonar-large-128k-online">Perplexity Online</option>
        </select>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center flex-col gap-2">
            <span className="text-4xl">{activeAgent ? activeAgent.avatar : "👋"}</span>
            <p>{activeAgent ? `Ask ${activeAgent.name} anything!` : "How can I help you today?"}</p>
            {activeAgent?.description && (
              <p className="text-xs text-gray-400 max-w-sm">{activeAgent.description}</p>
            )}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-[var(--color-primary)] text-white rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
