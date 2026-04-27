"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCompany } from "@/components/providers/CompanyProvider";
import ChatInterface from "@/components/ChatInterface";
import AgentCreator from "@/components/AgentCreator";
import type { Agent } from "@/types/agent";

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, logOut } = useAuth();
  const { config, loading: configLoading } = useCompany();
  const [activeTab, setActiveTab] = useState<"chat" | "agents">("chat");
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);

  if (authLoading || configLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase animate-pulse">Initializing Lab</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {!user ? (
        /* ── Login Card ── */
        <div className="mt-20 max-w-md w-full glass-card rounded-3xl overflow-hidden p-10 text-center space-y-8 animate-fade-in relative z-10">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="h-20 mx-auto object-contain drop-shadow-2xl" />
          ) : (
            <div className="w-16 h-16 premium-gradient rounded-2xl mx-auto flex items-center justify-center shadow-2xl rotate-3">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          )}
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
              {config.name}
            </h1>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">{config.slogan}</p>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <button
            onClick={signInWithGoogle}
            className="group w-full flex items-center justify-center gap-3 bg-white text-slate-950 py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] font-bold shadow-xl hover:shadow-white/10"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-12" viewBox="0 0 24 24">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.47 18.64 12 18.64C9.15 18.64 6.74 16.71 5.86 14.12H2.18V16.97C3.99 20.57 7.68 23 12 23Z" fill="#34A853"/>
              <path d="M5.86 14.12C5.63 13.45 5.5 12.74 5.5 12C5.5 11.26 5.63 10.55 5.86 9.88V7.03H2.18C1.43 8.52 1 10.21 1 12C1 13.79 1.43 15.48 2.18 16.97L5.86 14.12Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.99 3.43 2.18 7.03L5.86 9.88C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            Sign in with Workspace
          </button>
          
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Secure SSO</p>
        </div>
      ) : (
        /* ── Dashboard ── */
        <div className="w-full flex flex-col items-center max-w-5xl space-y-8 animate-fade-in z-10">
          
          {/* Top Navigation Bar */}
          <div className="w-full flex justify-between items-center glass-card px-6 py-4 rounded-2xl transition-all hover:border-white/20">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-xl border border-white/10 shadow-lg" />
                ) : (
                  <div className="w-12 h-12 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center font-bold text-lg">{user.displayName?.charAt(0)}</div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold tracking-tight">{user.displayName}</h2>
                <div className="flex items-center gap-2">
                   {user.email === "gfreyria@gmail.com" ? (
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-black uppercase tracking-tighter">Super Admin</span>
                  ) : (
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-black uppercase tracking-tighter">Standard</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user.email === "gfreyria@gmail.com" && (
                <a
                  href="/admin"
                  className="hidden md:flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl border border-white/10 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  Admin Panel
                </a>
              )}
              <button
                onClick={logOut}
                className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all active:scale-95"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>

          {/* Sub-Header / Slogan */}
          <div className="w-full text-center space-y-2">
             <h1 className="text-2xl font-bold text-slate-400">Welcome back, <span className="text-white italic">{user.displayName?.split(' ')[0]}</span>.</h1>
             <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold">Secure Corporate Intelligence</p>
          </div>

          {/* Tab System */}
          <div className="w-full grid grid-cols-2 gap-4 p-1.5 glass-card rounded-2xl relative overflow-hidden">
            <button
              onClick={() => { setActiveTab("chat"); setActiveAgent(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "chat" && !activeAgent ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Neural Chat
            </button>
            <button
              onClick={() => { setActiveTab("agents"); setActiveAgent(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "agents" || activeAgent ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.574.344l-2.387-.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 00-.547 1.022l-.477 2.387a6 6 0 00.517 3.86l.337.673a4 4 0 01.344 2.574l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022-.547l2.387-.477a6 6 0 003.86-.517l.673-.337a4 4 0 012.574-.344l2.387.477a2 2 0 001.022-.547l1.428-1.428a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.337-.673a4 4 0 01-.344-2.574l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z" /></svg>
              Expert Gems
            </button>
          </div>

          {/* Render Area */}
          <div className="w-full transform transition-all duration-500 ease-out">
            {activeAgent ? (
              <ChatInterface
                activeAgent={activeAgent}
                onBackToAgents={() => setActiveAgent(null)}
              />
            ) : activeTab === "chat" ? (
              <ChatInterface />
            ) : (
              <AgentCreator onSelectAgent={(agent) => {
                if (agent) setActiveAgent(agent);
              }} />
            )}
          </div>

          {/* Footer Branding */}
          <footer className="py-10 text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-4">
            <span>Corporate GPT</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <span>v1.2.0-STABLE</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <span>End-to-End Encrypted</span>
          </footer>
        </div>
      )}
    </main>
  );
}
