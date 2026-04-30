import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { PricingSection } from './PricingSection';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { ShieldCheck, ChevronRight, Zap, Globe, Sparkles, Coins, Cpu, Lock, MousePointer2, MessageSquare, Presentation, Palette, Database } from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';

const NeuralBackground = () => null;

interface LandingPageProps {
  onStartSession: () => void;
  isSigningIn: boolean;
  showTrialModal?: boolean;
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
  appConfig?: any;
}

export const LandingPage = ({ onStartSession, isSigningIn, showTrialModal = false, lang, setLang, appConfig }: LandingPageProps) => {
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
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-600 selection:text-white relative">
      {/* <NeuralBackground /> */}
      {/* Navigation */}
      <nav className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-[100] bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-corporate-100 dark:border-white/10">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">
             {appConfig?.appLogoText || 'C'}
          </div>
          <h1 className="text-lg lg:text-xl font-display font-black tracking-tight uppercase dark:text-white">
             {appConfig?.appName || 'Catalizia'}
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-corporate-900 dark:text-white/70">
          <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hover:text-blue-600 dark:hover:text-white transition-colors">{lang === 'en' ? 'Solutions' : 'Soluciones'}</a>
          <a href="#economics" className="hover:text-blue-600 dark:hover:text-white transition-colors">{lang === 'en' ? 'Efficiency' : 'Eficiencia'}</a>
          <a href="#support" className="hover:text-blue-600 dark:hover:text-white transition-colors">{lang === 'en' ? 'Support' : 'Soporte'}</a>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-corporate-200 dark:border-white/10">
            <button 
              onClick={() => setLang('en')}
              className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('es')}
              className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black transition-all ${lang === 'es' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              ES
            </button>
          </div>
          <button 
            onClick={onStartSession}
            disabled={isSigningIn}
            className="px-4 lg:px-6 h-10 lg:h-12 bg-blue-600 text-white rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (lang === 'en' ? '...' : '...') : (lang === 'en' ? 'Client Access' : 'Acceso')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-6 lg:px-12 overflow-hidden bg-white dark:bg-black">
        {/* Sharper Gradients for better visibility */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full -mr-[20vw] -mt-[20vw]" />
           <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-amber-500/5 dark:bg-blue-400/5 blur-[120px] rounded-full -ml-[15vw] -mb-[15vw]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border border-blue-600/20 backdrop-blur-xl shadow-[0_0_20px_rgba(37,99,235,0.1)] relative overflow-hidden"
            >

              <Lock size={14} /> {lang === 'en' ? 'Certified AI Pipeline' : 'IA Certificada para PyMEs'}
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl lg:text-[9rem] font-display font-black tracking-tight leading-[0.9] uppercase max-w-6xl text-corporate-900 dark:text-white flex flex-wrap justify-center gap-x-[0.3em]"
            >
              {(appConfig?.landingTitle || t.landingTitle).split(' ').map((word: string, i: number) => (
                <span key={i} className={cn((word.toLowerCase() === 'private' || word.toLowerCase() === 'privada') ? 'text-blue-600' : '')}>
                  {word}
                </span>
              ))}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl text-base md:text-xl font-medium text-slate-500 dark:text-white/60 leading-relaxed uppercase tracking-wider px-4"
            >
              {appConfig?.landingSubtitle || t.landingSubtitle}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row gap-4 lg:gap-6 w-full max-w-xl pt-4 px-6 md:px-0"
            >
              <button 
                onClick={onStartSession}
                disabled={isSigningIn}
                className="flex-1 h-16 lg:h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center gap-4 font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-blue-600/20"
              >
                {isSigningIn ? (lang === 'en' ? '...' : '...') : t.getStarted} 
                {!isSigningIn && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              <button 
                onClick={scrollToFeatures}
                className="flex-1 h-16 lg:h-20 bg-slate-50 dark:bg-white/5 text-corporate-900 dark:text-white border border-corporate-200 dark:border-white/10 rounded-[2rem] flex items-center justify-center gap-4 font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm group"
              >
                {t.viewDemo} <MousePointer2 size={18} className="text-blue-600 group-hover:scale-125 transition-transform" />
              </button>
            </motion.div>
            {/* Platform Showcase - What the app can do */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 px-4"
            >
              {[
                { icon: <MessageSquare size={20} />, label: t.intelligentChat, color: 'text-blue-500' },
                { icon: <Presentation size={20} />, label: t.pptStudio, color: 'text-emerald-500' },
                { icon: <Palette size={20} />, label: 'Asset Studio', color: 'text-purple-500' },
                { icon: <Database size={20} />, label: 'Knowledge Bank', color: 'text-amber-500' }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-corporate-100 dark:border-white/5 flex flex-col items-center gap-4 transition-all hover:bg-white dark:hover:bg-white/10 group">
                   <div className={cn("w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", item.color.replace('text', 'bg').replace('500', '500/10'))}>
                      <div className={item.color}>{item.icon}</div>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Neural Preview - Visualizing the App */}
          <div className="mt-48 relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-[150px] rounded-full scale-150 opacity-20" />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative z-10 p-4 lg:p-8 rounded-[4rem] bg-corporate-900 border border-white/10 shadow-3xl overflow-hidden aspect-[16/9] lg:aspect-auto lg:h-[600px]"
            >
               {/* Mock UI for "What the app can do" */}
               <div className="h-full w-full flex gap-4">
                  <div className="w-64 hidden lg:flex flex-col gap-3 p-6 border-r border-white/5">
                     <div className="w-full h-12 bg-white/5 rounded-xl" />
                     <div className="space-y-2">
                        {[1,2,3,4].map(i => <div key={i} className="h-10 w-full bg-white/[0.02] rounded-lg" />)}
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col p-6 space-y-6">
                     <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                           <div className="h-4 w-32 bg-white/10 rounded-full" />
                        </div>
                        <div className="flex gap-2">
                           <div className="w-8 h-8 bg-white/5 rounded-lg" />
                           <div className="w-8 h-8 bg-white/5 rounded-lg" />
                        </div>
                     </div>
                     <div className="flex-1 space-y-4">
                        <div className="max-w-md bg-white/5 p-4 rounded-2xl rounded-tl-none mr-auto">
                           <div className="h-3 w-full bg-white/10 rounded-full mb-2" />
                           <div className="h-3 w-3/4 bg-white/10 rounded-full" />
                        </div>
                        <div className="max-w-md bg-blue-600 p-4 rounded-2xl rounded-tr-none ml-auto">
                           <div className="h-3 w-full bg-white/20 rounded-full mb-2" />
                           <div className="h-3 w-1/2 bg-white/20 rounded-full" />
                        </div>
                     </div>
                     <div className="h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center px-6 gap-4">
                        <div className="h-3 flex-1 bg-white/10 rounded-full" />
                        <div className="w-10 h-10 bg-blue-600 rounded-full shadow-lg" />
                     </div>
                  </div>
               </div>
               
             </motion.div>
          </div>

          {/* High Contrast Feature Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-48">
            <div className="p-10 lg:p-14 rounded-[3.5rem] bg-slate-50 dark:bg-white/5 border border-corporate-200 dark:border-white/10 space-y-8 group hover:bg-white dark:hover:bg-white/[0.08] transition-all">
               <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                 <ShieldCheck size={32} />
               </div>
               <div className="space-y-4">
                 <h3 className="font-display font-black text-2xl tracking-tight uppercase leading-none text-corporate-900 dark:text-white">{t.highlightSafetyTitle}</h3>
                 <p className="text-xs font-bold leading-relaxed text-slate-500 dark:text-white/50 uppercase tracking-widest">
                    {t.highlightSafetyDesc}
                 </p>
               </div>
            </div>
            
            <div id="economics" className="p-10 lg:p-14 rounded-[3.5rem] bg-corporate-900 dark:bg-blue-600 border border-transparent text-white space-y-8 shadow-2xl shadow-blue-600/30 md:translate-y-12">
               <div className="w-16 h-16 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                 <Coins size={32} />
               </div>
               <div className="space-y-4">
                 <h3 className="font-display font-black text-2xl tracking-tight uppercase leading-none">{t.highlightEfficiencyTitle}</h3>
                 <p className="text-xs font-bold leading-relaxed text-white/80 uppercase tracking-widest">
                    {t.highlightEfficiencyDesc}
                 </p>
               </div>
            </div>

            <div className="p-10 lg:p-14 rounded-[3.5rem] bg-slate-50 dark:bg-white/5 border border-corporate-200 dark:border-white/10 space-y-8 group hover:bg-white dark:hover:bg-white/[0.08] transition-all">
               <div className="w-16 h-16 bg-blue-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
                 <Cpu size={32} />
               </div>
               <div className="space-y-4">
                 <h3 className="font-display font-black text-2xl tracking-tight uppercase leading-none text-corporate-900 dark:text-white">{t.tokenRouterTitle}</h3>
                 <p className="text-xs font-bold leading-relaxed text-slate-500 dark:text-white/50 uppercase tracking-widest">
                    {t.tokenRouterDesc}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Proof Section */}
      <section className="py-32 px-6 lg:px-12 bg-slate-50 dark:bg-white/[0.02] border-y border-corporate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-[0.9] dark:text-white">
              {lang === 'en' ? 'Data Privacy as a' : 'Privacidad de Datos como una'} <br />
              <span className="text-blue-600">{lang === 'en' ? 'Non-Negotiable' : 'Innegociable'}</span>
            </h2>
            <p className="text-lg font-medium text-slate-500 dark:text-white/60 uppercase tracking-wider">
              {lang === 'en' 
                ? 'Your proprietary logic and corporate documents never touch the public internet. We implement a Zero Data Retention (ZDR) infrastructure for all Mexico-based SMEs.'
                : 'Tu lógica propietaria y documentos corporativos nunca tocan el internet público. Implementamos una infraestructura de Retención de Datos Cero (ZDR) para todas las PyMEs.'}
            </p>
            <ul className="space-y-4 pt-4">
               {[
                 lang === 'en' ? 'End-to-End Encryption' : 'Encriptación de Punto a Punto',
                 lang === 'en' ? 'ISO 27001 Certified Nodes' : 'Nodos Certificados ISO 27001',
                 lang === 'en' ? 'Local Mexican Compliance' : 'Cumplimiento Local Mexicano'
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest dark:text-white">
                   <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                     <ShieldCheck size={16} />
                   </div>
                   {item}
                 </li>
               ))}
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full" />
              <div className="relative z-10 w-full h-full bg-white dark:bg-corporate-900 rounded-[4rem] border border-corporate-200 dark:border-white/10 shadow-2xl flex items-center justify-center p-12">
                 <motion.div 
                   transition={{ duration: 0 }}
                   className="absolute inset-0 border-4 border-dashed border-blue-600/20 rounded-[4rem]" 
                 />
                 <Lock size={120} className="text-blue-600 drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="support">
        <SupportFooter />
      </div>

      <TrialEndedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onViewPricing={onStartSession} // Redirect to app session
      />
    </div>
  );
};
