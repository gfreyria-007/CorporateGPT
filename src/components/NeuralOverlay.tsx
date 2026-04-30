import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface NeuralOverlayProps {
  isLoading: boolean;
  theme?: 'light' | 'dark';
}

export const NeuralOverlay: React.FC<NeuralOverlayProps> = ({ isLoading, theme = 'dark' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none overflow-hidden bg-corporate-950/40 backdrop-blur-md">
      <div className="relative w-[600px] h-[600px] flex items-center justify-center">
        {/* Static Professional Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute border border-blue-500/20 rounded-full"
              style={{ 
                width: 300 + i * 150, 
                height: 300 + i * 150,
              }}
            />
          ))}
        </div>

        {/* Central Neural Core - Static and Sharp */}
        <div className="relative z-20">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "relative w-80 h-80 rounded-[3rem] border border-blue-500/30 flex flex-col items-center justify-center overflow-hidden shadow-2xl",
              theme === 'dark' ? "bg-corporate-950" : "bg-white"
            )}
          >
            {/* Professional Grid Background */}
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="relative p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/20 backdrop-blur-xl mb-6">
              <Lock size={48} className="text-blue-500" />
            </div>

            <div className="text-center space-y-2 px-8">
              <h2 className={cn(
                "text-xs font-black uppercase tracking-[0.3em]",
                theme === 'dark' ? "text-white" : "text-slate-900"
              )}>
                Neural Processing
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest">
                  Secure Data Pipeline
                </span>
              </div>
            </div>

            {/* Subtle Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600/10">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              />
            </div>
          </motion.div>
        </div>

        {/* Static Telemetry Labels */}
        <div className="absolute top-12 left-12 flex flex-col gap-1 opacity-40">
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Pipeline: Encrypted</span>
        </div>
        
        <div className="absolute bottom-12 right-12 text-right flex flex-col gap-1 opacity-40">
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Auth: Verified</span>
        </div>
      </div>
    </div>
  );
};
