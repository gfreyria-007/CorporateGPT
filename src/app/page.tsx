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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {!user ? (
        /* ── Login Card ── */
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6">
          {config.logoUrl && (
            <img src={config.logoUrl} alt="Logo" className="h-16 mx-auto object-contain mb-4" />
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{config.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{config.slogan}</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-[var(--color-primary)] text-white py-3 px-4 rounded-xl transition-opacity hover:opacity-90 font-medium shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="white"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.47 18.64 12 18.64C9.15 18.64 6.74 16.71 5.86 14.12H2.18V16.97C3.99 20.57 7.68 23 12 23Z" fill="white"/>
              <path d="M5.86 14.12C5.63 13.45 5.5 12.74 5.5 12C5.5 11.26 5.63 10.55 5.86 9.88V7.03H2.18C1.43 8.52 1 10.21 1 12C1 13.79 1.43 15.48 2.18 16.97L5.86 14.12Z" fill="white"/>
              <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.99 3.43 2.18 7.03L5.86 9.88C6.74 7.29 9.15 5.38 12 5.38Z" fill="white"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : (
        /* ── Dashboard ── */
        <div className="w-full flex flex-col items-center max-w-4xl space-y-6">

          {/* Top Bar */}
          <div className="w-full flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User Avatar"}
                  className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700"
                />
              )}
              <div className="text-left">
                <h2 className="text-sm font-semibold">{user.displayName}</h2>
                <div className="text-xs">
                  {user.email === "gfreyria@gmail.com" ? (
                    <span className="text-purple-600 dark:text-purple-400 font-medium">👑 Super Admin</span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Standard User</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user.email === "gfreyria@gmail.com" && (
                <a
                  href="/admin"
                  className="text-sm bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-90 shadow-sm"
                >
                  Admin
                </a>
              )}
              <button
                onClick={logOut}
                className="text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="w-full flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => { setActiveTab("chat"); setActiveAgent(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "chat" && !activeAgent ? "bg-[var(--color-primary)] text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => { setActiveTab("agents"); setActiveAgent(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "agents" || activeAgent ? "bg-[var(--color-primary)] text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              🤖 Gems (Agents)
            </button>
          </div>

          {/* Content Area */}
          {activeAgent ? (
            <ChatInterface
              activeAgent={activeAgent}
              onBackToAgents={() => setActiveAgent(null)}
            />
          ) : activeTab === "chat" ? (
            <ChatInterface />
          ) : (
            <AgentCreator onSelectAgent={(agent) => {
              if (agent) {
                setActiveAgent(agent);
              }
            }} />
          )}
        </div>
      )}
    </div>
  );
}
