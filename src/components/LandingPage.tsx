import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { LandingEditor } from './LandingEditor';
import { PricingSection } from './PricingSection';
import { 
  ShieldCheck, Shield, Globe, Users, BrainCircuit, CheckCircle2, 
  SendHorizontal
} from 'lucide-react';
<<<<<<< Updated upstream
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import anime from 'animejs';

gsap.registerPlugin(ScrollTrigger);
=======
>>>>>>> Stashed changes

interface LandingPageProps {
  onStartSession: () => void;
  onSignInWithApple?: () => void;
  onSignInWithEmail?: (email: string) => void;
  isSigningIn: boolean;
  showTrialModal?: boolean;
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
  appConfig?: any;
  appMode?: 'corporate' | 'junior';
  isSuperAdmin?: boolean;
}

export const LandingPage = ({ 
  onStartSession, 
  onSignInWithApple, 
  onSignInWithEmail, 
  isSigningIn, 
  showTrialModal = false, 
  lang = 'es', 
  setLang, 
  appConfig, 
  appMode = 'corporate', 
  isSuperAdmin = false 
}: LandingPageProps) => {
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(showTrialModal);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (showTrialModal) setIsModalOpen(true);
  }, [showTrialModal]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden relative">
      <div className="absolute inset-0 bg-dot-pattern z-0 opacity-60 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <span className="font-black text-xl text-white">C</span>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-slate-800">{appMode === 'junior' ? 'Techie Tutor' : 'Catalizia'}</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Plataforma</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Ahorro</a>
            <a href="#plans" className="hover:text-blue-600 transition-colors">Planes</a>
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="hover:text-blue-600">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <button onClick={() => setShowEditor(true)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
                Edit
              </button>
            )}
            <button 
              onClick={onStartSession}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/20"
            >
              {isSigningIn ? '...' : 'Acceder'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 px-6 lg:px-12 z-10 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-widest"
          >
            <ShieldCheck size={16} /> TU ESPACIO DE INNOVACIÓN SEGURA
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
          >
            <span className="text-slate-900 block mb-2">{lang === 'es' ? 'EMPODERA' : 'EMPOWER'}</span>
            <span className="text-blue-600">{lang === 'es' ? 'TU EQUIPO' : 'YOUR TEAM'}</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-8 pt-8"
          >
            <div className="w-full max-w-2xl bg-white rounded-full p-2 pl-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Pregunta lo que sea a CorporateGPT...</span>
              <button onClick={onStartSession} className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md">
                <SendHorizontal size={20} className="ml-1" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <button onClick={onStartSession} className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] transition-all shadow-md">
                {lang === 'es' ? 'Comenzar Ahora' : 'Start Now'}
              </button>
              <button onClick={() => setShowAuthOptions(true)} className="px-8 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all shadow-sm">
                {lang === 'es' ? 'Opciones de Ingreso' : 'Sign In Options'}
              </button>
            </div>
            
            <AnimatePresence>
              {showAuthOptions && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-3 justify-center overflow-hidden"
                >
                  <button onClick={onStartSession} className="px-6 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">Google</button>
                  {onSignInWithApple && <button onClick={onSignInWithApple} className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">Apple</button>}
                  <button onClick={() => {
                    const email = prompt(lang === 'es' ? 'Ingresa tu correo electrónico:' : 'Enter your email:');
                    if (email && onSignInWithEmail) onSignInWithEmail(email);
                  }} className="px-6 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">Email</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <Shield size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-3">{lang === 'es' ? 'Privacidad Total' : 'Total Privacy'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {lang === 'es' ? 'Tus datos nunca entrenan modelos públicos. Seguridad ZDR garantizada.' : 'Your data never trains public models. Guaranteed ZDR security.'}
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <BrainCircuit size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-3">{lang === 'es' ? 'Eficiencia Real' : 'Real Efficiency'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {lang === 'es' ? 'Auto-enrutamiento inteligente hacia el mejor modelo para optimizar costos.' : 'Intelligent auto-routing to the best model to optimize costs.'}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
              <Globe size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-3">{lang === 'es' ? 'Valores Claros' : 'Clear Values'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {lang === 'es' ? 'Alineación total con la cultura y protocolos de tu empresa.' : 'Total alignment with your company culture and protocols.'}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-3">{lang === 'es' ? 'Filtros Junior' : 'Junior Filters'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {lang === 'es' ? 'Adaptabilidad académica para distintos niveles de experiencia.' : 'Academic adaptability for different experience levels.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section (Simplified for Light Theme) */}
      <section className="py-24 px-6 lg:px-12 relative z-10" id="pricing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-6">
              {lang === 'es' ? 'No es solo IA,' : 'Not just AI,'}<br/>
              <span className="text-blue-600">{lang === 'es' ? 'es control total.' : 'it\'s total control.'}</span>
            </h2>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-3 p-6 border-b border-slate-100 bg-slate-50 font-black uppercase text-[10px] sm:text-[12px] tracking-[0.2em] text-slate-500">
              <div>Característica</div>
              <div className="text-center text-blue-600">Catalizia</div>
              <div className="text-center">Estándar</div>
            </div>
            {[
              { feat: 'Google Gemini Models', catalizia: true, other: true },
              { feat: 'Privacidad Corporativa ZDR', catalizia: true, other: 'Parcial' },
              { feat: 'Techie Tutor (Adaptable)', catalizia: true, other: false },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 p-6 border-b border-slate-50 items-center hover:bg-slate-50 transition-colors">
                <div className="text-sm sm:text-base font-bold text-slate-700">{row.feat}</div>
                <div className="flex justify-center text-emerald-500"><CheckCircle2 size={24} /></div>
                <div className="flex justify-center text-slate-400 text-xs sm:text-sm font-black uppercase tracking-widest">
                  {row.other === false ? '-' : row.other === true ? <CheckCircle2 size={24} className="text-slate-300" /> : row.other}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="plans" className="relative z-10 bg-[#020617] pt-12 pb-12 rounded-t-[3rem] mt-12 shadow-2xl">
        <PricingSection />
        <SupportFooter />
      </div>

      <TrialEndedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onViewPricing={onStartSession} 
      />

      {showEditor && <LandingEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
};

