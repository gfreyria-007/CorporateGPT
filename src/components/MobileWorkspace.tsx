import React, { useState, useEffect } from 'react';
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
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ImageEditor } from './ImageEditor';
import PPTStudio from './PPTStudio';
import { GPTsGenerator } from './GPTsGenerator';

export function MobileWorkspace({ 
  theme, 
  lang, 
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
  selectedGPT
}: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  // Haptic-like feedback helper
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleAction = (action: () => void) => {
    triggerHaptic();
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
              {/* Header */}
              <header className={cn(
                "h-16 flex items-center justify-between px-5 border-b backdrop-blur-xl z-50 shrink-0",
                isDark ? "bg-corporate-950/80 border-white/5" : "bg-white/80 border-slate-200 shadow-sm"
              )}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleAction(() => setIsMenuOpen(true))}
                    className={cn("p-2 rounded-xl", isDark ? "bg-white/5" : "bg-slate-100")}
                  >
                    <Menu size={20} />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-xs font-black uppercase tracking-widest leading-none">
                      {selectedGPT ? selectedGPT.name : 'Corporate GPT'}
                    </h1>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                      {isChatLoading ? 'Neural Processing...' : 'v5.0 Native Mobile'}
                    </span>
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

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8">
                    <motion.div 
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30"
                    >
                      <Zap size={40} />
                    </motion.div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-display font-black tracking-tighter leading-tight uppercase">
                        {appConfig?.appName || t.welcomeTitle}
                      </h2>
                      <p className="text-[10px] text-slate-400 font-black leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.2em]">
                        {t.lobbySubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      {[
                        { icon: <MessageSquare size={16} />, label: t.intelligentChat, color: 'text-blue-500' },
                        { icon: <Presentation size={16} />, label: t.pptStudio, color: 'text-emerald-500' },
                        { icon: <Palette size={16} />, label: 'Asset Studio', color: 'text-purple-500' },
                        { icon: <Database size={16} />, label: 'Knowledge Bank', color: 'text-amber-500' }
                      ].map((item, i) => (
                        <div key={i} className={cn("p-4 rounded-3xl border flex flex-col items-center gap-2", 
                          isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100"
                        )}>
                           <div className={item.color}>{item.icon}</div>
                           <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 w-full max-w-[280px]">
                      <button 
                        onClick={() => handleAction(() => onOpenPanel('ppt'))} 
                        className={cn("p-5 rounded-3xl border flex items-center justify-between transition-all active:scale-95", 
                          isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-200/50"
                        )}
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                               <Presentation size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{t.pptStudio}</span>
                         </div>
                         <ChevronRight size={16} className="text-slate-300" />
                      </button>
                      <button 
                        onClick={() => handleAction(() => onOpenPanel('creative'))} 
                        className={cn("p-5 rounded-3xl border flex items-center justify-between transition-all active:scale-95", 
                          isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-200/50"
                        )}
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                               <ImageIcon size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Asset Studio</span>
                         </div>
                         <ChevronRight size={16} className="text-slate-300" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-24">
                    {messages.map((m: any) => (
                      <div key={m.id} className={cn(
                        "flex flex-col space-y-1",
                        m.role === 'user' ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "max-w-[85%] px-5 py-4 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm transition-all",
                          m.role === 'user' 
                            ? (isDark ? "bg-blue-600 text-white rounded-tr-none" : "bg-blue-600 text-white rounded-tr-none shadow-blue-600/20")
                            : (isDark ? "bg-white/5 text-slate-200 rounded-tl-none border border-white/5" : "bg-white text-slate-800 rounded-tl-none border border-slate-100")
                        )}>
                          {m.content}
                        </div>
                        <span className="text-[8px] font-black uppercase text-slate-400 px-2 tracking-widest">
                           {m.role === 'user' ? 'Me' : (selectedGPT?.name || 'Corporate AI')}
                        </span>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex items-center gap-3 animate-pulse">
                         <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-slate-100")}>
                            <Sparkles size={16} className="text-blue-500" />
                         </div>
                         <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded-full" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className={cn(
                "px-4 pb-10 pt-4 border-t backdrop-blur-2xl z-50 shrink-0",
                isDark ? "bg-corporate-950/90 border-white/5" : "bg-white/90 border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
              )}>
                <div className="relative max-w-lg mx-auto">
                  <textarea 
                    rows={1}
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    placeholder={t.placeholder}
                    className={cn(
                      "w-full py-4 pl-6 pr-14 rounded-[2rem] text-sm font-bold shadow-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all border resize-none",
                      isDark ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200"
                    )}
                    onInput={(e: any) => {
                       e.target.style.height = 'auto';
                       e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
                    }}
                  />
                  <button 
                    onClick={() => handleAction(onSendMessage)}
                    disabled={!chatInputValue.trim() || isChatLoading}
                    className="absolute right-2 bottom-2 w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 disabled:bg-slate-400 transition-all active:scale-90"
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
              {activePanel === 'ppt' && (
                <PPTStudio 
                   theme={theme} 
                   lang={lang} 
                   user={user} 
                   onClose={() => onOpenPanel('chat')} 
                   isMobile={true} 
                />
              )}
              {activePanel === 'creative' && (
                <ImageEditor 
                  onClose={() => onOpenPanel('chat')} 
                  theme={theme} 
                  appConfig={appConfig}
                  onTrialEnd={() => setTrialEnded(true)}
                  isMobile={true}
                />
              )}
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

      {/* Bottom Navigation Bar - Native Feel */}
      {activePanel === 'chat' && (
        <nav className={cn(
          "h-20 border-t flex items-center justify-around px-4 z-[60] pb-5 pt-2",
          isDark ? "bg-corporate-950 border-white/5" : "bg-white border-slate-100"
        )}>
           <button 
             onClick={() => handleAction(() => onOpenPanel('chat'))} 
             className={cn("flex flex-col items-center gap-1 transition-all", activePanel === 'chat' ? "text-blue-500" : "text-slate-400")}
           >
              <div className={cn("p-2 rounded-2xl", activePanel === 'chat' && (isDark ? "bg-blue-500/10" : "bg-blue-50"))}>
                 <MessageSquare size={22} strokeWidth={activePanel === 'chat' ? 3 : 2} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">Chat</span>
           </button>
           <button 
             onClick={() => handleAction(() => onOpenPanel('ppt'))} 
             className="flex flex-col items-center gap-1 text-slate-400"
           >
              <div className="p-2 rounded-2xl">
                 <Presentation size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">Studio</span>
           </button>
           <button 
             className="relative -top-6"
             onClick={() => handleAction(() => onOpenPanel('knowledge'))}
           >
              <div className="w-14 h-14 bg-blue-600 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 border-4 border-slate-50 dark:border-corporate-950">
                 <Plus size={28} strokeWidth={3} />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-tighter text-blue-600">GPTs</span>
           </button>
           <button 
             onClick={() => handleAction(() => onOpenPanel('creative'))} 
             className="flex flex-col items-center gap-1 text-slate-400"
           >
              <div className="p-2 rounded-2xl">
                 <ImageIcon size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">Assets</span>
           </button>
           <button 
             onClick={() => handleAction(() => setIsMenuOpen(true))} 
             className="flex flex-col items-center gap-1 text-slate-400"
           >
              <div className="p-2 rounded-2xl">
                 <LayoutGrid size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
           </button>
        </nav>
      )}

      {/* Side Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-[2100] flex flex-col p-8",
                isDark ? "bg-corporate-950 border-r border-white/5" : "bg-white border-r border-slate-100"
              )}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                     <Zap size={24} />
                   </div>
                   <h1 className="text-sm font-black uppercase tracking-widest">Corporate <span className="text-blue-500">GPT</span></h1>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
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
                     className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-slate-500"
                   >
                     <div className="flex items-center gap-4">
                        {item.icon} {item.label}
                     </div>
                     <ChevronRight size={14} />
                   </button>
                 ))}
              </nav>

              <div className="pt-8 border-t border-inherit">
                 <div className="flex items-center gap-4 px-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg border-4 border-blue-500/20">
                       {profile?.name?.[0] || 'U'}
                    </div>
                    <div>
                       <p className="text-sm font-black tracking-tight">{profile?.name || 'Corporate User'}</p>
                       <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{profile?.role || 'Premium Access'}</p>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all">
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
