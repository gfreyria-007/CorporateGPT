// Build 6.5.2 Production Release - [2026-04-29T22:56:00]
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Presentation,
  Languages,
  Terminal,
  Cpu,
  Fingerprint,
  Activity,
  History,
  Users,
  CreditCard,
  Crown,
  HelpCircle,
  RefreshCw,
  Menu
} from 'lucide-react';
import { ModelSelector } from './components/ModelSelector';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AdminPanel } from './components/AdminPanel';
import { ImageEditor } from './components/ImageEditor';
import PPTStudio from './components/PPTStudio';
import { GPTsGenerator } from './components/GPTsGenerator';
import { MobileWorkspace } from './components/MobileWorkspace';
import { PromptGenie } from './components/PromptGenie';
import { CompanyPanel } from './components/CompanyPanel';
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
import { failsafeChat } from './lib/failsafeRouter';
import { useVersionGatekeeper } from './lib/useVersionGatekeeper';
import { useQuota } from './lib/useQuota';
import { EcoModeBanner } from './components/EcoModeBanner';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { UpgradePlanPage } from './components/UpgradePlanPage';
import { TechieWorkspace } from './components/TechieWorkspace';
import { translations } from './lib/translations';
import { canAccessTechie } from './lib/permissions';

export default function App() {
  // Auth & Profile
  const { user, profile, loading, isSigningIn, signIn, signInWithApple, signInWithEmail, logout } = useAuth();
  
  // Detect browser language
  const getBrowserLang = (): 'en' | 'es' => {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language || (navigator as any).userLanguage || 'es';
      return browserLang.startsWith('es') ? 'es' : 'en';
    }
    return 'es';
  };
  
  // App State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'en' | 'es'>(getBrowserLang());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('openrouter/auto');
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // UI Panels


  const [activePanel, setActivePanel] = useState<'chat' | 'admin' | 'creative' | 'knowledge' | 'ppt' | 'team'>('chat');
  const [showFAQ, setShowFAQ] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [dataProtectionEnabled, setDataProtectionEnabled] = useState(false);
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
  const [showUpgradePlan, setShowUpgradePlan] = useState(false);
  const [trialEnded, setTrialEnded] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [appMode, setAppMode] = useState<'corporate' | 'junior'>('corporate');

  // Permissions block removed to allow free switching between apps
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || profile?.role === 'admin' || profile?.role === 'super-admin' || (profile as any)?.role === 'owner';

  // V2 Version Gatekeeper — reads appVersion from company tenant
  const { appVersion, engineStatus, setEngineStatus } = useVersionGatekeeper(
    (profile as any)?.companyId ?? null
  );

  // V2 Quota Engine — daily tokens + multimedia credits + eco mode
  const resolveTier = () => {
    const plan = profile?.plan;
    if (plan === 'Family Mega') return 'family_mega';
    if (plan === 'Professional') return 'professional';
    if (plan === 'Starter' || plan === 'Family Starter') return 'starter';
    return (profile as any)?.companyTier ?? 'trial';
  };

  const { quota, ecoModeActive, tokenPercent, multimediaRemaining, deductTokens } = useQuota(
    user?.uid,
    resolveTier()
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // URL Params Handling
    const params = new URLSearchParams(window.location.search);
    
    // 1. Trial Status
    if (params.get('status') === 'trial_ended') {
      setTrialEnded(true);
      setShowLanding(true);
    }

    // 2. Upgrade Flow
    if (params.get('upgrade') === 'true') {
      setShowUpgradePlan(true);
    }

    // 3. App Mode Detection (URL Param takes priority over Subdomain)
    const modeParam = params.get('mode');
    const hostname = window.location.hostname.toLowerCase();
    
    if (modeParam === 'junior' || modeParam === 'techie') {
      setAppMode('junior');
    } else if (modeParam === 'corporate') {
      setAppMode('corporate');
    } else if (hostname.startsWith('techie') || hostname.startsWith('junior') || hostname.includes('techie.catalizia.com')) {
      setAppMode('junior');
    } else {
      setAppMode('corporate');
    }

    fetchModels();
  }, []);

  useEffect(() => {
    if (!user) {
      setAppConfig(null);
      return;
    }

    const unsubscribeConfig = onSnapshot(doc(db, 'admin', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        setAppConfig(snapshot.data());
      }
    }, (error) => {
      console.error("Config synchronization error:", error);
    });

    return () => unsubscribeConfig();
  }, [user]);

  // Enforce Trial Limits (24 Hours OR Quota Exhausted)
  useEffect(() => {
    if (profile && !profile.unlimitedUsage && !appConfig?.isProduction) {
      const maxQueries = profile.maxQueries || 10;
      const maxImages = profile.maxImages || 10;
      
      const createdAt = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date();
      const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

      if ((profile.queriesUsed || 0) >= maxQueries || (profile.imagesUsed || 0) >= maxImages || hoursSinceCreation >= 24) {
        setTrialEnded(true);
      }
    }
  }, [profile, appConfig?.isProduction]);

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
        const uniqueModels = Array.from(new Map(data.data.map((m: any) => [m.id, m])).values()) as ModelMetadata[];
        setModels(uniqueModels.sort((a: any, b: any) => b.context_length - a.context_length));
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSendMessage = async (content: string = chatInputValue, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;
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
        const maxQueries = profile?.maxQueries || 10;
        const createdAt = profile?.createdAt?.toDate ? profile.createdAt.toDate() : new Date();
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

        if ((profile?.queriesUsed || 0) >= maxQueries || hoursSinceCreation >= 24) {
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
    setChatInputValue('');
    setIsChatLoading(true);
    try {
      const fileContext = selectedGPT?.files
        ?.filter((f: any) => f.content)
        ?.map((f: any) => `--- ${f.name} ---\n${f.content}`)
        ?.join('\n\n');

      let juniorContext = "";
      if (appMode === 'junior') {
        juniorContext = "\n\n[PERSONA: JUNIOR TUTOR]\nActúa como un tutor educativo amigable, paciente y alentador para niños. Utiliza lenguaje sencillo, ejemplos creativos y evita temas complejos o inapropiados para menores. Fomenta la curiosidad y explica conceptos paso a paso.";
      }
      
      const fullInstructions = [selectedGPT?.instructions, fileContext, juniorContext]
        .filter(Boolean)
        .join('\n\n[KNOWLEDGE_BASE_ATTACHMENT]\n');

      // ─── Gateway of Immortality ───────────────────────────────────────────
      // Routes through failsafeRouter: primary (6s timeout) → Gemini 1.5 Flash
      let result;
      try {
        const idToken = await user.getIdToken();
        result = await failsafeChat({
          model: selectedModel,
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          userId: user.uid,
          idToken: idToken,
          instructions: fullInstructions || null,
          temperature: advancedSettings.temperature,
          maxTokens: advancedSettings.maxTokens,
          deepThink: advancedSettings.deepThink,
          webSearch: advancedSettings.webSearch,
          docsOnly: advancedSettings.docsOnly,
          ecoMode: ecoModeActive,             // V2: server enforces eco model
        } as any);

        // Track engine health for Super Admin diagnostics
        setEngineStatus(result.usedFallback ? 'fallback' : 'primary', result.fallbackReason);

        // Show tier notification as a system message
        if (result.notification) {
          setMessages(prev => [...prev, {
            id: `tier-${Date.now()}`,
            role: 'system' as const,
            content: `🛡️ ${result.notification}`,
            timestamp: Date.now(),
          }]);
        }
      } catch (routerErr: any) {
        // 403 safety violations bubble up cleanly
        if (routerErr.status === 403) {
          setSafetyAlert(t.safetyWarning);
          await flagUser(user.uid, "Safety Violation: Forbidden subjects or injection attempt.");
          setIsChatLoading(false);
          return;
        }
        throw routerErr;
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        role: 'assistant',
        content: result.content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
      // Quota is now deducted server-side in api/chat.ts for accurate counting
      incrementQueryCount(user.uid).catch(e => console.error("Failed to increment count:", e));

    } catch (error: any) {
      console.error('[Chat] Error:', error.message);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        role: 'assistant',
        content: 'Conexión momentary lenta. Intenta de nuevo en segundos.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const t = translations[lang || 'es'];

  const currentModelData = models.find(m => m.id === selectedModel);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
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
    const isLandingSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || profile?.role === 'super-admin';
    return (
      <LandingPage 
        onStartSession={signIn} 
        onSignInWithApple={signInWithApple}
        onSignInWithEmail={signInWithEmail}
        isSigningIn={isSigningIn}
        showTrialModal={trialEnded}
        lang={lang}
        setLang={setLang}
        appConfig={appConfig}
        appMode={appMode}
        isSuperAdmin={isLandingSuperAdmin}
      />
    );
  }

  // MOBILE ROUTER
  if (isMobile) {
    return (
      <MobileWorkspace 
        theme={theme}
        lang={lang}
        user={user}
        profile={profile}
        onOpenPanel={setActivePanel}
        activePanel={activePanel}
        messages={messages}
        isChatLoading={isChatLoading}
        onSendMessage={handleSendMessage}
        chatInputValue={chatInputValue}
        setChatInputValue={setChatInputValue}
        t={t}
        appConfig={appConfig}
        setTrialEnded={setTrialEnded}
        selectedGPT={selectedGPT}
        setSelectedGPT={setSelectedGPT}
        quota={quota}
        ecoModeActive={ecoModeActive}
        tokenPercent={tokenPercent}
        multimediaRemaining={multimediaRemaining}
        isSuperAdmin={isSuperAdmin}
        appMode={appMode}
      />
    );
  }

  // DESKTOP LAYOUT
  return (
    <div className={cn("h-screen w-screen flex overflow-hidden font-sans transition-colors duration-500",
      theme === 'dark' ? 'bg-corporate-950 text-white' : 'bg-white text-corporate-900'
    )} id="app-container">
      
      {/* Sidebar - Desktop only */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className={cn("border-r flex flex-col shrink-0 z-50",
              theme === 'dark' ? 'bg-corporate-950 border-white/5 shadow-2xl' : 'bg-white/80 backdrop-blur-3xl border-slate-100 shadow-[20px_0_40px_rgba(0,0,0,0.02)]'
            )}
          >
            <div className="p-8 border-b border-inherit">
               <div className="flex items-center gap-4 mb-12">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/30 ring-4 ring-blue-600/10"
                  >
                    {appConfig?.appLogoText || 'C'}
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-display font-black tracking-tighter leading-none uppercase text-slate-900">
                      {appMode === 'junior' ? 'Techie Tutor' : (appConfig?.appName || t.appName)}
                    </h1>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
                      {appMode === 'junior' ? 'Potenciando mentes brillantes' : 'Inteligencia que Empodera'}
                    </p>
                  </div>
               </div>

               <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                  hidden: { transition: { staggerChildren: 0.05 } }
                }}
                className="flex flex-col gap-1.5"
               >
                  {/* Persona Switcher - Only show if user has both permissions */}
                  {((profile as any)?.permissions?.junior === true && (profile as any)?.permissions?.corporate !== false) && (
                    <motion.div 
                     variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                     className="mb-6 p-1.5 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex gap-1.5 border border-corporate-200 dark:border-white/10 shadow-inner"
                    >
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => setAppMode('corporate')}
                         className={cn("flex-1 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                           appMode === 'corporate' 
                             ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                             : "text-slate-500 hover:text-blue-600"
                         )}
                       >
                         <Shield size={14} /> Corporate
                       </motion.button>
<motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (!canAccessTechie(profile as any)) {
                              alert('Techie Tutor está disponible para planes Family Starter y Family Mega. ¡Upgrade tu plan para acceder!');
                              return;
                            }
                            setAppMode('junior');
                          }}
                          className={cn("flex-1 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                            appMode === 'junior' 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                              : "text-slate-500 hover:text-emerald-500"
                          )}
                        >
                          <Zap size={14} /> Techie
                        </motion.button>
                    </motion.div>
                  )}

                  {appMode === 'corporate' ? (
                    [
                      { id: 'chat', label: t.intelligentChat, icon: <MessageSquare size={18} /> },
                      { id: 'creative', label: 'Asset Studio', icon: <Palette size={18} /> },
                      { id: 'knowledge', label: 'Knowledge Bank', icon: <Database size={18} /> },
                      { id: 'ppt', label: t.pptStudio, icon: <Presentation size={18} /> }
                    ].map(item => (
                      <motion.button 
                        key={item.id}
                        variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActivePanel(item.id as any)}
                        className={cn("flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                          activePanel === item.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 translate-x-2' : 'text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900'
                        )}
                      >
                        {item.icon} {item.label}
                      </motion.button>
                    ))
                  ) : (
                    [
                      { id: 'chat', label: 'Tutor Socrático', icon: <Sparkles size={18} />, action: () => document.dispatchEvent(new CustomEvent('setDefaultMode')) },
                      { id: 'research', label: 'Junior PhD Research', icon: <ChevronRight size={18} />, action: () => document.dispatchEvent(new CustomEvent('setResearcherMode')) },
                      { id: 'quiz', label: 'Desafío de Saber', icon: <Crown size={18} />, action: () => document.dispatchEvent(new CustomEvent('setQuizMode')) },
                      { id: 'math', label: 'Laboratorio de Mate', icon: <Activity size={18} />, action: () => document.dispatchEvent(new CustomEvent('openMathLab')) },
                      { id: 'arcade', label: 'Zona Arcade', icon: <LayoutGrid size={18} />, action: () => document.dispatchEvent(new CustomEvent('openArcade')) },
                      { id: 'backpack', label: 'Mi Mochila', icon: <Database size={18} />, action: () => document.dispatchEvent(new CustomEvent('openBackpack')) },
                      { id: 'creative', label: 'Taller de Arte', icon: <Palette size={18} /> }
                    ].map(item => (
                      <motion.button 
                        key={item.id}
                        variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (item.action) {
                            setActivePanel('chat');
                            item.action();
                          } else {
                            setActivePanel(item.id as any);
                          }
                        }}
                        className={cn("flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                          (activePanel === item.id || (item.id === 'chat' && activePanel === 'chat')) ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 translate-x-2' : 'text-slate-500 hover:text-emerald-500 hover:bg-white dark:hover:bg-corporate-900'
                        )}
                      >
                        {item.icon} {item.label}
                      </motion.button>
                    ))
                  )}
                 
                 {isSuperAdmin && (
                   <motion.button 
                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActivePanel('team')}
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all"
                   >
                      <Users size={18} /> Team Management
                   </motion.button>
                 )}

                 <motion.button 
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUpgradePlan(true)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all"
                 >
                    <CreditCard size={18} /> Upgrade Plan
                 </motion.button>
               </motion.div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               <div className="space-y-4">
                  <div className="px-2 space-y-3">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-300 dark:text-slate-400 uppercase tracking-[0.2em] leading-none">Data Protection</label>
                        <div className="flex items-center gap-2">
                           <span className={cn("text-[9px] font-black uppercase tracking-tighter", dataProtectionEnabled ? "text-emerald-500" : "text-slate-300")}>ZDR</span>
                           <button onClick={() => setDataProtectionEnabled(!dataProtectionEnabled)} className={cn("w-10 h-5 rounded-full transition-all relative shrink-0", dataProtectionEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-300 dark:bg-corporate-800")}>
                              <motion.div 
                                animate={{ x: dataProtectionEnabled ? 20 : 0 }}
                                className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md")} 
                              />
                           </button>
                        </div>
                     </div>
                  </div>
                  <ModelSelector 
                    models={models} 
                    selectedModel={selectedModel} 
                    onSelect={setSelectedModel} 
                    isLoading={isLoadingModels} 
                    lang={lang}
                    dataProtected={dataProtectionEnabled}
                  />
                  
                  <div className="pt-2">
                    <EcoModeBanner
                      quota={quota}
                      ecoModeActive={ecoModeActive}
                      tokenPercent={tokenPercent}
                      multimediaRemaining={multimediaRemaining}
                      lang={lang}
                      isSuperAdmin={isSuperAdmin}
                    />
                  </div>
               </div>

               {isSuperAdmin && (
                 <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-3 pt-6 border-t border-slate-200 dark:border-white/5"
                 >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Management</label>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActivePanel('admin')}
                      className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activePanel === 'admin' ? 'bg-corporate-900 shadow-xl text-white' : 'text-slate-500 hover:bg-white dark:hover:bg-corporate-900'
                      )}
                    >
                       <Terminal size={18} /> Console
                    </motion.button>
                 </motion.div>
               )}
            </div>

            <div className="p-6 border-t border-inherit">
                   <div className="flex flex-col gap-1.5 mb-8">
                      <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] border border-corporate-200 dark:border-white/10 shadow-inner">
                         <button 
                           onClick={() => setAppMode('corporate')}
                           className={cn("flex-1 py-3 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                             appMode === 'corporate' 
                               ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-lg shadow-blue-500/20" 
                               : "text-slate-500 hover:text-blue-600"
                           )}
                         >
                           <Shield size={12} /> Corporate
                         </button>
                         <button 
                           onClick={() => setAppMode('junior')}
                           className={cn("flex-1 py-3 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                             appMode === 'junior' 
                               ? "bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-lg shadow-emerald-500/20" 
                               : "text-slate-500 hover:text-emerald-500"
                           )}
                         >
                           <Zap size={12} /> Junior
                         </button>
                      </div>
                   </div>
                 <button onClick={() => setShowPrivacyPolicy(true)} className="flex items-center gap-3 px-3 py-2 text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all">
                   <Shield size={14} /> Privacy & Compliance
                 </button>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10" title="Change language">
                        <Globe size={16} />
                        <span className="text-[10px] font-black uppercase ml-1">{lang}</span>
                      </button>
                      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-corporate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                      </button>
                    </div>
