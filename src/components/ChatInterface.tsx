"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { useAuth } from "./providers/AuthProvider";
import { useCompany } from "./providers/CompanyProvider";
import { Agent } from "@/types/agent";
import { getUserUsage, SUPER_ADMIN_EMAIL } from "@/lib/firestore";

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

  // v4.0.0 Manual Neural Engine State
  const [messages, setMessages] = useState<any[]>([]);
  const [localInput, setLocalInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string; type: string }[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [queriesLeft, setQueriesLeft] = useState(5);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Sync Usage with Firestore
  useEffect(() => {
    if (!user?.uid) return;
    
    const checkUsage = async () => {
      const isAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      setIsSuperAdmin(isAdmin);
      
      if (isAdmin) {
        setQueriesLeft(999); // Symbolic unlimited
        return;
      }

      try {
        const usage = await getUserUsage(user.uid);
        setQueriesLeft(Math.max(0, 5 - (usage.queriesUsed || 0)));
      } catch (e) {
        console.error("Failed to sync usage:", e);
      }
    };

    checkUsage();
  }, [user]);

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Manual Submission Logic (v4.0.0 Neural Override)
  const sendMessage = async (overrideContent?: string) => {
    if (!isSuperAdmin && queriesLeft <= 0) return;
    
    const content = overrideContent || localInput;
    if (!content.trim() && attachedFiles.length === 0) return;

    if (!isSuperAdmin) {
      setQueriesLeft(prev => Math.max(0, prev - 1));
    }
    setError(null);
    setIsStreaming(true);

    // 1. Add user message locally
    const userMessage = { id: Date.now().toString(), role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLocalInput("");

    // 2. Prepare AI placeholder
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          uid: user?.uid,
          email: user?.email,
          attachments: attachedFiles,
          agentId: activeAgent?.id,
          systemPrompt: activeAgent?.systemPrompt
        })
      });

      if (!response.ok) throw new Error(`Neural Link Error: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Neural stream is empty");

      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            lastMsg.content = assistantContent;
          }
          return newMessages;
        });
      }

      if (!assistantContent.trim()) {
        throw new Error("Neural Core returned an empty payload. The file may be too large or unreadable by the selected AI model.");
      }

      // Only clear attached files on complete success
      setAttachedFiles([]);
    } catch (err: any) {
      console.error("[NEURAL OVERRIDE CRASH]:", err);
      setError(err.message || "Unknown neural link failure");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleActionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  // UI Sync
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [localInput]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        return new Promise<{ name: string; content: string; base64: string; type: string }>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64String = (reader.result as string).split(",")[1];
            let content = "";
            if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
              content = await file.text();
            } else {
              content = "[Encrypted Binary File - Sent to Backend Parsers]";
            }
            resolve({ name: file.name, content, base64: base64String, type: file.type });
          };
        });
      })
    );
    setAttachedFiles((prev) => [...prev, ...newFiles as any]);
    setShowMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`flex flex-col w-full h-full relative overflow-hidden ${fullScreen ? "bg-transparent" : "bg-[#050505] rounded-3xl border border-white/5"}`}>
      
      {/* Demo Mode Banner */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 pointer-events-none">
        <div className="max-w-xl mx-auto backdrop-blur-2xl bg-black/60 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isSuperAdmin ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : queriesLeft > 0 ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-rose-500/20 border-rose-500/30 text-rose-400"}`}>
              {isSuperAdmin ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              ) : queriesLeft > 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              )}
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-widest uppercase">{isSuperAdmin ? "Neural Admin Active" : "Demo Mode Active"}</p>
              <p className="text-[10px] text-slate-400 font-bold italic tracking-wide">{isSuperAdmin ? "Strategic Corporate Oversight" : "Enterprise Intelligence Evaluation"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black italic ${isSuperAdmin ? "text-amber-400" : queriesLeft > 0 ? "text-emerald-400" : "text-rose-500"}`}>
                {isSuperAdmin ? "∞" : queriesLeft}
              </span>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{isSuperAdmin ? "Unlimited Access" : "Queries Left"}</span>
            </div>
            {(!isSuperAdmin && queriesLeft === 0) && <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest animate-pulse">Limit Reached</p>}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-24 space-y-12">
          {messages.length === 0 ? (
            <div className="space-y-16 animate-fade-in">
              <div className="flex flex-col items-center justify-center text-center space-y-12 py-10">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] rotate-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"><span className="text-[10px] font-black italic text-white">o3</span></div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white italic tracking-tighter">{activeAgent ? `Forge: ${activeAgent.name}` : "¿Qué tienes en mente hoy?"}</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Catalizia Neural Processing Node • Ready for Input</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xl pt-4">
                  {[{ title: "Technical Synthesis", sub: "DRAFT GEN", prompt: "Draft a technical summary of " }, { title: "Security Protocols", sub: "AUDIT NODE", prompt: "Audit the security of " }, { title: "Compliance Logic", sub: "POLICY RAG", prompt: "Verify compliance for " }, { title: "Visual Assets", sub: "IMAGE GEN", prompt: "Generate a concept visual for " }].map((action: any) => (
                    <button key={action.title} onClick={() => handleActionClick(action.prompt)} className="flex flex-col items-start p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">{action.sub}</p>
                      <p className="text-xs font-bold text-white tracking-tight">{action.title}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/5 pt-16 space-y-10">
                <div className="text-center space-y-2"><h3 className="text-xl font-black text-white italic tracking-tight">Intelligence Briefing</h3><p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Ventajas del Ecosistema Catalizia Corporate</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[{ icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, title: "Orquestación Multi-API", desc: "Selección dinámica del LLM (GPT-4, Claude 3.5, Gemini) óptimo para cada tarea, garantizando precisión técnica y eficiencia operativa.", color: "text-blue-400" }, { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, title: "Seguridad Grado NDA", desc: "Privacidad Enterprise total: tus datos corporativos sensibles NUNCA son utilizados para entrenar modelos públicos de terceros.", color: "text-emerald-400" }, { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, title: "Eficiencia de Recursos", desc: "Ahorro inteligente de tokens y mejora de latencia al balancear la carga de trabajo entre modelos ligeros y de alta capacidad.", color: "text-amber-400" }, { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>, title: "Guardrails Personalizados", desc: "Capa de control y cumplimiento alineada estrictamente con los valores éticos y políticas de gobernanza de tu organización.", color: "text-rose-400" }].map((faq, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] space-y-3 hover:bg-white/[0.03] transition-all">
                      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${faq.color}`}>{faq.icon}</div>
                      <h4 className="text-sm font-bold text-white italic">{faq.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{faq.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m: any) => {
              // Extract think block if present
              let displayContent = m.content;
              let thinkContent = null;
              
              if (m.role === "assistant" && typeof displayContent === "string") {
                const thinkMatch = displayContent.match(/<think>([\s\S]*?)<\/think>/);
                if (thinkMatch) {
                  thinkContent = thinkMatch[1].trim();
                  displayContent = displayContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
                } else if (displayContent.startsWith("<think>")) {
                  // Currently streaming the thought process
                  thinkContent = displayContent.replace("<think>", "").trim();
                  displayContent = ""; // Hide main content until thought finishes
                }
              }

              return (
                <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-fade-in group`}>
                  <div className={`flex items-center gap-3 mb-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${m.role === "user" ? "bg-white/5 border-white/10" : "premium-gradient border-white/20"}`}>
                      {m.role === "user" ? <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> : <span className="text-xs font-bold">{activeAgent?.avatar || "✨"}</span>}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{m.role === "user" ? "Access Point: User" : (activeAgent?.name || "Neural Assistant")}</span>
                  </div>
                  
                  {thinkContent && (
                    <div className="mb-3 max-w-[100%] sm:max-w-[85%] w-full">
                      <button 
                        onClick={() => toggleThought(m.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200"
                      >
                        <svg className={`w-4 h-4 transition-transform ${expandedThoughts[m.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">{!displayContent ? "Processing Neural Network..." : "View Neural Synapse Log"}</span>
                      </button>
                      
                      {(expandedThoughts[m.id] || !displayContent) && (
                        <div className="mt-2 p-4 rounded-2xl bg-black/40 border border-white/5 text-slate-400 text-xs font-mono leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                          {thinkContent}
                          {!displayContent && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>}
                        </div>
                      )}
                    </div>
                  )}

                  {displayContent && (
                    <div className={`max-w-[100%] sm:max-w-[85%] rounded-3xl px-8 py-5 text-[15px] leading-relaxed transition-all ${m.role === "user" ? "bg-white/[0.03] border border-white/5 text-slate-200" : "text-white font-medium"}`}>
                      <div className="whitespace-pre-wrap">{displayContent}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[11px] font-black uppercase tracking-widest text-center animate-shake">{error}</div>}
          {isStreaming && (
            <div className="flex items-center gap-4 animate-pulse pt-4">
              <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
              <div className="space-y-2"><div className="h-2 w-32 bg-white/5 rounded-full"></div><div className="h-2 w-24 bg-white/5 rounded-full opacity-50"></div></div>
            </div>
          )}
          <div className="h-10" />
        </div>
      </div>

      <div className="w-full p-6 bg-gradient-to-t from-black via-black to-transparent pt-12 relative z-50">
        <div className="max-w-3xl mx-auto relative">
          {attachedFiles.length > 0 && (
            <div className="absolute bottom-full left-0 mb-4 flex flex-wrap gap-2 animate-fade-in">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 group backdrop-blur-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => setAttachedFiles(f => f.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-white transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          )}
          {queriesLeft <= 0 ? (
            <div className="rounded-[2.5rem] p-6 text-center border border-rose-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#050505] relative z-40 space-y-2 backdrop-blur-xl">
              <p className="text-sm font-black text-rose-400 italic tracking-wide">Neural Link Depleted</p>
              <p className="text-xs text-slate-400 font-medium">You have exhausted your demo queries. Please rest or upgrade your access tier to continue.</p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="rounded-[2.5rem] p-2 pr-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-end gap-2 bg-[#050505] relative z-40" style={{ backgroundColor: '#050505' }}>
              <div className="relative">
                <button type="button" onClick={() => setShowMenu(!showMenu)} className={`p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all ${showMenu ? "rotate-45" : "rotate-0"}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg></button>
                {showMenu && (
                  <div className="absolute bottom-full left-0 mb-4 rounded-3xl p-3 w-64 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-fade-in-up bg-[#0a0a0a] backdrop-blur-2xl">
                    <div className="space-y-1">
                      <button onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div><div><p className="text-xs font-bold text-white italic">Neural Upload</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Review & Reference</p></div></button>
                      <button onClick={() => { setLocalInput("Create an advanced presentation about "); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group"><div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg></div><div><p className="text-xs font-bold text-white italic">Presentations</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Advanced Slides</p></div></button>
                      <button onClick={() => { setLocalInput("Generate an infographic for "); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group"><div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg></div><div><p className="text-xs font-bold text-white italic">Infographics</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Visual Insights</p></div></button>
                      <button onClick={() => { setLocalInput("Create a detailed graph for "); setShowMenu(false); }} className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white/5 text-left group"><div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div><div><p className="text-xs font-bold text-white italic">Advanced Graphs</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Dynamic Visualization</p></div></button>
                    </div>
                  </div>
                )}
              </div>
              <textarea ref={textareaRef} value={localInput} onChange={(e) => setLocalInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} placeholder={activeAgent ? `Message ${activeAgent.name}...` : "Escribe aquí tu consulta..."} className="flex-1 bg-transparent py-3 text-sm focus:outline-none placeholder:text-slate-600 resize-none max-h-48 custom-scrollbar text-white caret-blue-500" />
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              <button type="button" onClick={() => sendMessage()} disabled={isStreaming || (!localInput.trim() && attachedFiles.length === 0)} className="p-3 bg-white text-black rounded-full disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
            </form>
          )}
          <p className="text-[9px] text-center mt-4 text-slate-700 font-black uppercase tracking-[0.4em]">Neural Core v4.0.0 • Secure Enterprise Intelligence</p>
        </div>
      </div>
      <Script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs" type="module" strategy="afterInteractive" />
      <Script id="mermaid-init" strategy="afterInteractive" type="module">
        {`
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ startOnLoad: true, theme: 'dark' });
          setInterval(() => {
            const elements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
            if (elements.length > 0) mermaid.run({ nodes: Array.from(elements) });
          } , 2000);
        `}
      </Script>
    </div>
  );
}
