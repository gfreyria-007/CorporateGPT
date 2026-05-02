/**
 * EcoModeBanner.tsx — Corporate GPT V2
 *
 * Shows a premium-looking but clear "Eco Mode Active" notification
 * when the user's daily token budget is exhausted.
 *
 * Features:
 *  - Token usage progress bar
 *  - Multimedia credits remaining
 *  - Hours until next reset (Mexico midnight)
 *  - May 2026 promo discount badge if active
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Clock, Zap, Image, Presentation } from 'lucide-react';
import { DailyQuota, hoursUntilMexicoMidnight, isMayPromoActive, MAY_2026_PROMO } from '../lib/quotaManager';

interface EcoModeBannerProps {
  quota: DailyQuota | null;
  ecoModeActive: boolean;
  tokenPercent: number;
  multimediaRemaining: number;
  lang?: 'en' | 'es';
  isSuperAdmin?: boolean;
}

export function EcoModeBanner({
  quota,
  ecoModeActive,
  tokenPercent,
  multimediaRemaining,
  lang = 'es',
  isSuperAdmin = false,
}: EcoModeBannerProps) {
  const hoursLeft = Math.ceil(hoursUntilMexicoMidnight());
  const mayPromo = isMayPromoActive();

  return (
    <AnimatePresence>
      {(ecoModeActive || (isSuperAdmin && quota)) && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full overflow-hidden"
        >
          <div className={`
            mx-4 mt-3 mb-1 px-5 py-4 rounded-[1.5rem] border
            flex flex-col gap-4
            ${ecoModeActive
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-500/30 shadow-lg shadow-amber-500/5'
              : 'bg-blue-50 border-blue-100 dark:bg-slate-900/80 dark:border-white/10 backdrop-blur-xl shadow-lg shadow-blue-500/5'
            }
          `}>
            {/* Top: icon + label */}
            <div className="flex items-center gap-3.5">
              <div className={`
                w-10 h-10 rounded-[0.9rem] flex items-center justify-center shrink-0 shadow-sm
                ${ecoModeActive ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}
              `}>
                <Leaf size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-[12px] font-black uppercase tracking-[0.15em] leading-none ${
                  ecoModeActive ? 'text-amber-800 dark:text-amber-400' : 'text-blue-800 dark:text-white'
                }`}>
                  {ecoModeActive
                    ? 'Eco Mode Active'
                    : 'Neural Budget'
                  }
                  <span className={`ml-2 opacity-60 font-bold ${ecoModeActive ? 'text-amber-600' : 'text-blue-500 dark:text-blue-400'}`}>
                    — {100 - tokenPercent}% {lang === 'es' ? 'Disponible' : 'Available'}
                  </span>
                </p>
                {ecoModeActive && (
                  <p className="text-[10px] font-bold text-amber-700/60 dark:text-amber-400/50 mt-1.5 uppercase tracking-widest">
                    {lang === 'es' ? 'Optimizando recursos' : 'Optimizing resources'}
                  </p>
                )}
              </div>
              
              {/* Reset Clock */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
                <Clock size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reset in ~{hoursLeft}h</span>
              </div>
            </div>

            {/* Bottom: Progress + Credits */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-black/5 dark:border-white/5">
               <div className="flex items-center gap-4 flex-1">
                  <div className="w-full max-w-[140px] h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(tokenPercent, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ${
                        tokenPercent >= 90 ? 'bg-amber-500' :
                        tokenPercent >= 60 ? 'bg-yellow-400' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 font-mono tracking-tighter">
                    {quota ? `${(quota.tokensUsed / 1000).toFixed(0)}K/${(quota.tokensLimit / 1000).toFixed(0)}K` : '—'}
                  </span>
               </div>

               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                      <Image size={12} className="text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black leading-none dark:text-white">{multimediaRemaining}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{lang === 'es' ? 'Créditos' : 'Credits'}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
