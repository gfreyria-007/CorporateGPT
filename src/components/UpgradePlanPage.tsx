import React from 'react';
import { motion } from 'framer-motion';
import { PricingSection } from './PricingSection';
import { X, ShieldCheck, Zap, ArrowRight, Shield } from 'lucide-react';

interface UpgradePlanPageProps {
  onClose: () => void;
  lang: 'en' | 'es';
}

export const UpgradePlanPage = ({ onClose, lang }: UpgradePlanPageProps) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-black overflow-y-auto">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-blue-600/10 dark:bg-blue-600/20 blur-[100px] rounded-full -mr-[10vw] -mt-[10vw]" />
         <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full -ml-[10vw] -mb-[10vw]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-32">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">
                <Shield size={20} />
             </div>
             <h1 className="text-xl font-display font-black tracking-tight uppercase dark:text-white">
                {lang === 'en' ? 'Upgrade Plan' : 'Subir de Nivel'}
             </h1>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-corporate-900 dark:hover:text-white rounded-full flex items-center justify-center transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em]"
           >
             <Zap size={14} /> {lang === 'en' ? 'Unlock Full Power' : 'Desbloquea Todo el Poder'}
           </motion.div>
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-[0.9] uppercase text-corporate-900 dark:text-white"
           >
             {lang === 'en' ? 'You experienced the pipeline.' : 'Ya probaste el pipeline.'}<br/>
             <span className="text-blue-600">{lang === 'en' ? 'Now own it.' : 'Ahora domínalo.'}</span>
           </motion.h2>
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-sm md:text-base font-bold text-slate-500 dark:text-white/60 leading-relaxed uppercase tracking-wider"
           >
             {lang === 'en' 
               ? 'Upgrade your workspace to access unlimited Elite-Eco models, Nano Banana Studio credits, and ZDR privacy for your entire team.' 
               : 'Sube de nivel tu espacio de trabajo para acceder a modelos Elite-Eco ilimitados, créditos de Nano Banana Studio y privacidad ZDR para todo tu equipo.'}
           </motion.p>
        </div>

        {/* Pricing Section connects to Stripe and Top Up */}
        <PricingSection />

      </div>
    </div>
  );
};
