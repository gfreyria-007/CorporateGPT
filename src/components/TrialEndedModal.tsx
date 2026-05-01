import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';

interface TrialEndedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPricing: () => void;
}

export const TrialEndedModal = ({ isOpen, onClose, onViewPricing }: TrialEndedModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-corporate-950/80 backdrop-blur-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl bg-white dark:bg-corporate-900 rounded-[4rem] p-12 border border-blue-600/20 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.3)] relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 blur-[100px] -ml-32 -mb-32 rounded-full" />

            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all opacity-50 hover:opacity-100"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center space-y-10 relative z-10">
              <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 rotate-12">
                <AlertCircle size={48} />
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl lg:text-5xl font-display font-black tracking-tighter uppercase leading-[0.9]">
                  Prueba Gratuita <span className="text-blue-600">Agotada</span>
                </h3>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Has agotado tus consultas gratuitas. No dejes que tu equipo pierda el impulso. 
                  Adquiere una licencia hoy con el <span className="text-blue-600">50% de descuento</span> de lanzamiento.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full pt-6">
                <button 
                  onClick={onViewPricing}
                  className="w-full h-20 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4 group"
                >
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
                  Ver Planes de Licencia
                </button>
                <div className="flex items-center justify-center gap-2 px-6 py-2 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                   <Sparkles size={14} /> Oferta válida hasta el 31 de mayo
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
