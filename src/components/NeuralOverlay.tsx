import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface NeuralOverlayProps {
  isLoading: boolean;
  theme?: 'light' | 'dark';
}

export const NeuralOverlay: React.FC<NeuralOverlayProps> = ({ isLoading, theme = 'dark' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none overflow-hidden bg-corporate-950/20 backdrop-blur-[2px]">
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="neural-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      <div className="relative w-[600px] h-[600px] flex items-center justify-center">
        {/* Deep Background 3D Orbits */}
        <div className="absolute inset-0 flex items-center justify-center rotate-x-[60deg] rotate-y-[20deg]">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute border border-blue-500/10 rounded-full animate-[spin_20s_linear_infinite]"
              style={{ 
                width: 400 + i * 100, 
                height: 400 + i * 100,
                animationDuration: `${15 + i * 5}s`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
              }}
            />
          ))}
        </div>

        {/* Floating Geometric Particles (3D-like) */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              y: [0, -10, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute"
            style={{
              width: 120,
              height: 120,
              transform: `rotate(${i * 30}deg) translateY(-280px)`
            }}
          >
            <div className="w-4 h-4 bg-blue-400/20 border border-blue-400/40 rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </div>
          </motion.div>
        ))}

        {/* Central Neural Core */}
        <div className="relative z-20">
          {/* External Ring with Micro-text */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-24 border border-dashed border-blue-500/20 rounded-full"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "relative w-72 h-72 rounded-[3.5rem] border border-blue-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)]",
              theme === 'dark' ? "bg-corporate-950/90" : "bg-white/90"
            )}
          >
            {/* Animated Circuitry Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d="M10 50 L90 50 M50 10 L50 90 M20 20 L80 80 M80 20 L20 80" stroke="url(#line-grad)" strokeWidth="0.5" className="animate-[pulse_4s_infinite]" />
              {/* Data pulse nodes */}
              <circle cx="50" cy="50" r="1.5" fill="#3b82f6" className="animate-pulse" />
            </svg>

            {/* Shield and Primary Lock Icon */}
            <div className="relative">
              {/* Outer Shield Glow */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-10 border-2 border-blue-400 rounded-[2.5rem] filter blur-sm"
              />
              
              <div className="relative p-10 bg-blue-600/10 rounded-[3rem] border border-blue-500/40 backdrop-blur-xl group">
                <Lock size={64} className="text-blue-500 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                {/* Internal Shield Path */}
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] opacity-40" viewBox="0 0 100 100">
                  <path d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5Z" fill="none" stroke="#3b82f6" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Digital Scan Layer */}
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,#2563eb_50%,transparent_100%)] [background-size:100%_400%] animate-holographic-scan" />
          </motion.div>
        </div>

        {/* High-Fidelity Labels */}
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none drop-shadow-sm">SYS SECURITY: AI-ACTIVE [SECURED]</span>
          <div className="h-0.5 w-full bg-blue-500/20" />
        </div>
        
        <div className="absolute top-4 right-4 text-right flex flex-col gap-1">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">COGNITIVE OVERLAY: 2099 NEURAL NETS</span>
          <div className="h-0.5 w-1/2 ml-auto bg-blue-500/20" />
        </div>

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <div className="h-0.5 w-1/2 bg-blue-500/20" />
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">ENCRYPTION DEFENSE: LAYER 9 [ACTIVE]</span>
        </div>

        <div className="absolute bottom-4 right-4 text-right flex flex-col gap-1">
          <div className="h-0.5 w-full bg-blue-500/20" />
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">NEURAL ENHANCEMENT: 98% SYNC</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
