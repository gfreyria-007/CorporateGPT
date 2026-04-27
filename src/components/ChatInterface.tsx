"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { useAuth } from "./providers/AuthProvider";
import { useCompany } from "./providers/CompanyProvider";
import { Agent } from "@/types/agent";

interface ChatInterfaceProps {
  activeAgent?: Agent | null;
  onBackToAgents?: () => void;
  fullScreen?: boolean;
}

export default function ChatInterface({ activeAgent, onBackToAgents, fullScreen }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { config } = useCompany();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [selectedModel, setSelectedModel] = useState("auto");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string; type: string }[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [input, setInput] = useState("");


  // useChat configuration
  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({
        selectedModel,
        uid: user?.uid,
        agentId: activeAgent?.id,
        systemPrompt: activeAgent?.systemPrompt,
        attachments: attachedFiles,
      })
    }),
    onFinish: () => {
      setAttachedFiles([]);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
  };


  // Simplified loading state
  const isCurrentlyLoading = status === "submitted" || status === "streaming";

  const handleActionClick = async (content: string) => {
    console.log("Action click:", content);
    try {
      await sendMessage({ text: content });
    } catch (e) {
      console.error("Action error:", e);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input?.trim();
    if (!message && attachedFiles.length === 0) return;
    
    try {
      await sendMessage({ text: message || "" });
      setInput("");
    } catch (e) {
      console.error("Submit error:", e);
    }
  };

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
          content = "[Binary file content]";
        }
        return { name: file.name, content, type: file.type };
      })
    );

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setShowMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`flex flex-col w-full h-full relative overflow-hidden ${fullScreen ? "bg-transparent" : "bg-[#050505] rounded-3xl border border-white/5"}`}>
      
      {/* Scrollable Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative z-10"
      >
        <div className="max-w-3xl mx-auto px-6 py-20 space-y-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-12 py-20 animate-fade-in">
              {/* Central Logo/Icon */}
              <div className="relative">
                 <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] rotate-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-[10px] font-black italic text-white">o3</span>
                 </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white italic tracking-tighter">
                  {activeAgent ? `Forge: ${activeAgent.name}` : "¿Qué tienes en mente hoy?"}
                </h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Neural Processing Node • Ready for Input</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xl pt-8">
                {[
                  { title: "Technical Synthesis", sub: "DRAFT GEN", prompt: "Draft a technical summary of " },
                  { title: "Security Protocols", sub: "AUDIT NODE", prompt: "Audit the security of " },
                  { title: "Compliance Logic", sub: "POLICY RAG", prompt: "Verify compliance for " },
                  { title: "Visual Assets", sub: "IMAGE GEN", prompt: "Generate a concept visual for " }
                ].map((action) => (
                  <button 
                    key={action.title}
                    onClick={() => handleActionClick(action.prompt)}
                    className="flex flex-col items-start p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">{action.sub}</p>
                    <p className="text-xs font-bold text-white tracking-tight">{action.title}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-fade-in group`}
              >
                {/* Identity Header */}
                <div className={`flex items-center gap-3 mb-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${m.role === "user" ? "bg-white/5 border-white/10" : "premium-gradient border-white/20"}`}>
                      {m.role === "user" ? (
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      ) : (
                        <span className="text-xs font-bold">{activeAgent?.avatar || "✨"}</span>
                      )}
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
                      {m.role === "user" ? "Access Point: User" : (activeAgent?.name || "Neural Assistant")}
                   </span>
                </div>

                {/* Message Bubble */}
                <div 
                  className={`max-w-[100%] sm:max-w-[85%] rounded-3xl px-8 py-5 text-[15px] leading-relaxed transition-all ${
                    m.role === "user" 
                      ? "bg-white/[0.03] border border-white/5 text-slate-200" 
                      : "text-white font-medium"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {m.parts?.map((p, idx) => {
                      if (p.type === "reasoning") {
                        return (
                          <div key={idx} className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-2 animate-pulse-subtle">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/70">Neural Reasoning</span>
                            </div>
                            <div className="text-[13px] text-blue-300/60 font-mono leading-relaxed whitespace-pre-wrap italic">
                              {(p as any).reasoning}
                            </div>
                          </div>
                        );
                      }
                      
                      if (p.type === "text") {
                        const text = (p as any).text || "";
                        if (text.includes("```mermaid")) {
                          const [before, rest] = text.split("```mermaid");
                          const [code, after] = rest.split("```");
                          return (
                            <div key={idx} className="my-2">
                              {before && <div className="whitespace-pre-wrap">{before}</div>}
                              <div className="bg-white/5 p-4 rounded-xl border border-white/10 overflow-x-auto my-4">
                                <pre className="mermaid text-[10px] text-emerald-400">
                                  {code.trim()}
                                </pre>
                              </div>
                              {after && <div className="whitespace-pre-wrap">{after}</div>}
                            </div>
                          );
                        }
                        return <div key={idx} className="whitespace-pre-wrap">{text}</div>;
                      }
                      
                      return null;
                    }) || (
                      <div className="whitespace-pre-wrap">{(m as any).content || ""}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isCurrentlyLoading && (
            <div className="flex items-center gap-4 animate-pulse pt-4">
              <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <div className="space-y-2">
                 <div className="h-2 w-32 bg-white/5 rounded-full"></div>
                 <div className="h-2 w-24 bg-white/5 rounded-full opacity-50"></div>
              </div>
            </div>
          )}
          <div className="h-10" />
        </div>
      </div>

      {/* ── STABLE INPUT AREA (Not Absolute) ── */}
      <div className="w-full p-6 bg-gradient-to-t from-black via-black to-transparent pt-12 relative z-50">
        <div className="max-w-3xl mx-auto relative">
          
          {/* Attachments (Pills) */}
          {attachedFiles.length > 0 && (
            <div className="absolute bottom-full left-0 mb-4 flex flex-wrap gap-2 animate-fade-in">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 group backdrop-blur-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => setAttachedFiles(f => f.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <form 
            onSubmit={handleFormSubmit}
            className="glass-card rounded-[2rem] p-2 pr-4 border-white/10 shadow-2xl focus-within:border-white/20 transition-all flex items-end gap-2 bg-[#141414] relative z-40"
          >
            {/* Add Menu Button */}
            <div className="relative">
               <button 
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className={`p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all ${showMenu ? "rotate-45" : "rotate-0"}`}
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
               </button>

               {showMenu && (
                 <div className="absolute bottom-full left-0 mb-4 glass-card rounded-3xl p-3 w-64 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in-up bg-[#1A1A1A]">
                    <div className="space-y-1">
                       <button onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white italic">Neural Upload</p>
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Review & Reference</p>
                          </div>
                       </button>

                       <button onClick={() => { setInput("Create an advanced presentation about "); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white italic">Presentations</p>
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Advanced Slides</p>
                          </div>
                       </button>

                       <button onClick={() => { setInput("Generate an infographic for "); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white italic">Infographics</p>
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Visual Insights</p>
                          </div>
                       </button>

                       <button onClick={() => { setInput("Create a detailed graph for "); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white italic">Advanced Graphs</p>
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Dynamic Visualization</p>
                          </div>
                       </button>
                    </div>
                 </div>
               )}
            </div>

            <textarea
              ref={textareaRef}
              value={input || ""}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e as any);
                }
              }}
              rows={1}
              placeholder={activeAgent ? `Message ${activeAgent.name}...` : "Escribe aquí tu consulta..."}
              className="flex-1 bg-transparent py-3 text-sm focus:outline-none placeholder:text-slate-600 resize-none max-h-48 custom-scrollbar text-white"
            />

            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />

            <button
              type="submit"
              disabled={isCurrentlyLoading || (!(input?.trim()) && attachedFiles.length === 0)}
              className="p-3 bg-white text-black rounded-full disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </form>

          <p className="text-[9px] text-center mt-4 text-slate-700 font-black uppercase tracking-[0.4em]">
            Neural Core v3.0 • Secure Enterprise Intelligence
          </p>
        </div>
      </div>

      {/* Mermaid Setup */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs"
        type="module"
        strategy="afterInteractive"
      />
      <Script 
        id="mermaid-init" 
        strategy="afterInteractive"
        type="module"
      >
        {`
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ startOnLoad: true, theme: 'dark' });
          setInterval(() => {
            const elements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
            if (elements.length > 0) {
              mermaid.run({ nodes: Array.from(elements) });
            }
          }, 2000);
        `}
      </Script>
    </div>
  );
}
