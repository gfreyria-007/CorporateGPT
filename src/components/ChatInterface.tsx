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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [selectedModel, setSelectedModel] = useState("auto");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string; type: string }[]>([]);

  // useChat configuration for SDK 6.x
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/chat",
    body: {
      selectedModel,
      uid: user?.uid,
      agentId: activeAgent?.id,
      systemPrompt: activeAgent?.systemPrompt,
      attachments: attachedFiles, // Send attachments to the backend
    },
    onFinish: () => {
      setAttachedFiles([]); // Clear attachments after successful send
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        let content = "";
        if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          content = await file.text();
        } else {
          content = "[Binary file content - metadata only]";
        }
        return { name: file.name, content, type: file.type };
      })
    );

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-[700px] w-full glass-card rounded-3xl overflow-hidden animate-fade-in relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-10">
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
            <h3 className="font-black text-white italic tracking-tight">
              {activeAgent ? activeAgent.name : "Neural Assistant"}
            </h3>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Drive Active
            </p>
          </div>
        </div>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-300 outline-none"
        >
          <option value="auto">✨ Auto (Gemini)</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="claude-3-5-sonnet">Claude 3.5</option>
        </select>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="max-w-xs">
              <p className="font-black text-white italic text-xl">Systems Online.</p>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mt-2">Ready for neural processing</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-fade-in group`}
            >
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${m.role === "user" ? "text-blue-400" : "text-emerald-400 italic"}`}>
                  {m.role === "user" ? "Protocol: User" : `Neural: ${activeAgent?.name || "Assistant"}`}
                </span>
              </div>
              <div 
                className={`max-w-[90%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-xl border ${
                  m.role === "user" 
                    ? "chat-bubble-user border-white/10" 
                    : "chat-bubble-ai border-white/5"
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">
                  {m.parts
                    ?.filter((p) => p.type === "text")
                    .map((p) => (p as any).text)
                    .join("") || (m as any).content || ""}
                </div>
              </div>
              {/* Message Timestamp/Decor */}
              <div className="mt-2 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-30 transition-opacity">
                {new Date().toLocaleTimeString()} • Encrypted Node
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-2">
               <div className="h-2 w-32 bg-white/10 rounded-full"></div>
               <div className="h-2 w-24 bg-white/5 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl relative z-10">
        
        {/* Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 group">
                <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{file.name}</span>
                <button onClick={() => removeAttachment(i)} className="text-rose-500 hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="relative group bg-white/5 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              rows={1}
              placeholder={activeAgent ? `Transmit to ${activeAgent.name}...` : "Query neural network..."}
              className="w-full bg-transparent py-4 pl-14 pr-14 focus:outline-none transition-all placeholder:text-slate-600 text-sm resize-none"
            />
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-3 top-3.5 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange} 
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
              className="absolute right-3 top-3.5 p-2 bg-blue-600 text-white rounded-xl disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            Node-to-Node Encryption Active
          </p>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
