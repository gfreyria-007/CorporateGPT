import React from 'react';
import { motion } from 'framer-motion';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: {
    apiKeyLength: number;
    userRole: string;
    subscription: string;
    lastError?: string;
    browser: string;
    firebaseInitialized: boolean;
  };
}

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose, systemInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Panel de Diagnóstico Techie 🛠️</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">API Key Gemini</span>
              <span className="text-sm font-bold text-blue-900">{systemInfo.apiKeyLength > 0 ? `ACTIVA (${systemInfo.apiKeyLength} chars)` : 'MISSING ❌'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rol de Usuario</span>
              <span className="text-sm font-bold text-blue-900 uppercase">{systemInfo.userRole}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Suscripción</span>
              <span className="text-sm font-bold text-blue-900 uppercase">{systemInfo.subscription}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Firebase</span>
              <span className="text-sm font-bold text-green-600 uppercase">{systemInfo.firebaseInitialized ? 'CONECTADO ✅' : 'ERROR ❌'}</span>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Último Error Registrado</span>
            <div className="text-xs font-mono text-red-400 overflow-y-auto max-h-32">
              {systemInfo.lastError || 'No se han detectado errores críticos en esta sesión.'}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Prueba de Sonido</span>
              <span className="text-xs text-blue-900 font-bold uppercase">Verifica tus parlantes</span>
            </div>
            <button 
              onClick={() => {
                import('../utils/gameAudio').then(m => m.playLevelUpSound());
              }}
              className="bg-white text-blue-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-200 shadow-sm active:scale-95 transition-all"
            >
              🔊 PROBAR
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-center uppercase tracking-[0.2em]">
            Entorno: {systemInfo.browser}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-blue-900 text-white py-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
        >
          Cerrar Diagnóstico
        </button>
      </motion.div>
    </div>
  );
};

export default DiagnosticsModal;
