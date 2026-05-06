/**
 * MonthlyQuotaBanner.tsx — Techie Tutor
 *
 * Shows a user-friendly monthly quota usage display with a progress bar.
 * Designed to be less stressful than numeric displays.
 *
 * Features:
 *  - Monthly token usage progress bar
 *  - Clean, non-stressful design
 *  - Usage vs budget visualization
 *  - Remaining budget indicator
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface MonthlyQuotaBannerProps {
  userProfile: UserProfile | null;
  monthlyCostUsed: number;
  monthlyBudget: number;
  lang?: 'en' | 'es';
}

export function MonthlyQuotaBanner({
  userProfile,
  monthlyCostUsed,
  monthlyBudget,
  lang = 'es',
}: MonthlyQuotaBannerProps) {
  const usagePercent = Math.min((monthlyCostUsed / monthlyBudget) * 100, 100);
  const remainingBudget = Math.max(monthlyBudget - monthlyCostUsed, 0);
  
  // Determine status and styling
  const isOverBudget = monthlyCostUsed >= monthlyBudget;
  const isNearLimit = usagePercent >= 80 && !isOverBudget;
  const isModerateUsage = usagePercent >= 50 && usagePercent < 80;
  
  const getStatusConfig = () => {
    if (isOverBudget) {
      return {
        color: 'red',
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-950/60 dark:border-red-500/30',
        progressColor: 'bg-red-500',
        textColor: 'text-red-800 dark:text-red-400',
        iconColor: 'bg-red-500 text-white',
        statusText: lang === 'es' ? 'Límite Alcanzado' : 'Limit Reached',
        description: lang === 'es' ? 'Renueva tu plan para continuar' : 'Renew your plan to continue',
      };
    }
    
    if (isNearLimit) {
      return {
        color: 'amber',
        bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-500/30',
        progressColor: 'bg-amber-500',
        textColor: 'text-amber-800 dark:text-amber-400',
        iconColor: 'bg-amber-500 text-white',
        statusText: lang === 'es' ? 'Casi Alcanzado' : 'Almost Reached',
        description: lang === 'es' ? 'Considera renovar tu plan' : 'Consider renewing your plan',
      };
    }
    
    if (isModerateUsage) {
      return {
        color: 'yellow',
        bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/60 dark:border-yellow-500/30',
        progressColor: 'bg-yellow-500',
        textColor: 'text-yellow-800 dark:text-yellow-400',
        iconColor: 'bg-yellow-500 text-white',
        statusText: lang === 'es' ? 'Uso Moderado' : 'Moderate Usage',
        description: lang === 'es' ? 'Buen ritmo de consumo' : 'Good usage pace',
      };
    }
    
    return {
      color: 'blue',
      bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-500/30',
      progressColor: 'bg-blue-500',
      textColor: 'text-blue-800 dark:text-blue-400',
      iconColor: 'bg-blue-500 text-white',
      statusText: lang === 'es' ? 'Uso Normal' : 'Normal Usage',
      description: lang === 'es' ? 'Consumo óptimo' : 'Optimal consumption',
    };
  };
  
  const statusConfig = getStatusConfig();
  
  return (
    <AnimatePresence>
      {userProfile && (
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
            ${statusConfig.bgColor}
            shadow-lg shadow-${statusConfig.color}-500/5
          `}>
            {/* Top: icon + label */}
            <div className="flex items-center gap-3.5">
              <div className={`
                w-10 h-10 rounded-[0.9rem] flex items-center justify-center shrink-0 shadow-sm
                ${statusConfig.iconColor}
              `}>
                <DollarSign size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-[12px] font-black uppercase tracking-[0.15em] leading-none ${statusConfig.textColor}`}>
                  {statusConfig.statusText}
                  <span className={`ml-2 opacity-60 font-bold ${statusConfig.textColor}`}>
                    — {lang === 'es' ? 'Crédito Mensual' : 'Monthly Credit'}
                  </span>
                </p>
                <p className="text-[10px] font-bold text-gray-600/60 dark:text-gray-400/50 mt-1.5 uppercase tracking-widest">
                  {statusConfig.description}
                </p>
              </div>
              
              {/* Budget info */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
                <Calendar size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {lang === 'es' ? 'Mensual' : 'Monthly'}
                </span>
              </div>
            </div>

            {/* Progress + Budget Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-full max-w-[140px] h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isOverBudget ? 'bg-red-500' :
                      isNearLimit ? 'bg-amber-500' :
                      isModerateUsage ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 font-mono tracking-tighter">
                    ${monthlyCostUsed.toFixed(0)}/${monthlyBudget.toFixed(0)}
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {lang === 'es' ? 'Usado' : 'Used'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                      <TrendingUp size={12} className={statusConfig.textColor} />
                    </div>
                    <span className={`text-[10px] font-bold ${statusConfig.textColor}`}>
                      ${remainingBudget.toFixed(0)}
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {lang === 'es' ? 'Restante' : 'Remaining'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MonthlyQuotaBanner;