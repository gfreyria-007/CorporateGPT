import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { PricingSection } from './PricingSection';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { ShieldCheck, Shield, CheckCircle2, ChevronRight, Zap, Globe, Sparkles, Coins, Cpu, Lock, MousePointer2, MessageSquare, Presentation, Palette, Database } from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStartSession: () => void;
  isSigningIn: boolean;
  showTrialModal?: boolean;
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
  appConfig?: any;
  appMode?: 'corporate' | 'junior';
}

export const LandingPage = ({ onStartSession, isSigningIn, showTrialModal = false, lang, setLang, appConfig, appMode = 'corporate' }: LandingPageProps) => {
  const t = translations[lang] || translations.es;
  const [isModalOpen, setIsModalOpen] = useState(showTrialModal);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTrialModal) {
      setIsModalOpen(true);
    }
  }, [showTrialModal]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Navigation */}
      <nav className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-[100] bg-black/80 backdrop-blur-3xl border-b border-white/[0.05]">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10 backdrop-blur-md border border-white/20 transition-all">
             C
          </div>
          <h1 className="text-lg lg:text-xl font-display font-black tracking-tight uppercase text-white">
             Catalizia
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
          <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hover:text-white transition-colors">{lang === 'en' ? 'Solutions' : 'Soluciones'}</a>
          <a href="#economics" className="hover:text-white transition-colors">{lang === 'en' ? 'Efficiency' : 'Eficiencia'}</a>
          <a href="#support" className="hover:text-white transition-colors">{lang === 'en' ? 'Support' : 'Soporte'}</a>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden sm:flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setLang('en')}
              className={cn("px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black transition-all", 
                lang === 'en' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('es')}
              className={cn("px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black transition-all", 
                lang === 'es' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'
              )}
            >
              ES
            </button>
          </div>
          <button 
            onClick={onStartSession}
            disabled={isSigningIn}
            className="px-4 lg:px-6 h-10 lg:h-12 bg-white text-black rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? '...' : (lang === 'en' ? 'Client Access' : 'Acceso')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 overflow-hidden bg-[#020205]">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 blur-[150px] rounded-full" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/10 blur-[150px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 mb-24">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-white/[0.08] backdrop-blur-3xl shadow-2xl"
            >
              <Sparkles size={14} className="text-blue-400" /> ECOSISTEMA DE IA DEFINITIVO
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[7rem] font-display font-black tracking-tighter leading-[0.85] text-white uppercase"
            >
              Inteligencia <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Sin Filtros</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="max-w-3xl text-sm md:text-lg text-slate-400 font-medium uppercase tracking-widest leading-relaxed"
            >
              Dos universos separados. Un motor unificado. Elige tu entorno y experimenta el poder de la IA con privacidad y seguridad absoluta.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Corporate Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="group relative rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] transition-all duration-500 flex flex-col backdrop-blur-xl"
            >
              {/* Fake UI Screenshot */}
              <div className="relative h-72 w-full bg-black/40 border-b border-white/[0.05] overflow-hidden flex items-end justify-center px-8 pt-12">
                 <div className="w-full h-full bg-[#0a0a0f] rounded-t-2xl border-x border-t border-white/10 shadow-[0_-20px_50px_rgba(37,99,235,0.1)] relative overflow-hidden flex transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-20 lg:w-24 h-full border-r border-white/5 p-4 flex flex-col gap-4 bg-white/[0.02]">
                       <div className="w-full h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30"><Shield size={20} className="text-blue-400"/></div>
                       <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-center"><Database size={20} className="text-white/20"/></div>
                       <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-center"><Presentation size={20} className="text-white/20"/></div>
                    </div>
                    <div className="flex-1 p-6 space-y-6">
                       <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-xl bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center"><Cpu size={18} className="text-white"/></div>
                          <div className="flex-1 space-y-3 pt-1">
                             <div className="h-4 w-1/3 bg-white/10 rounded-md" />
                             <div className="h-24 w-full bg-white/[0.03] rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                                <div className="h-2 w-full bg-white/10 rounded-full"/>
                                <div className="h-2 w-3/4 bg-white/10 rounded-full"/>
                                <div className="h-2 w-5/6 bg-white/10 rounded-full"/>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-4 flex-row-reverse items-start">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><div className="w-4 h-4 bg-white/50 rounded-sm"/></div>
                          <div className="h-12 w-2/3 bg-blue-500/10 rounded-xl border border-blue-500/20 p-3">
                             <div className="h-2 w-1/2 bg-blue-400/50 rounded-full"/>
                          </div>
                       </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />
                 </div>
              </div>

              <div className="relative p-10 lg:p-12 z-20 space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Corporate GPT</h3>
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Privacidad ZDR • Modelos Enterprise</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  El pipeline definitivo para PyMEs. Analiza documentos, genera reportes y automatiza tareas sin que tus datos confidenciales toquen el internet público.
                </p>
                <button 
                  onClick={() => { window.location.href = 'https://corporategpt.catalizia.com'; }}
                  className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                >
                  Entrar a Corporate <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>

            {/* Techie Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="group relative rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] transition-all duration-500 flex flex-col backdrop-blur-xl"
            >
              {/* Fake UI Screenshot */}
              <div className="relative h-72 w-full bg-black/40 border-b border-white/[0.05] overflow-hidden flex items-end justify-center px-8 pt-12">
                 <div className="w-full h-full bg-[#0a0f0d] rounded-t-2xl border-x border-t border-white/10 shadow-[0_-20px_50px_rgba(16,185,129,0.1)] relative overflow-hidden transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-full h-20 bg-emerald-950/20 border-b border-emerald-500/10 p-4 flex items-center justify-between">
                       <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"><Sparkles size={20} className="text-emerald-400"/></div>
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Lock size={16} className="text-white/20"/></div>
                       </div>
                       <div className="h-8 w-28 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center px-3 gap-2">
                          <div className="w-4 h-4 rounded-full bg-amber-400"/>
                          <div className="h-2 w-10 bg-amber-400/50 rounded-full"/>
                       </div>
                    </div>
                    <div className="p-6 space-y-6">
                       <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center"><Zap size={24} className="text-white"/></div>
                          <div className="h-20 w-3/4 bg-emerald-500/10 rounded-2xl rounded-tl-sm border border-emerald-500/20 p-5 flex flex-col justify-center gap-3">
                             <div className="h-2 w-full bg-emerald-400/40 rounded-full" />
                             <div className="h-2 w-2/3 bg-emerald-400/40 rounded-full" />
                          </div>
                       </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent z-10" />
                 </div>
              </div>

              <div className="relative p-10 lg:p-12 z-20 space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Techie Tutor</h3>
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Pedagogía Socrática • Sandbox Seguro</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  El compañero de estudio perfecto para tus hijos. Gamificación avanzada, explicaciones paso a paso y filtros de seguridad impenetrables para su aprendizaje.
                </p>
                <button 
                  onClick={() => { window.location.href = 'https://techie.catalizia.com'; }}
                  className="w-full py-4 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-400 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
                >
                  Entrar a Techie Tutor <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 lg:px-12 bg-[#020205] border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck size={150} /></div>
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 mb-6"><Lock size={24} /></div>
                   <h4 className="text-2xl font-black text-white uppercase tracking-wide mb-3">Arquitectura Zero-Data</h4>
                   <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-lg">Implementamos un pipeline de seguridad impenetrable. Tus prompts, documentos y conversaciones jamás tocan el internet público ni se usan para entrenar IAs.</p>
                </div>
             </div>
             
             <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6 hover:bg-white/[0.04] transition-colors flex flex-col justify-between">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20"><ShieldCheck size={24} /></div>
                <div>
                   <h4 className="text-xl font-black text-white uppercase tracking-wide mb-2">Sandbox Infantil</h4>
                   <p className="text-slate-400 text-sm leading-relaxed font-medium">Contenido 100% filtrado. Cero riesgos, cero sesgos para niños.</p>
                </div>
             </div>

             <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6 hover:bg-white/[0.04] transition-colors">
                <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20"><Coins size={24} /></div>
                <h4 className="text-xl font-black text-white uppercase tracking-wide">Router Económico</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Auto-selección del modelo más barato según la tarea. Ahorra hasta 80% en costos.</p>
             </div>

             <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/[0.05] space-y-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-700" />
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20 mb-6"><Globe size={24} /></div>
                   <h4 className="text-2xl font-black text-white uppercase tracking-wide mb-3">Modelos Universales</h4>
                   <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-lg">Acceso instantáneo a GPT-4, Claude 3.5, Gemini Pro y Llama 3 desde una misma interfaz unificada. Olvídate de pagar suscripciones separadas a cada proveedor.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <div id="support">
        <SupportFooter />
      </div>

      <TrialEndedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onViewPricing={onStartSession} 
      />
    </div>
  );
};
