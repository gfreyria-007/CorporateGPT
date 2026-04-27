"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCompany } from "@/components/providers/CompanyProvider";
import ChatInterface from "@/components/ChatInterface";
import AgentCreator from "@/components/AgentCreator";
import { getUserAgents } from "@/lib/agents";
import type { Agent } from "@/types/agent";

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, logOut } = useAuth();
  const { config, loading: configLoading } = useCompany();
  const [activeTab, setActiveTab] = useState<"chat" | "agents">("chat");
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (user) {
      getUserAgents(user.uid).then(setUserAgents);
    }
  }, [user]);

  if (authLoading || configLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse italic">Neural Link Active</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] text-slate-100 selection:bg-blue-500/30 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>

        <div className="max-w-md w-full glass-card rounded-[2.5rem] overflow-hidden p-12 text-center space-y-10 animate-fade-in relative z-10 border-white/5">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="h-16 mx-auto object-contain" />
          ) : (
            <div className="w-16 h-16 premium-gradient rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] rotate-6 group hover:rotate-0 transition-transform duration-500">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          )}
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-white italic">
              {config.name || "Corporate GPT"}
            </h1>
            <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase">{config.slogan || "Next-Gen Intelligence"}</p>
          </div>
          
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

          <button
            onClick={signInWithGoogle}
            className="group w-full flex items-center justify-center gap-4 bg-white text-slate-950 py-5 px-8 rounded-3xl transition-all hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.47 18.64 12 18.64C9.15 18.64 6.74 16.71 5.86 14.12H2.18V16.97C3.99 20.57 7.68 23 12 23Z" fill="#34A853"/>
              <path d="M5.86 14.12C5.63 13.45 5.5 12.74 5.5 12C5.5 11.26 5.63 10.55 5.86 9.88V7.03H2.18C1.43 8.52 1 10.21 1 12C1 13.79 1.43 15.48 2.18 16.97L5.86 14.12Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.99 3.43 2.18 7.03L5.86 9.88C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            Initialize Session
          </button>
          
          <div className="flex flex-col gap-2">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Quantum-Secure Access</p>
            <div className="flex justify-center gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full flex bg-[#050505] text-slate-100 overflow-hidden font-sans">
      
      {/* ── SIDEBAR (Inspired by ChatGPT) ── */}
      <aside 
        className={`${sidebarOpen ? "w-[260px]" : "w-0"} transition-all duration-300 ease-in-out bg-[#0D0D0D] border-r border-white/5 flex flex-col relative z-30 group`}
      >
        {/* Toggle Button Inside */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#0D0D0D] border border-white/5 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors z-40 ${!sidebarOpen && "translate-x-3"}`}
        >
          <div className={`w-1 h-4 bg-slate-700 rounded-full ${sidebarOpen ? "rotate-0" : "rotate-0"}`}></div>
        </button>

        <div className={`flex-1 flex flex-col p-3 transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {/* New Chat Button */}
          <button 
            onClick={() => { setActiveTab("chat"); setActiveAgent(null); }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-white/5 transition-all mb-6 group/btn"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover/btn:bg-white/10">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-sm font-bold text-white italic">New Intelligence</span>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1 mb-8">
             <button 
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "chat" ? "bg-white/5 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Find Intel
             </button>
             <button 
                onClick={() => setActiveTab("agents")}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "agents" ? "bg-white/5 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.574.344" /></svg>
                Forge Hub
             </button>
          </nav>

          {/* Gems List (GPTs section) */}
          <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Active Gems</span>
            </div>
            <div className="space-y-0.5">
              {userAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => { setActiveAgent(agent); setActiveTab("chat"); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all group ${activeAgent?.id === agent.id ? "bg-blue-600/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{agent.avatar}</span>
                  <span className="text-xs font-bold truncate italic">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="pt-4 border-t border-white/5 mt-4">
             <div className="flex items-center justify-between px-2 group/user">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <img src={user.photoURL || ""} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0D0D0D] rounded-full"></div>
                   </div>
                   <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-white truncate italic">{user.displayName}</p>
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest truncate">Authorized Node</p>
                   </div>
                </div>
                <button onClick={logOut} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <section className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
        
        {/* Header (Top Bar) */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.03] bg-transparent relative z-20">
           <div className="flex items-center gap-4">
              {!sidebarOpen && (
                 <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                 </button>
              )}
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Core Systems</span>
                 <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-500/50 rounded-full"></div>
                    <div className="w-1 h-1 bg-emerald-500/50 rounded-full"></div>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              {user.email === "gfreyria@gmail.com" && (
                <a href="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Security Console
                </a>
              )}
              <div className="h-4 w-px bg-white/5"></div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{activeAgent ? activeAgent.name : "Neural Prime"}</span>
           </div>
        </header>

        {/* Content Render */}
        <div className="flex-1 relative flex flex-col items-center">
           {activeTab === "chat" ? (
             <div className="w-full h-full flex flex-col">
                {/* Greeting Area (Only when no messages) */}
                <div className="flex-1 flex flex-col">
                   <ChatInterface 
                      activeAgent={activeAgent} 
                      onBackToAgents={() => { setActiveTab("agents"); setActiveAgent(null); }}
                      fullScreen={true}
                   />
                </div>
             </div>
           ) : (
             <div className="w-full max-w-5xl p-8 overflow-y-auto custom-scrollbar">
                <AgentCreator onSelectAgent={(agent) => {
                   if (agent) {
                      setActiveAgent(agent);
                      setActiveTab("chat");
                   }
                }} />
             </div>
           )}
        </div>

        {/* Neural Overlay Decor */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10"></div>
      </section>
    </main>
  );
}
