"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "./providers/AuthProvider";
import { useCompany } from "./providers/CompanyProvider";
import { Agent } from "@/types/agent";

interface ChatInterfaceProps {
  activeAgent?: Agent | null;
  onBackToAgents?: () => void;
}

export default function ChatInterface({ activeAgent, onBackToAgents }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { config } = useCompany();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState("auto");

  // useChat configuration for SDK 6.x
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      selectedModel,
      uid: user?.uid,
      agentId: activeAgent?.id,
      systemPrompt: activeAgent?.systemPrompt,
    },
    // In SDK 6.x, body is passed directly, transport is optional for custom logic
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[650px] w-full glass-card rounded-3xl overflow-hidden animate-fade-in relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {activeAgent ? (
            <button 
              onClick={onBackToAgents}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          ) : (
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg tracking-tight">
              {activeAgent ? activeAgent.name : "Company Assistant"}
            </h3>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Powered by Dual-RAG
            </p>
          </div>
        </div>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-300"
        >
          <option value="auto">✨ Auto-Select (Smart Routing)</option>
          <option value="gpt-4o">OpenAI GPT-4o</option>
          <option value="claude-3-5-sonnet">Anthropic Claude 3.5</option>
          <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
          <option value="llama-3.1-sonar-large-128k-online">Perplexity Online</option>
        </select>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="font-medium text-lg">Hello! I'm your enterprise AI.</p>
              <p className="text-sm">I have access to your company policies and RAG context.</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-fade-in`}
            >
              <div className="flex items-center gap-2 mb-1 px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {m.role === "user" ? "You" : (activeAgent?.name || "Assistant")}
                </span>
              </div>
              <div 
                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  m.role === "user" 
                    ? "chat-bubble-user" 
                    : "chat-bubble-ai"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {m.parts
                    ?.filter((p) => p.type === "text")
                    .map((p) => (p as any).text)
                    .join("") || (m as any).content || ""}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full premium-gradient flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="h-4 w-24 bg-white/10 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={activeAgent ? `Message ${activeAgent.name}...` : "Ask anything about company policies..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square premium-gradient rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
        <p className="text-[10px] text-center mt-3 text-gray-500 font-medium">
          Secure enterprise chat • Policy-verified responses
        </p>
      </div>
    </div>
  );
}