<div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Build 6.5.2</div>
                  </div>
                </div>
              </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className={cn("absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px]", 
          theme === 'dark' ? 'invert' : ''
        )} />
        
        <header className={cn("h-24 border-b flex items-center justify-between px-12 shrink-0 relative z-50",
          theme === 'dark' ? 'border-white/5 bg-corporate-950/80 backdrop-blur-xl' : 'border-corporate-100 bg-white/90 backdrop-blur-xl'
        )}>
          {/* Neural Processing Bar */}
          {isChatLoading && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600/30 origin-left z-[60]"
            >
               <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-full" />
            </motion.div>
          )}

          <div className="flex items-center gap-6">
             <motion.button 
               whileHover={{ scale: 1.1, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
               whileTap={{ scale: 0.9 }}
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
             >
               <Menu size={20} />
             </motion.button>
             <div className="flex items-center gap-3 relative">
                 <motion.div 
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className={cn("w-3.5 h-3.5 rounded-full relative z-10 shadow-lg", 
                    isChatLoading ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'
                  )} 
                 />
                <h2 className="text-xl font-display font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-inherit to-slate-400">
                  {selectedGPT ? selectedGPT.name : (selectedModel === 'openrouter/auto' ? t.autoRouter : currentModelData?.name || 'Corporate Pipeline')}
                </h2>
                {selectedGPT && (
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedGPT(null)} 
                    className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </motion.button>
                )}
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="flex items-center gap-4 pr-8 border-r border-slate-100 dark:border-white/5">
                <div className="text-right">
                   <p className="text-sm font-black tracking-tight">{user.displayName || 'Corporate User'}</p>
                   <p className="text-[10px] font-black text-blue-600 capitalize opacity-60 tracking-widest">{profile?.role || 'Basic Account'}</p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  className="w-11 h-11 rounded-2xl bg-blue-600 flex-shrink-0 overflow-hidden shadow-2xl ring-4 ring-white dark:ring-corporate-950 cursor-pointer"
                >
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-lg text-white">U</div>}
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.1, color: '#ef4444' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout} 
                  className="p-3 text-slate-400 transition-colors"
                >
                  <LogOut size={20} />
                </motion.button>
             </div>
             <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFAQ(true)} 
              className="flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-corporate-900 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
             >
                <HelpCircle size={16} /> FAQ
             </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" ref={scrollRef}>
          <AnimatePresence mode="wait">
            {appMode === 'junior' ? (
              <motion.div key="junior" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  <TechieWorkspace 
                    user={user}
                    profile={profile}
                    theme={theme}
                    onLogout={logout}
                  />
               </motion.div>
            ) : (
              <>
                {activePanel === 'admin' && (
                  <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                    <SuperAdminPanel user={user} onClose={() => setActivePanel('chat')} />
                  </motion.div>
                )}
              </>
            )}

            {activePanel === 'chat' && appMode === 'corporate' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 max-w-5xl mx-auto space-y-6 pb-32">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 lg:py-20 space-y-12 lg:space-y-16">
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100 shadow-sm">
                           <Sparkles size={14} /> Tu Espacio de Innovación Segura
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-display font-black tracking-tighter leading-[0.85] uppercase max-w-5xl">
                           <span className="text-corporate-900 dark:text-white">Empodera</span><br/>
                           <span className="text-blue-600">Tu Equipo</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 font-bold max-w-2xl mx-auto uppercase tracking-wider">
                           {appConfig?.landingSubtitle || 'Transformamos la IA en una herramienta de confianza para tu crecimiento.'}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-6">
                        {[
                           { 
                              title: 'Privacidad Total', 
                              desc: 'Seguridad NDA Proof: tus ideas y contratos se mantienen siempre privados.', 
                              icon: <Lock size={24} />, 
                              color: 'bg-blue-600',
                              light: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50',
                              dark: 'dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                           },
                           { 
                              title: 'Eficiencia Real', 
                              desc: 'IA de alto rendimiento optimizada para maximizar tu presupuesto.', 
                              icon: <TrendingUp size={24} />, 
                              color: 'bg-blue-600',
                              light: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50',
                              dark: 'dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-600/20'
                           },
                           { 
                              title: 'Valores Claros', 
                              desc: 'IA alineada con tu identidad, evitando alucinaciones y sesgos.', 
                              icon: <Shield size={24} />, 
                              color: 'bg-orange-500',
                              light: 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/50',
                              dark: 'dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                           },
                           { 
                              title: 'Filtros Junior', 
                              desc: 'Entorno protegido para menores, enfocado en aprendizaje y curiosidad.', 
                              icon: <Sparkles size={24} />, 
                              color: 'bg-emerald-600',
                              light: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50',
                              dark: 'dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                           }
                        ].map((card, i) => (
                           <div key={i} className={cn("p-8 rounded-[3rem] border flex flex-col items-center gap-6 transition-all hover:scale-105 hover:shadow-2xl group", 
                              theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-200/50"
                           )}>
                              <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12", card.light, card.dark)}>
                                 {card.icon}
                              </div>
                              <div className="space-y-3">
                                 <h3 className="text-xs font-black uppercase tracking-[0.2em]">{card.title}</h3>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-tighter">
                                    {card.desc}
                                 </p>
                              </div>
                           </div>
                        ))}

                     </div>
                  </div>
                ) : (
                  messages.map(m => <ChatMessage key={m.id} message={m} lang={lang} />)
                )}
                {isChatLoading && (
                  <div className="flex gap-4 max-w-3xl mx-auto w-full px-4 py-3 bg-blue-600/[0.03] dark:bg-blue-600/[0.05] rounded-xl border border-blue-500/10 relative overflow-hidden">
                     <div className="flex flex-col relative z-10 w-10 h-10 rounded-xl bg-blue-600 items-center justify-center text-white shadow-xl shadow-blue-600/20">
                        <RefreshCw size={18} className="animate-spin" />
                     </div>
                     <div className="flex-1 space-y-2 relative z-10 pt-1">
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Neural Scan...</span>
                           <div className="h-0.5 flex-1 bg-blue-500/10 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-1/3" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="h-3 bg-slate-200 dark:bg-corporate-800 rounded-full w-full opacity-40" />
                           <div className="h-3 bg-slate-200 dark:bg-corporate-800 rounded-full w-3/4 opacity-20" />
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activePanel === 'chat' && appMode === 'corporate' && (
          <div className={cn("p-10 border-t z-50", theme === 'dark' ? 'border-white/5 bg-corporate-950' : 'border-corporate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]')}>
             <div className="max-w-5xl mx-auto">
                <ChatInput 
                  onSend={handleSendMessage} 
                  isLoading={isChatLoading} 
                  lang={lang} 
                  onAdvancedToggle={() => setIsAdvancedPanelOpen(!isAdvancedPanelOpen)}
                  input={chatInputValue}
                  setInput={setChatInputValue}
                />
                <div className="flex justify-center gap-10 mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">
                   <span className="flex items-center gap-2 text-emerald-500"><ShieldCheck size={12} /> SECURE PIPELINE ACTIVE</span>
                   <span>ENGINE: <span className="text-blue-600">{currentModelData?.name || 'AUTO'}</span></span>
                </div>
             </div>
          </div>
        )}

        {/* Fullscreen Overlays for Desktop Modules */}
        <AnimatePresence>
          {activePanel === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-corporate-950"><AdminPanel onClose={() => setActivePanel('chat')} theme={theme} /></motion.div>
          )}
          {activePanel === 'creative' && (
            <motion.div key="creative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-corporate-950"><ImageEditor onClose={() => setActivePanel('chat')} theme={theme} lang={lang} appConfig={appConfig} onTrialEnd={() => setTrialEnded(true)} /></motion.div>
          )}
          {activePanel === 'knowledge' && (
            <motion.div key="knowledge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-corporate-950"><GPTsGenerator onClose={() => setActivePanel('chat')} onSelect={(gpt: any) => { setSelectedGPT(gpt); setActivePanel('chat'); }} theme={theme} /></motion.div>
          )}
          {activePanel === 'ppt' && (
            <motion.div key="ppt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-white"><PPTStudio theme={theme} lang={lang} user={user} onClose={() => setActivePanel('chat')} /></motion.div>
          )}
          {activePanel === 'team' && (
            <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-white dark:bg-corporate-950"><CompanyPanel onClose={() => setActivePanel('chat')} theme={theme} lang={lang} /></motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Environment Switcher */}
      {!isMobile && activePanel !== 'ppt' && (
        <div className="fixed bottom-6 right-6 z-[9999]">
           <button 
             onClick={() => setAppMode(appMode === 'corporate' ? 'junior' : 'corporate')}
             className={cn("flex items-center gap-3 px-5 py-4 rounded-full shadow-2xl transition-all hover:scale-105 border",
                appMode === 'corporate' 
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30" 
                  : "bg-blue-600 text-white border-blue-500 shadow-blue-600/30"
             )}
           >
              {appMode === 'corporate' ? <Zap size={18} /> : <Shield size={18} />}
              <span className="text-xs font-black uppercase tracking-widest">
                {appMode === 'corporate' ? 'Ir a Techie Tutor' : 'Ir a Corporate'}
              </span>
           </button>
        </div>
      )}

      <PromptGenie isOpen={isPromptGenieOpen} onClose={() => setIsPromptGenieOpen(false)} onApply={setChatInputValue} theme={theme} />
      <AnimatePresence>
        {isAdvancedPanelOpen && <AdvancedPanel isOpen={isAdvancedPanelOpen} onClose={() => setIsAdvancedPanelOpen(false)} settings={advancedSettings} setSettings={setAdvancedSettings} onPromptGenie={() => setIsPromptGenieOpen(true)} theme={theme} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} lang={lang} theme={theme} />}
        {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} theme={theme} />}
        {showUpgradePlan && (
          <UpgradePlanPage 
            onClose={() => setShowUpgradePlan(false)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
