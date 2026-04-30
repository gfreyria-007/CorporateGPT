import React from 'react';
import { BrainCircuit, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PPTStudioProps {
  onClose: () => void;
  isOpen: boolean;
}

const PPTStudio: React.FC<PPTStudioProps> = ({ onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0c10] flex flex-col items-center justify-center text-white">
      <button 
        onClick={onClose}
        className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]">
          <BrainCircuit size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Neural Studio 6.0</h2>
          <p className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.5em] opacity-50">Ground Zero - Ready for New Logic</p>
        </div>
      </div>
      
      <div className="mt-20 p-8 border border-white/5 bg-white/2 rounded-3xl max-w-md text-center">
        <p className="text-slate-500 text-sm leading-relaxed">
          El área de trabajo ha sido vaciada. Esperando nueva arquitectura de narrativa y visualización.
        </p>
      </div>
    </div>
  );
};

export default PPTStudio;
