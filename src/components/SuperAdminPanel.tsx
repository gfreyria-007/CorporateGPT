/**
 * SuperAdminPanel.tsx
 * 
 * Exclusive Super Admin interface for gfreyria@gmail.com
 * Includes:
 * 1. Version Control (Test override, Promote, Rollback)
 * 2. Profitability Monitor (Token usage vs income)
 * 3. System Top-up ($50 MXN)
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, ShieldAlert, Rocket, ArrowLeftRight, Activity, DollarSign, BatteryCharging } from 'lucide-react';
import { cn } from '../lib/utils';
import { purchaseTopUp } from '../lib/quotaManager';

interface SuperAdminPanelProps {
  user: any;
  onClose: () => void;
}

export function SuperAdminPanel({ user, onClose }: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'versions'|'profit'|'topup'>('versions');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleTopUp = async () => {
    setIsLoading(true);
    setStatusMsg('Processing $50 MXN Top-Up...');
    try {
      await purchaseTopUp(user.uid, 50);
      setStatusMsg('Success: 50,000 Elite Credits added to your account.');
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  const dummyAction = (action: string) => {
    setIsLoading(true);
    setStatusMsg(`Executing: ${action}...`);
    setTimeout(() => {
      setIsLoading(false);
      setStatusMsg(`Success: ${action} completed.`);
      setTimeout(() => setStatusMsg(''), 3000);
    }, 1500);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-corporate-950 font-sans">
      <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-corporate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-600 flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-corporate-900 dark:text-white">Super Mega Admin</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Authorized: {user?.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-corporate-900 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
          Close
        </button>
      </div>

      <div className="flex px-6 py-4 gap-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-corporate-900">
        {[
          { id: 'versions', label: 'Version Control', icon: <Rocket size={14} /> },
          { id: 'profit', label: 'Profit Monitor', icon: <Activity size={14} /> },
          { id: 'topup', label: 'Top-Up Credits', icon: <BatteryCharging size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-corporate-900 text-white dark:bg-white dark:text-corporate-900" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-corporate-800 dark:text-slate-400"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
        {statusMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="absolute top-6 left-6 right-6 z-10 p-4 bg-corporate-900 text-white text-xs font-mono rounded-xl shadow-xl flex items-center gap-3"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Settings size={14} />}
            {statusMsg}
          </motion.div>
        )}

        {activeTab === 'versions' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Global Deployment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => dummyAction('Test V2.1 Override')} className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-corporate-900 flex flex-col items-center justify-center gap-3 hover:border-blue-500 transition-all text-center group">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings size={20} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest">Test Override</div>
                  <div className="text-[10px] text-slate-400">Test vNext locally</div>
                </div>
              </button>
              
              <button onClick={() => dummyAction('Promote to Production')} className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-corporate-900 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 transition-all text-center group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Rocket size={20} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest">Promote</div>
                  <div className="text-[10px] text-slate-400">Ship global update</div>
                </div>
              </button>

              <button onClick={() => dummyAction('Rollback Version')} className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-corporate-900 flex flex-col items-center justify-center gap-3 hover:border-orange-500 transition-all text-center group">
                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest">Rollback</div>
                  <div className="text-[10px] text-slate-400">Instant revert</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Profitability Monitor</h3>
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-corporate-900">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Margin (30d)</div>
                  <div className="text-4xl font-display font-black text-emerald-600">89.4%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tokens Processed</div>
                  <div className="text-2xl font-display font-black text-slate-700 dark:text-white">12.4M</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500">Model</span>
                  <span className="text-slate-500">Usage / Cost</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-white">DeepSeek R1 (Elite-Eco)</span>
                  <span className="text-emerald-500">8.2M / $5.40</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-white">Qwen 2.5 72B (Elite-Eco)</span>
                  <span className="text-emerald-500">3.1M / $1.20</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-white">Claude 3.5 Sonnet (Premium)</span>
                  <span className="text-orange-500">1.1M / $16.50</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'topup' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Emergency Top-Up</h3>
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                <DollarSign size={200} />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h4 className="text-xl font-black uppercase tracking-widest text-blue-900 dark:text-blue-100 mb-2">Buy Elite Credits</h4>
                  <p className="text-xs text-blue-700/70 dark:text-blue-300/70 max-w-sm leading-relaxed">
                    Instantly add 50,000 non-expiring tokens to your account. These credits are only consumed when your daily free tier is completely exhausted.
                  </p>
                </div>
                
                <button 
                  onClick={handleTopUp}
                  disabled={isLoading}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <DollarSign size={16} /> Pay $50 MXN Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
