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
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Clock, Zap, Image, Presentation } from 'lucide-react';
import { DailyQuota, hoursUntilMexicoMidnight, isMayPromoActive, MAY_2026_PROMO } from '../lib/quotaManager';

interface EcoModeBannerProps {
  quota: DailyQuota | null;
  ecoModeActive: boolean;
  tokenPercent: number;
  multimediaRemaining: number;
  isSuperAdmin?: boolean;
}

export function EcoModeBanner({
  quota,
  ecoModeActive,
  tokenPercent,
  multimediaRemaining,
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
            mx-4 mt-3 mb-1 px-4 py-3 rounded-2xl border
            flex items-center justify-between gap-3 flex-wrap
            ${ecoModeActive
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-700/50'
              : 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-800/40'
            }
          `}>
            {/* Left: icon + label */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`
                w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                ${ecoModeActive ? 'bg-amber-500/20' : 'bg-blue-500/20'}
              `}>
                <Leaf
                  size={16}
                  className={ecoModeActive ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600'}
                />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-black uppercase tracking-widest leading-tight ${
                  ecoModeActive ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {ecoModeActive
                    ? '♻️ Modo Eco Activo: Optimizando tu suscripción'
                    : `⚡ Neural Budget — ${100 - tokenPercent}% disponible`
                  }
                </p>
                {ecoModeActive && (
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">
                    Usando modelos eficientes · Reset en ~{hoursLeft}h (00:00 MX)
                  </p>
                )}
              </div>
            </div>

            {/* Center: stats */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Token bar */}
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-slate-400 shrink-0" />
                <div className="w-20 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tokenPercent >= 90 ? 'bg-amber-500' :
                      tokenPercent >= 60 ? 'bg-yellow-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(tokenPercent, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                  {quota ? `${(quota.tokensUsed / 1000).toFixed(0)}K/${(quota.tokensLimit / 1000).toFixed(0)}K` : '—'}
                </span>
              </div>

              {/* Multimedia credits */}
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Image size={11} />
                <span>{multimediaRemaining}</span>
                <span className="text-slate-400">créditos</span>
              </div>

              {/* Hours until reset */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock size={11} />
                <span>~{hoursLeft}h</span>
              </div>
            </div>

            {/* Right: May promo badge */}
            {mayPromo && (
              <div className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                🎉 -{Math.round(MAY_2026_PROMO.discount * 100)}% Mayo
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
