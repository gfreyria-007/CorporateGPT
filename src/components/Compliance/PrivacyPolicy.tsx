import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, X, Users, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PrivacyPolicyProps {
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose, theme }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-slate-900/60",
      )}
    >
      <div className={cn(
        "w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem] border shadow-2xl transition-colors duration-500",
        theme === 'dark' ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"
      )}>
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Privacy & Compliance</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Data Protection Standards (GDPR / CCPA / LFPDPPP)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar font-sans">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Lock size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">1. Data Sovereignty</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              CorporateGPT (Catalizia) enforces strict data sovereignty. Your prompts and documents are processed in real-time and are **NOT used for training** underlying AI models, as we utilize enterprise-grade API tiers. We adhere to the highest security standards to ensure your corporate intelligence remains yours.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Users size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">2. Age Restriction & Eligibility</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              This service is intended strictly for professional and business use. You must be **18 years or older** to access CorporateGPT. The application is not directed toward or intended to be accessed by individuals under the age of 18.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Globe size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">3. International Compliance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-inherit">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">EU (GDPR)</h4>
                <p className="text-[9px] font-bold text-slate-400">Right to access, rectification, and erasure (Right to be forgotten). Data residency options available.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-inherit">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">USA (CCPA/CPRA)</h4>
                <p className="text-[9px] font-bold text-slate-400">Notice at collection, right to opt-out of "sale" (we never sell data), and non-discrimination.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-inherit">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">MEXICO (LFPDPPP)</h4>
                <p className="text-[9px] font-bold text-slate-400">Cumplimiento con Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Eye size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">4. Transparency & Rights</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Users have the right to request a full dump of their stored data or request immediate deletion of their account and all associated chat histories. All data transmission is encrypted using industry-standard TLS 1.3.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <FileText size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">5. Retention Policy</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Chat histories are stored for the duration of the user's account session to provide context. Long-term archival is handled within the user's dedicated Firebase instance, isolated from other tenants.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <XCircle size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">6. Prohibited Use Policy</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Users agree to comply with Google's Generative AI Prohibited Use Policy. Prohibited activities include, but are not limited to: creating harmful content (hate speech, harassment, sexually explicit), generating instructions for illegal acts, or attempting to replicate/reverse-engineer the underlying models.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-inherit bg-slate-50 dark:bg-white/2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-[10px] font-bold text-slate-400">
            Última actualización: 28 de Abril, 2026<br />
            © Catalizia Corp. All rights reserved.
          </div>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </motion.div>
  );
};
