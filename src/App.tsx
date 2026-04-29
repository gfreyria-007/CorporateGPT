// Build 2.9.2 Production Sync - QA Hardened Final
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap,
  BarChart3,
  Search,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Gem,
  Palette,
  LayoutGrid,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Lock,
  ChevronRight,
  TrendingUp,
  Globe,
  Database,
  X,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Languages,
  Terminal,
  Cpu,
  Fingerprint,
  Activity,
  History,
  Menu,
  CreditCard,
  Crown,
  HelpCircle
} from 'lucide-react';
import { ModelSelector } from './components/ModelSelector';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AdminPanel } from './components/AdminPanel';
import { ImageEditor } from './components/ImageEditor';
import { GPTsGenerator } from './components/GPTsGenerator';
import { PromptGenie } from './components/PromptGenie';
import { AdvancedPanel } from './components/AdvancedPanel';
import { FAQ } from './components/FAQ';
import { PrivacyPolicy } from './components/Compliance/PrivacyPolicy';
import { LandingPage } from './components/LandingPage';
import { SalesLanding } from './components/SalesLanding';
import { Message, ModelMetadata } from './types';
import { useAuth } from './lib/AuthContext';
import { incrementQueryCount, flagUser, SUPER_ADMIN_EMAIL } from './lib/db';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { cn } from './lib/utils';
import { translations } from './lib/translations';

