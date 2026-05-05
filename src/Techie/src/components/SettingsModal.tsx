import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, SubscriptionLevel } from '../types';
import { db, doc, updateDoc } from '../../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
  onDeleteData: () => Promise<void>;
  onOpenFAQ: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userProfile, onProfileUpdate, onDeleteData, onOpenFAQ }) => {
  const [apiKey, setApiKey] = useState(userProfile.personalApiKey || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        personalApiKey: apiKey
      });
      onProfileUpdate({ ...userProfile, personalApiKey: apiKey });
      setMessage('✅ Configuración guardada correctamente.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error al guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSubLabel = (level?: SubscriptionLevel) => {
    switch (level) {
      case 'explorador': return 'Plan Explorador';
      case 'maestro': return 'Plan Maestro';
      case 'leyenda': return 'Plan Leyenda';
      case 'family_starter': return 'Familiar Starter ($199)';
      case 'family_mega': return 'Familiar Mega ($299)';
      case 'admin': return 'Plan Administrador';
      default: return 'Usuario CatalizIA';
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Mi Cuenta</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">✕</button>
          </div>

          <div className="space-y-6">
            {/* Subscription Info */}
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Plan Actual</label>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-[#1e3a8a] uppercase">{getSubLabel(userProfile.subscriptionLevel)}</span>
                <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest">Activo</span>
              </div>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                   Tu cuenta está sincronizada con el Hub Central de CatalizIA. Los créditos se gestionan automáticamente.
                </p>
            </div>

            {message && (
              <p className="text-center text-[10px] font-black uppercase tracking-widest animate-pulse">
                {message}
              </p>
            )}

            <div className="pt-2 text-center">
              <button 
                onClick={onOpenFAQ}
                className="text-[9px] text-blue-400 hover:text-blue-600 font-black uppercase tracking-widest underline decoration-2 underline-offset-2"
              >
                Nota sobre Privacidad y Aprendizaje
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <button 
                    onClick={() => {
                        if (window.confirm('🚨 ¿ESTÁS SEGURO? Esta acción borrará permanentemente todas tus medallas, historial y configuración de Techie. No se puede deshacer.')) {
                            onDeleteData();
                        }
                    }}
                    className="w-full text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors py-2"
                >
                    🗑️ Borrar mis datos y cuenta
                </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center">
          <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">Techie Tutor • ID: {userProfile.uid.slice(0, 8)}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
