import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Presentation, 
  ImageIcon, 
  Menu, 
  X, 
  Send,
  Zap,
  ChevronRight,
  Database,
  Search,
  Settings,
  ShieldCheck,
  User,
  History,
  LayoutGrid,
  CreditCard,
  Plus,
  Palette,
  TrendingUp,
  Lock,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { GPTsGenerator } from './GPTsGenerator';
import { EcoModeBanner } from './EcoModeBanner';

const useHaptic = () => {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 5, medium: 10, heavy: 20 };
      navigator.vibrate(patterns[type]);
    }
  }, []);
  return { trigger };
};

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-slate-200 dark:bg-white/10 rounded-full", className)} />
);

const SkeletonMessage = ({ isUser }: { isUser: boolean }) => (
  <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
    <div className={cn("max-w-[85%] space-y-2", isUser ? "items-end" : "items-start")}>
      <SkeletonLoader className={isUser ? "w-24 h-10 rounded-3xl" : "w-48 h-14 rounded-2xl"} />
      <SkeletonLoader className="w-12 h-3 rounded" />
    </div>
  </div>
);

const PullToRefresh = ({ onRefresh, children }: { onRefresh: () => void; children: React.ReactNode }) => {
  const [isPulling, setIsPulling] = useState(false);
  const pullStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY;
    if (scrollContainerRef.current?.scrollTop === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const pullEndY = e.changedTouches[0].clientY;
    if (pullStartY.current - pullEndY > 100) {
      onRefresh();
    }
    setIsPulling(false);
  };

  return (
    <div 
      ref={scrollContainerRef}
      className={cn("flex-1 overflow-y-auto momentum-scroll", isPulling && "transition-transform")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      {isPulling && (
        <div className="flex justify-center py-4">
          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

export function MobileWorkspace({ 
  theme, 
  lang = 'es', 
  user, 
  profile,
  onOpenPanel,
  activePanel,
  messages,
  isChatLoading,
  onSendMessage,
  chatInputValue,
  setChatInputValue,
  t,
  appConfig,
  setTrialEnded,
  setSelectedGPT,
  selectedGPT,
  quota,
  ecoModeActive,
  tokenPercent,
  multimediaRemaining,
  isSuperAdmin,
  appMode = 'corporate'
}: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isJunior = appMode === 'junior';
  const isDark = theme === 'dark';
  const { trigger: haptic } = useHaptic();

  const handleRefresh = useCallback(() => {
    haptic('medium');
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [haptic]);

  const handleAction = (action: () => void) => {
    haptic('light');
    action();
  };

  return (
    <div className={cn(
      "fixed inset-0 flex flex-col font-sans transition-colors duration-300 overflow-hidden select-none",
      isDark ? "bg-corporate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Layer */}
      <div className={cn("absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]", 
        isDark ? 'invert' : ''
      )} />

      {/* Main View Switcher */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {activePanel === 'chat' ? (
            <motion.div 
              key="mobile-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Header - Safe area top padding */}
              <header className={cn(
                "h-16 flex items-center justify-between px-4 pt-safe border-b backdrop-blur-xl z-50 shrink-0",
                isDark ? "bg-corporate-950/80 border-white/5" : "bg-white/80 border-slate-200 shadow-sm"
              )}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleAction(() => setIsMenuOpen(true))}
                    className={cn(
                      "w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl tap-target touch-manipulation",
                      isJunior ? "bg-emerald-500/10 text-emerald-600 active:bg-emerald-500/20" : (isDark ? "bg-white/5 active:bg-white/10" : "bg-slate-100 active:bg-slate-200")
                    )}
                  >
                    <Menu size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    {isJunior && (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-blue-100 overflow-hidden">
                        <img src="https://catalizia.com/images/catalizia-techie.png" alt="Techie" className="w-full h-full object-contain p-1" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h1 className="text-xs font-black uppercase tracking-widest leading-none">
                        {isJunior ? 'Techie Tutor AI' : (selectedGPT ? selectedGPT.name : 'Corporate GPT')}
                      </h1>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                        {isChatLoading ? 'Procesando...' : (isJunior ? 'Tu guía inteligente' : 'v5.0 Native Mobile')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                     isDark ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-500/10 text-emerald-600"
                   )}>
                      <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                      Secure
                   </div>
                </div>
              </header>

              {/* Chat Body with Pull-to-Refresh */}
              <PullToRefresh onRefresh={handleRefresh}>
                <div className="p-4 space-y-6 pb-24 custom-scrollbar">
                  
                  <EcoModeBanner
                    quota={quota}
                    ecoModeActive={ecoModeActive}
                    tokenPercent={tokenPercent}
                    multimediaRemaining={multimediaRemaining}
                    isSuperAdmin={isSuperAdmin}
                  />

                {messages.length === 0 || isRefreshing ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
                      <div className="space-y-4">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-blue-600/20">
                           {isJunior ? '✨ APRENDIZAJE MÁGICO' : '🛡️ ENTERPRISE PIPELINE'}
                        </div>
                        <h2 className="text-5xl font-display font-black tracking-tighter leading-[0.9] uppercase">
                           <span className={isDark ? "text-white" : "text-corporate-900"}>{isJunior ? 'Hola,' : 'Command'}</span><br/>
                           <span className={isJunior ? "text-emerald-500" : "text-blue-600"}>{isJunior ? (profile?.name || 'Explorador') : 'The Future'}</span>
                        </h2>
                        <p className="text-[10px] text-slate-400 font-black leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.1em]">
                           {isJunior 
                             ? '¿Qué quieres descubrir hoy? Tu guía inteligente está lista para ayudarte.'
                             : (appConfig?.landingSubtitle || 'El primer pipeline de IA para PyMEs que prioriza tus datos y tu bolsillo.')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        {[
                           { title: 'Privacidad', icon: <Lock size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                           { title: 'Costo', icon: <TrendingUp size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                           { title: 'Valores', icon: <Shield size={16} />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                           { title: 'AI-First', icon: <LayoutGrid size={16} />, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                        ].map((item, i) => (
                           <div key={i} className={cn("p-4 rounded-3xl border flex flex-col items-center gap-2", 
                             isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-lg shadow-slate-200/30"
                           )}>
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                                 {item.icon}
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{item.title}</span>
                           </div>
                        ))}
                      </div>
                    
                    
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isLoadingMessages ? (
                      <>
                        <SkeletonMessage isUser={false} />
                        <SkeletonMessage isUser={true} />
                        <SkeletonMessage isUser={false} />
                      </>
                    ) : (
                      <>
                        {messages.map((m: any) => (
                          <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex flex-col space-y-1",
                              m.role === 'user' ? "items-end" : "items-start"
                            )}
                          >
                            <div className={cn(
                              "max-w-[85%] px-5 py-4 rounded-[2rem] text-[15px] font-medium leading-relaxed shadow-sm transition-all card-press",
                              m.role === 'user' 
                                ? (isDark ? "bg-blue-600 text-white rounded-tr-none" : "bg-blue-600 text-white rounded-tr-none shadow-blue-600/20")
                                : (isDark ? "bg-white/5 text-slate-200 rounded-tl-none border border-white/5" : "bg-white text-slate-800 rounded-tl-none border border-slate-100")
                            )}>
                              {m.content}
                            </div>
                            <span className="text-[8px] font-black uppercase text-slate-400 px-2 tracking-widest">
                               {m.role === 'user' ? 'Me' : (selectedGPT?.name || 'Corporate AI')}
                            </span>
                          </motion.div>
                        ))}
                        {isChatLoading && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                          >
                             <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-slate-100")}>
                                <Sparkles size={16} className="text-blue-500 animate-pulse" />
                             </div>
                             <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded-full" />
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                )}
                </div>
              </PullToRefresh>

              {/* Chat Input - Safe area bottom padding */}
              <div className={cn(
                "px-4 pb-safe pt-4 border-t backdrop-blur-2xl z-50 shrink-0",
                isDark ? "bg-corporate-950/90 border-white/5" : "bg-white/90 border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
              )}>
                <div className="relative max-w-lg mx-auto">
                  <textarea 
                    rows={1}
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    placeholder={t.placeholder}
                    className={cn(
                      "w-full py-4 pl-6 pr-14 rounded-[2rem] text-[15px] font-medium shadow-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all border resize-none touch-manipulation",
                      isDark ? "bg-white/5 border-white/5 text-white placeholder:text-slate-500" : "bg-white border-slate-200 placeholder:text-slate-400"
                    )}
                    onInput={(e: any) => {
                       e.target.style.height = 'auto';
                       e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
                    }}
                  />
                  <button 
                    onClick={() => handleAction(onSendMessage)}
                    disabled={!chatInputValue.trim() || isChatLoading}
                    className="absolute right-2 bottom-2 w-11 h-11 min-w-[44px] min-h-[44px] bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 disabled:bg-slate-400 transition-all active:scale-90 tap-target touch-manipulation"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="panel-fullscreen"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[1000] bg-white dark:bg-corporate-950 flex flex-col"
            >
              {activePanel === 'knowledge' && (
                <GPTsGenerator 
                  onClose={() => onOpenPanel('chat')} 
                  onSelect={(gpt: any) => {
                    setSelectedGPT(gpt);
                    onOpenPanel('chat');
                  }}
                  theme={theme}
                  isMobile={true}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar - Native Feel with Safe Area */}
      {activePanel === 'chat' && (
        <nav className={cn(
          "bottom-nav-height border-t flex items-end justify-around px-2 z-[60] pt-2 pb-safe",
          isDark ? "bg-corporate-950/95 border-white/5 backdrop-blur-xl" : "bg-white/95 border-slate-100 backdrop-blur-xl"
        )}>
           <button 
             onClick={() => handleAction(() => onOpenPanel('chat'))} 
             className={cn(
               "flex flex-col items-center gap-1 transition-all tap-target touch-manipulation min-w-[44px] min-h-[44px] justify-center rounded-2xl active:scale-95",
               activePanel === 'chat' ? (isJunior ? "text-emerald-500" : "text-blue-500") : "text-slate-400 active:text-slate-600"
             )}
           >
              <div className={cn("w-11 h-11 flex items-center justify-center rounded-2xl", 
                activePanel === 'chat' && (isDark ? (isJunior ? "bg-emerald-500/10" : "bg-blue-500/10") : (isJunior ? "bg-emerald-50" : "bg-blue-50"))
              )}>
                 <MessageSquare size={22} strokeWidth={activePanel === 'chat' ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{isJunior ? 'Tutor' : 'Chat'}</span>
           </button>
           <button 
             className="relative -top-2 min-w-[44px] min-h-[44px] flex flex-col items-center"
             onClick={() => handleAction(() => onOpenPanel('knowledge'))}
           >
              <div className={cn(
                "w-14 h-14 min-w-[56px] min-h-[56px] rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl border-4 border-slate-50 dark:border-corporate-950 active:scale-95 transition-transform tap-target touch-manipulation",
                isJunior ? "bg-emerald-500 shadow-emerald-500/40" : "bg-blue-600 shadow-blue-600/40"
              )}>
                 <Plus size={28} strokeWidth={3} />
              </div>
              <span className={cn("mt-1 text-[9px] font-black uppercase tracking-tighter",
                isJunior ? "text-emerald-600" : "text-blue-600"
              )}>{isJunior ? 'Nuevo' : 'GPTs'}</span>
           </button>
           <button 
             onClick={() => handleAction(() => setIsMenuOpen(true))} 
             className="flex flex-col items-center gap-1 text-slate-400 min-w-[44px] min-h-[44px] justify-center rounded-2xl active:scale-95 active:text-slate-600 tap-target touch-manipulation"
           >
              <div className="w-11 h-11 flex items-center justify-center rounded-2xl">
                 <LayoutGrid size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{isJunior ? 'Mochila' : 'More'}</span>
           </button>
        </nav>
      )}

      {/* Side Drawer Menu - Enhanced with touch interactions */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleAction(() => setIsMenuOpen(false))}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-[2100] flex flex-col pt-safe pb-safe pl-safe pr-8",
                isDark ? "bg-corporate-950 border-r border-white/5" : "bg-white border-r border-slate-100"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                     <Zap size={24} />
                   </div>
                   <h1 className="text-sm font-black uppercase tracking-widest">Corporate <span className="text-blue-500">GPT</span></h1>
                </div>
                <button 
                  onClick={() => handleAction(() => setIsMenuOpen(false))} 
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl active:bg-slate-100 dark:active:bg-white/10 tap-target touch-manipulation"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Account & Settings</p>
                 {[
                   { icon: <User size={18} />, label: 'Profile', id: 'profile' },
                   { icon: <CreditCard size={18} />, label: 'Subscription', id: 'plan' },
                   { icon: <ShieldCheck size={18} />, label: 'Privacy', id: 'privacy' },
                   { icon: <Settings size={18} />, label: 'Settings', id: 'settings' }
                 ].map(item => (
                   <button 
                     key={item.id}
                     className="w-full flex items-center justify-between p-4 rounded-2xl active:bg-slate-100 dark:active:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-slate-500 min-h-[44px] tap-target touch-manipulation"
                   >
                     <div className="flex items-center gap-4">
                        {item.icon} {item.label}
                     </div>
                     <ChevronRight size={14} className="text-slate-300" />
                   </button>
                 ))}
              </nav>

              <div className="pt-6 border-t border-inherit">
                 <div className="flex items-center gap-4 px-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg border-4 border-blue-500/20">
                       {profile?.name?.[0] || 'U'}
                    </div>
                    <div>
                       <p className="text-sm font-black tracking-tight">{profile?.name || 'Corporate User'}</p>
                       <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{profile?.role || 'Premium Access'}</p>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 active:bg-red-500/20 transition-all min-h-[44px] tap-target touch-manipulation">
                    Secure Logout
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