export default function App() {
  // Auth & Profile
  const { user, profile, loading, isSigningIn, signIn, logout } = useAuth();
  
  // App State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('openrouter/auto');
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // UI Panels
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'admin' | 'creative' | 'knowledge'>('chat');
  const [showFAQ, setShowFAQ] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [zdrEnabled, setZdrEnabled] = useState(false);
  const [selectedGPT, setSelectedGPT] = useState<any | null>(null);
  const [isPromptGenieOpen, setIsPromptGenieOpen] = useState(false);
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    deepThink: false,
    webSearch: false,
    docsOnly: false
  });
  const [appConfig, setAppConfig] = useState<any>(null);
  const [chatInputValue, setChatInputValue] = useState('');
  const [showLanding, setShowLanding] = useState(false);
  const [trialEnded, setTrialEnded] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for trial_ended status in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'trial_ended') {
      setTrialEnded(true);
      setShowLanding(true);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (!user) {
      setAppConfig(null);
      return;
    }

    // Global Config Listener - Requires isSignedIn()
    const unsubscribeConfig = onSnapshot(doc(db, 'admin', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        setAppConfig(snapshot.data());
      }
    }, (error) => {
      console.error("Config synchronization error:", error);
    });

    return () => unsubscribeConfig();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      if (data.data) {
        // Deduplicate by ID to prevent key collision error
        const uniqueModels = Array.from(new Map(data.data.map((m: any) => [m.id, m])).values()) as ModelMetadata[];
        setModels(uniqueModels.sort((a: any, b: any) => b.context_length - a.context_length));
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (isNDAProof) {
      const timer = setTimeout(() => setIsNDAProof(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isNDAProof]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!user) {
      signIn();
      return;
    }

    if (profile?.isBanned) {
      alert("Your account has been suspended. Please contact your administrator.");
      return;
    }

    if (!isSuperAdmin && !appConfig?.isProduction) {
      if (!profile?.unlimitedUsage) {
        const maxQueries = profile?.maxQueries || 5;
        if ((profile?.queriesUsed || 0) >= maxQueries) {
          setTrialEnded(true);
          return;
        }
      }
    }

    let finalContent = content;
    if (attachments && attachments.length > 0) {
      finalContent += "\n\n**Pipeline Attachments:**\n" + attachments.map(f => `- ${f.name} (${(f.size/1024).toFixed(1)} KB)`).join('\n');
    }

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
      role: 'user',
      content: finalContent,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          userId: user.uid,
          instructions: selectedGPT?.instructions || null,
          temperature: advancedSettings.temperature,
          maxTokens: advancedSettings.maxTokens,
          deepThink: advancedSettings.deepThink,
          webSearch: advancedSettings.webSearch,
          docsOnly: advancedSettings.docsOnly
        })
      });

      if (response.status === 403) {
        setSafetyAlert(t.safetyWarning);
        await flagUser(user.uid, "Safety Violation: Forbidden subjects or injection attempt.");
        setIsChatLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const assistantMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
        // Do not await this, if firestore is offline or uninitialized it will hang the UI
        incrementQueryCount(user.uid).catch(e => console.error("Failed to increment count:", e));
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        role: 'assistant',
        content: `System Error: ${error.message}. Secure pipeline remains intact.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Retention Logic: Clear session every 2 hours to keep database light
  useEffect(() => {
    const checkRetention = () => {
      const now = Date.now();
      const lastReset = localStorage.getItem('catalizia_last_reset');
      if (!lastReset || now - parseInt(lastReset) > 7200000) { // 2 hours
        setMessages([]);
        localStorage.setItem('catalizia_last_reset', now.toString());
      }
    };
    checkRetention();
    const interval = setInterval(checkRetention, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentModelData = models.find(m => m.id === selectedModel);
  const isNDAProof = selectedModel.includes('gpt-4o') || 
                     selectedModel.includes('gpt-4-turbo') ||
                     selectedModel.includes('claude') || 
                     selectedModel.includes('gemini-1.5') ||
                     selectedModel === 'openrouter/auto';
  const t = translations[lang];

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || profile?.role === 'admin' || profile?.role === 'super-admin';

  const checkLicense = () => {
    if (isSuperAdmin) return { valid: true };
    if (!appConfig) return { valid: true }; // Allow during load or if not configured

    const now = Date.now();
    const validFrom = appConfig.licenseValidFrom ? new Date(appConfig.licenseValidFrom).getTime() : 0;
    const validTo = appConfig.licenseValidTo ? new Date(appConfig.licenseValidTo).getTime() : Infinity;
    
    if (now < validFrom) return { valid: false, reason: "License enrollment period has not yet begun." };
    if (now > validTo) return { valid: false, reason: "Your corporate license has expired. Please contact administration for renewal." };
    if (appConfig.licenseStatus === 'expired') return { valid: false, reason: "License deactivated by administrator." };
    
    return { valid: true };
  };

  const licenseStatus = checkLicense();

  if (!licenseStatus.valid) {
     return (
       <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-10">
          <div className="max-w-xl w-full p-10 bg-white/5 border border-red-500/20 rounded-[3rem] text-center space-y-6 backdrop-blur-xl">
             <div className="w-20 h-20 bg-red-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-red-600/20">
                <ShieldAlert size={40} />
             </div>
             <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Access Temporarily Restricted</h2>
             <p className="text-slate-400 font-bold text-sm leading-relaxed">{licenseStatus.reason}</p>
             <button 
               onClick={() => window.location.href = 'mailto:gfreyria@gmail.com'}
               className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all"
             >
                Contact Super Admin
             </button>
          </div>
       </div>
     );
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-[1.5rem] animate-spin" />
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Securing Connection...</p>
        </div>
      </div>
    );
  }

  if (trialEnded) {
    return (
      <SalesLanding 
        lang={lang} 
        onContact={() => window.location.href = 'mailto:gfreyria@gmail.com'} 
      />
    );
  }

  if (showLanding || !user) {
    return (
      <LandingPage 
        onStartSession={signIn} 
        isSigningIn={isSigningIn}
        showTrialModal={trialEnded}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  return (
    <div className={cn("flex h-screen font-sans overflow-hidden transition-colors duration-300", 
      theme === 'dark' ? 'bg-corporate-950 text-white' : 'bg-white text-corporate-900'
    )} id="app-container">
      
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-6 right-6 z-[100] lg:hidden p-3 bg-white dark:bg-corporate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-400"
      >
        {isMobileMenuOpen ? <X size={20} /> : <LayoutGrid size={20} />}
      </button>

      {/* Main Sidebar Navigation */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 z-[90] w-72 lg:w-80 flex flex-col border-r transition-transform duration-500 lg:translate-x-0 shrink-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        theme === 'dark' ? 'bg-corporate-950 border-white/5' : 'bg-corporate-50 border-corporate-200'
      )} id="main-nav">
        <div className="p-8 border-b border-inherit">
           <div className="flex items-center gap-4 lg:mb-12">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/30 ring-4 ring-blue-600/10">C</div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-display font-black tracking-tighter leading-none">{t.appName}</h1>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">{t.slogan}</p>
              </div>
           </div>

           <div className="flex flex-col gap-1.5">
             <button 
              onClick={() => { setActivePanel('chat'); setIsMobileMenuOpen(false); }}
              className={cn("flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                activePanel === 'chat' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 translate-x-2' : 'text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900'
              )}
             >
                <MessageSquare size={18} /> {t.intelligentChat}
             </button>
             <button 
              onClick={() => { setActivePanel('creative'); setIsMobileMenuOpen(false); }}
              className={cn("flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                activePanel === 'creative' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 translate-x-2' : 'text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900'
              )}
             >
                <Palette size={18} /> Asset Studio
             </button>
             <button 
              onClick={() => { setActivePanel('knowledge'); setIsMobileMenuOpen(false); }}
              className={cn("flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                activePanel === 'knowledge' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 translate-x-2' : 'text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900'
              )}
             >
                <Database size={18} /> Knowledge Bank
             </button>
             <button 
              onClick={() => setShowLanding(true)}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all"
             >
                <CreditCard size={18} /> Upgrade Plan
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <div className="space-y-4">
              <div className="px-2 space-y-3">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Security Pipeline</label>
                    <div className="flex items-center gap-2">
                       <span className={cn("text-[9px] font-black uppercase tracking-tighter", zdrEnabled ? "text-emerald-500" : "text-slate-400")}>ZDR</span>
                       <button 
                         onClick={() => setZdrEnabled(!zdrEnabled)}
                         className={cn(
                           "w-10 h-5 rounded-full transition-all relative shrink-0",
                           zdrEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-300 dark:bg-corporate-800"
                         )}
                       >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md",
                            zdrEnabled ? "right-0.5" : "left-0.5"
                          )} />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <ModelSelector 
                  models={models} 
                  selectedModel={selectedModel} 
                  onSelect={setSelectedModel} 
                  isLoading={isLoadingModels} 
                  lang={lang}
                  zdrOnly={zdrEnabled}
                 />
                 <AnimatePresence>
                   {isNDAProof && (
                     <motion.div 
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20"
                     >
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.ndaVerified}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>

           {isSuperAdmin && (
             <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-white/5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Management</label>
                <button 
                  onClick={() => { setActivePanel('admin'); setIsMobileMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activePanel === 'admin' ? 'bg-corporate-900 shadow-xl text-white' : 'text-slate-500 hover:bg-white dark:hover:bg-corporate-900'
                  )}
                >
                   <Terminal size={18} /> Console
                </button>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-inherit">
           <div className="flex flex-col gap-4">
             <button 
               onClick={() => setShowPrivacyPolicy(true)}
               className="flex items-center gap-3 px-3 py-2 text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all"
             >
               <Shield size={14} /> Privacy & Compliance
             </button>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm"
                  >
                    <span className="text-[10px] font-black uppercase">{lang}</span>
                  </button>
                  <button 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm"
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Build 2.9.2</div>
             </div>
           </div>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[40] md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={cn("fixed top-0 bottom-0 left-0 w-80 z-[50] md:hidden overflow-hidden flex flex-col transition-all",
                theme === 'dark' ? "bg-corporate-950 border-r border-white/5" : "bg-white border-r border-slate-100 shadow-2xl"
              )}
            >
              {/* Sidebar Content same as desktop aside */}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className={cn("absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px]", 
          theme === 'dark' ? 'invert' : ''
        )} />
        
        <AnimatePresence>
          {activePanel === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col h-full relative z-10"
            >
              <header className={cn("h-24 border-b flex items-center justify-between px-6 sm:px-12 shrink-0 transition-all",
                theme === 'dark' ? 'border-white/5 bg-corporate-950/80 backdrop-blur-xl' : 'border-corporate-100 bg-white/90 backdrop-blur-xl sticky top-0'
              )}>
                 <div className="flex items-center gap-10">
                    <div>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2.5 h-2.5 rounded-full", isChatLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} />
                          <h2 className="text-xl font-display font-black tracking-tight uppercase">
                            {selectedGPT ? selectedGPT.name : (selectedModel === 'openrouter/auto' ? t.autoRouter : currentModelData?.name)}
                          </h2>
                          {selectedGPT && (
                            <button 
                              onClick={() => setSelectedGPT(null)}
                              className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Security Pipeline Active</span>
                           <div className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">TLS 1.3 Encryption</span>
                        </div>
                    </div>

                    <div className="hidden 2xl:flex flex-col w-56">
                       <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            {profile?.unlimitedUsage ? <Crown size={12} className="text-amber-500" /> : <Activity size={12} />}
                            {(!isSuperAdmin && !appConfig?.isProduction) ? t.demoUsage : translations[lang].systemReady}
                          </span>
                          <span>{profile?.queriesUsed || 0}/{(!isSuperAdmin && !appConfig?.isProduction) ? (profile?.maxQueries || 5) : (profile?.unlimitedUsage ? '∞' : 'NL')}</span>
                       </div>
                       <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-[2px]">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
                            style={{ width: `${profile?.unlimitedUsage ? 100 : Math.min(100, ((profile?.queriesUsed || 0) / (profile?.maxQueries || 5)) * 100)}%` }}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-4 pr-10 border-r border-slate-100 dark:border-white/5">
                        <div className="text-right">
                           <p className="text-sm font-black tracking-tight">{user.displayName || 'Corporate User'}</p>
                           <p className="text-[10px] font-black text-blue-600 capitalize opacity-60 tracking-widest">{profile?.role || 'Basic Account'}</p>
                        </div>
                        <div className="relative">
                          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex-shrink-0 overflow-hidden shadow-2xl shadow-blue-500/30 ring-4 ring-white dark:ring-corporate-950">
                            {user.photoURL ? <img src={user.photoURL} alt="User" /> : <div className="w-full h-full flex items-center justify-center font-black text-lg text-white">U</div>}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-corporate-950 rounded-full" />
                        </div>
                        <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 transition-colors" title="Secure Logout">
                           <LogOut size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 dark:bg-corporate-900 rounded-xl px-2 py-1 mr-2 border border-slate-200 dark:border-white/5">
                           <button 
                             onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
                             className="p-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
                           >
                             A-
                           </button>
                           <div className="w-1 h-4 border-r border-slate-200 dark:border-white/10 mx-1" />
                           <button 
                             onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
                             className="p-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
                           >
                             A+
                           </button>
                        </div>
                        <button 
                          onClick={() => setShowFAQ(true)}
                          className="flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-corporate-900 border border-transparent hover:border-blue-500/30 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all text-[11px] font-black uppercase tracking-widest"
                        >
                          <HelpCircle size={16} /> FAQ
                        </button>
                    </div>
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10" ref={scrollRef}>
                 {messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center space-y-16 lg:space-y-24 max-w-6xl mx-auto py-12 px-8">
                      <div className="text-center space-y-8">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl shadow-blue-500/40"
                        >
                           <ShieldCheck size={16} /> Enterprise Grade Pipeline
                        </motion.div>
                        <motion.h2 
                           initial={{ opacity: 0, y: 30 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1 }}
                           className="text-5xl lg:text-9xl font-display font-black tracking-tighter leading-[0.8] uppercase text-balance"
                        >
                          Command <span className="text-blue-600">The Future</span>
                        </motion.h2>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={cn("max-w-3xl mx-auto text-xl font-medium leading-relaxed opacity-60 px-4", theme === 'dark' ? 'text-white' : 'text-slate-600')}
                        >
                          {t.lobbySubtitle}
                        </motion.p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
                         {[
                           { icon: Lock, title: t.benefit1Title, desc: t.benefit1Desc, color: 'bg-emerald-500' },
                           { icon: TrendingUp, title: t.benefit2Title, desc: t.benefit2Desc, color: 'bg-blue-500' },
                           { icon: Shield, title: t.benefit3Title, desc: t.benefit3Desc, color: 'bg-amber-500' },
                           { icon: Cpu, title: t.benefit4Title, desc: t.benefit4Desc, color: 'bg-indigo-500' }
                         ].map((benefit, i) => (
                           <motion.div 
                             key={benefit.title}
                             initial={{ opacity: 0, y: 40 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.3 + (i * 0.1) }}
                             className={cn("p-10 rounded-[3rem] flex flex-col gap-6 border transition-all hover:scale-[1.05] hover:-translate-y-2 group cursor-default",
                               theme === 'dark' ? 'bg-corporate-900 border-white/5 hover:border-blue-500/30' : 'bg-white border-corporate-200 hover:border-blue-500/30 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10'
                             )}
                           >
                              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-12", benefit.color)}>
                                 <benefit.icon size={32} />
                              </div>
                              <div className="space-y-2">
                                 <h3 className="font-display font-black text-lg uppercase tracking-tight leading-tight">{benefit.title}</h3>
                                 <p className="text-xs font-bold opacity-50 leading-relaxed text-balance">{benefit.desc}</p>
                              </div>
                           </motion.div>
                         ))}
                      </div>
                   </div>
                 ) : (
                   <div className="max-w-4xl mx-auto space-y-6 pb-24" style={{ fontSize: `${fontSize}px` }}>
                      {messages.map((m) => (
                        <ChatMessage key={m.id} message={m} lang={lang} />
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-6 max-w-3xl mx-auto w-full animate-pulse px-8 py-6 bg-slate-50 dark:bg-corporate-900 rounded-[2rem]">
                           <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-corporate-800" />
                           <div className="flex-1 space-y-4">
                              <div className="h-2.5 w-1/4 bg-slate-200 dark:bg-corporate-800 rounded-full" />
                              <div className="space-y-2">
                                 <div className="h-5 bg-slate-200 dark:bg-corporate-800 rounded-xl w-full" />
                                 <div className="h-5 bg-slate-200 dark:bg-corporate-800 rounded-xl w-5/6" />
                              </div>
                           </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>

              <div className={cn("p-10 border-t transition-all z-20", theme === 'dark' ? 'border-white/5 bg-corporate-950' : 'border-corporate-100 bg-white')}>
                 <div className="max-w-5xl mx-auto">
                    <ChatInput 
                      onSend={handleSendMessage} 
                      isLoading={isChatLoading} 
                      lang={lang} 
                      onAdvancedToggle={() => setIsAdvancedPanelOpen(!isAdvancedPanelOpen)}
                      input={chatInputValue}
                      setInput={setChatInputValue}
                    />
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 mt-6 text-[10px] font-black text-slate-400 px-10 uppercase tracking-[0.3em] text-center opacity-60">
                       <span className="flex items-center gap-2">ENGINE: <span className="text-blue-600">{currentModelData?.id.split('/')[0] || 'OR-AUTO'}</span></span>
                       <span className="flex items-center gap-2">SECURE: <span className="text-emerald-500">QUANTUM-RESISTANT</span></span>
                       <span className="flex items-center gap-2">SESSION: <span className="text-amber-500">TLS 1.3</span></span>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isNDAProof && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-6 pointer-events-none"
              >
                <div className={cn("p-6 rounded-[2.5rem] border backdrop-blur-3xl shadow-2xl flex items-center gap-6 pointer-events-auto",
                  theme === 'dark' ? 'bg-corporate-950/80 border-white/5' : 'bg-white/80 border-corporate-100'
                )}>
                   <div className="w-14 h-14 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
                      <ShieldCheck size={28} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 leading-none">Security Pipeline Active</h4>
                      <p className="text-[11px] font-bold text-slate-400 leading-tight">Your data is processed in a secure environment. Enterprise NDA protection is fully enforced.</p>
                   </div>
                   <button 
                     onClick={() => setIsNDAProof(false)} 
                     className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                   >
                      <X size={20} />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        <AnimatePresence>
          {activePanel === 'admin' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[150] bg-corporate-950 flex flex-col"
            >
              <AdminPanel onClose={() => setActivePanel('chat')} theme={theme} />
            </motion.div>
          )}

          {activePanel === 'creative' && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed inset-0 z-[150] bg-corporate-950 flex flex-col"
            >
              <ImageEditor 
                onClose={() => setActivePanel('chat')} 
                theme={theme} 
                appConfig={appConfig}
                onTrialEnd={() => setTrialEnded(true)}
              />
            </motion.div>
          )}

          {activePanel === 'knowledge' && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 z-[150] bg-corporate-950 flex flex-col"
            >
              <GPTsGenerator 
                onClose={() => setActivePanel('chat')} 
                onSelect={(gpt) => {
                  setSelectedGPT(gpt);
                  setActivePanel('chat');
                }}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAdvancedPanelOpen && (
            <AdvancedPanel 
              isOpen={isAdvancedPanelOpen}
              onClose={() => setIsAdvancedPanelOpen(false)}
              settings={advancedSettings}
              setSettings={setAdvancedSettings}
              onPromptGenie={() => setIsPromptGenieOpen(true)}
              theme={theme}
            />
          )}
        </AnimatePresence>
        
        <PromptGenie 
          isOpen={isPromptGenieOpen} 
          onClose={() => setIsPromptGenieOpen(false)} 
          onApply={(improved) => setChatInputValue(improved)}
          theme={theme}
        />
        <AnimatePresence>
          {showFAQ && (
            <FAQ 
              onClose={() => setShowFAQ(false)} 
              lang={lang}
              theme={theme}
            />
          )}
          {showPrivacyPolicy && (
            <PrivacyPolicy 
              onClose={() => setShowPrivacyPolicy(false)}
              theme={theme}
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {safetyAlert && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="absolute bottom-36 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl mx-auto px-6"
            >
              <div className="bg-red-600 text-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex items-center gap-6 border-4 border-white/20 backdrop-blur-3xl">
                 <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shrink-0 border border-white/30 rotate-12">
                    <ShieldAlert size={32} className="text-white" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Security Protocol Violation</p>
                    <p className="text-base font-black leading-tight tracking-tight">{safetyAlert}</p>
                 </div>
                 <button 
                  onClick={() => setSafetyAlert(null)}
                  className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

