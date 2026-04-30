import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { PricingSection } from './PricingSection';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { 
  ShieldCheck, Shield, CheckCircle2, ChevronRight, Zap, Globe, Sparkles, Coins, 
  Cpu, Lock, MousePointer2, MessageSquare, Presentation, Palette, Database,
  AlertTriangle, Users, BarChart3, Fingerprint, Crosshair, Target, XCircle, FileWarning
} from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onStartSession: () => void;
  isSigningIn: boolean;
  showTrialModal?: boolean;
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
  appConfig?: any;
  appMode?: 'corporate' | 'junior';
}

export const LandingPage = ({ onStartSession, isSigningIn, showTrialModal = false, lang, setLang, appConfig, appMode = 'corporate' }: LandingPageProps) => {
  const t = translations[lang] || translations.es;
  const [isModalOpen, setIsModalOpen] = useState(showTrialModal);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTrialModal) {
      setIsModalOpen(true);
    }
  }, [showTrialModal]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Problem section grid items
    gsap.from('.problem-card', {
      scrollTrigger: {
        trigger: '.problem-section',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    // Solution bento grid items
    gsap.from('.solution-card', {
      scrollTrigger: {
        trigger: '.solution-section',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    });

    // Products section
    gsap.from('.product-card', {
      scrollTrigger: {
        trigger: '.product-section',
        start: 'top 80%',
      },
      scale: 0.95,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power4.out'
    });

    // Table section
    gsap.from('.comparison-row', {
      scrollTrigger: {
        trigger: '.comparison-table',
        start: 'top 85%',
      },
      x: -50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-black font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Navigation */}
      <nav className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-[100] bg-black/80 backdrop-blur-3xl border-b border-white/[0.05]">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10 backdrop-blur-md border border-white/20 transition-all">
             C
          </div>
          <h1 className="text-lg lg:text-xl font-display font-black tracking-tight uppercase text-white">
             Catalizia
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
          <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hover:text-white transition-colors">Plataforma</a>
          <a href="#economics" className="hover:text-white transition-colors">Ahorro y Control</a>
          <a href="#support" className="hover:text-white transition-colors">Soporte</a>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <button 
            onClick={onStartSession}
            disabled={isSigningIn}
            className="px-4 lg:px-6 h-10 lg:h-12 bg-white text-black rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? '...' : 'Iniciar Sesión'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 overflow-hidden bg-[#020205]">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 blur-[150px] rounded-full" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/10 blur-[150px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 mb-20">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] text-slate-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/[0.08] backdrop-blur-3xl shadow-2xl"
            >
              <AlertTriangle size={14} className="text-amber-400" /> La IA sin control no es innovación. Es riesgo.
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-[5.5rem] font-display font-black tracking-tighter leading-[0.95] text-white"
            >
              Controla toda tu IA desde<br/>un solo lugar.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                Sin riesgos. Sin desperdicio.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="max-w-3xl text-sm md:text-lg text-slate-400 font-medium leading-relaxed"
            >
              Unifica GPT, Claude y más en una plataforma segura que protege tus datos sensibles, optimiza costos automáticamente y escala con tu empresa.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto"
            >
              <button 
                onClick={onStartSession}
                className="px-8 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
              >
                🚀 Empezar Gratis
              </button>
              <button 
                onClick={onStartSession}
                className="px-8 py-4 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/[0.1] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                🏢 Ver demo Enterprise
              </button>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-4 flex items-center gap-2"
            >
              <CheckCircle2 size={12} className="text-blue-500"/> Sin tarjeta 
              <span className="opacity-30">•</span> 
              <CheckCircle2 size={12} className="text-blue-500"/> Setup en 2 minutos 
              <span className="opacity-30">•</span> 
              <CheckCircle2 size={12} className="text-blue-500"/> Control total desde el día 1
            </motion.p>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-24 px-6 lg:px-12 bg-black border-y border-white/[0.05] problem-section" id="solutions">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4">Hoy usar IA en tu empresa es un caos</h2>
            <p className="text-slate-400 text-lg">La falta de gobierno está generando riesgos invisibles y fugas de presupuesto.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="problem-card p-8 rounded-3xl bg-red-950/10 border border-red-500/10 hover:border-red-500/30 transition-all">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-6"><Users size={24} /></div>
                <h4 className="text-lg font-black text-white mb-2">Herramientas Dispersas</h4>
                <p className="text-slate-400 text-sm">Cada equipo contrata y usa herramientas distintas. No hay un estándar.</p>
             </div>
             <div className="problem-card p-8 rounded-3xl bg-amber-950/10 border border-amber-500/10 hover:border-amber-500/30 transition-all">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-6"><FileWarning size={24} /></div>
                <h4 className="text-lg font-black text-white mb-2">Fuga de Datos Sensibles</h4>
                <p className="text-slate-400 text-sm">Nadie controla qué documentos confidenciales se comparten en prompts públicos.</p>
             </div>
             <div className="problem-card p-8 rounded-3xl bg-blue-950/10 border border-blue-500/10 hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6"><BarChart3 size={24} /></div>
                <h4 className="text-lg font-black text-white mb-2">Costos Incontrolables</h4>
                <p className="text-slate-400 text-sm">Pagas suscripciones mensuales sin usar el límite y los gastos crecen sin explicación.</p>
             </div>
             <div className="problem-card p-8 rounded-3xl bg-purple-950/10 border border-purple-500/10 hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6"><Target size={24} /></div>
                <h4 className="text-lg font-black text-white mb-2">Cero Visibilidad</h4>
                <p className="text-slate-400 text-sm">Falta de trazabilidad. Es imposible saber quién usa qué, ni para qué tareas.</p>
             </div>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 flex items-center gap-4">
             <AlertTriangle className="text-red-400 shrink-0" />
             <p className="text-white font-medium"><strong>👉 Resultado inevitable:</strong> Exposición a riesgos de seguridad + Dinero perdido en suscripciones zombis.</p>
          </div>
        </div>
      </section>

      {/* THE SOLUTION & VALUE CLEAR SECTION */}
      <section className="py-24 px-6 lg:px-12 bg-[#020205] relative solution-section" id="economics">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
             <div className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                La Solución
             </div>
             <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-6">
                Catalizia pone orden donde <br className="hidden lg:block"/> hoy hay improvisación
             </h2>
             <p className="text-xl text-slate-400 max-w-2xl">
                Reduce costos y elimina riesgos desde el primer día. No es otra herramienta de IA, es el control operativo definitivo sobre tu Inteligencia Artificial.
             </p>
          </div>

          {/* Value Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
             <div className="solution-card p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between hover:bg-white/[0.04] transition-colors group">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform"><Coins size={24} /></div>
                <div>
                   <h4 className="text-4xl font-black text-white mb-3">-70% Gasto</h4>
                   <p className="text-slate-400 text-sm font-medium">Gasto en IA drásticamente reducido gracias a nuestro routing inteligente. El sistema elige el modelo más eficiente por tarea.</p>
                </div>
             </div>
             
             <div className="solution-card p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between hover:bg-white/[0.04] transition-colors group">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
                <div>
                   <h4 className="text-4xl font-black text-white mb-3">0 Fugas</h4>
                   <p className="text-slate-400 text-sm font-medium">Cero fuga de datos sensibles fuera de tu entorno. Tus datos son tuyos y no alimentan modelos de terceros.</p>
                </div>
             </div>

             <div className="solution-card p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between hover:bg-white/[0.04] transition-colors group">
                <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20 mb-6 group-hover:scale-110 transition-transform"><Target size={24} /></div>
                <div>
                   <h4 className="text-4xl font-black text-white mb-3">100% Visión</h4>
                   <p className="text-slate-400 text-sm font-medium">Visibilidad total de uso por usuario, equipo o proyecto. Centraliza los accesos y adáptalos a cada departamento.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS (REPOSITIONED) */}
      <section className="py-24 px-6 lg:px-12 bg-black border-t border-white/[0.05] product-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-white tracking-tight mb-4">Un solo motor. Dos entornos.</h2>
             <p className="text-slate-400 text-lg">Poder y seguridad adaptados al contexto de uso.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enterprise Core */}
            <div className="product-card group relative rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] transition-all duration-500 flex flex-col">
              <div className="relative h-64 w-full bg-black/40 border-b border-white/[0.05] overflow-hidden flex items-end justify-center px-8 pt-12">
                 <div className="w-full h-full bg-[#0a0a0f] rounded-t-2xl border-x border-t border-white/10 shadow-[0_-20px_50px_rgba(37,99,235,0.1)] relative overflow-hidden flex transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-20 lg:w-24 h-full border-r border-white/5 p-4 flex flex-col gap-4 bg-white/[0.02]">
                       <div className="w-full h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30"><Shield size={20} className="text-blue-400"/></div>
                       <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-center"><Database size={20} className="text-white/20"/></div>
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                       <div className="flex gap-3 items-center mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Cpu size={14} className="text-blue-400"/></div>
                          <div className="h-2 w-24 bg-white/20 rounded-full" />
                       </div>
                       <div className="h-16 w-full bg-white/[0.03] rounded-xl border border-white/5 p-4"><div className="h-2 w-full bg-white/10 rounded-full"/></div>
                       <div className="h-16 w-full bg-white/[0.03] rounded-xl border border-white/5 p-4"><div className="h-2 w-3/4 bg-white/10 rounded-full"/></div>
                    </div>
                 </div>
              </div>
              <div className="p-10 lg:p-12 z-20 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">Catalizia Enterprise Core</h3>
                  <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Gobernanza Completa • Integraciones</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                  Ideal para equipos, operaciones y liderazgo. Seguridad avanzada de grado bancario (Zero-Data Retention) y control administrativo para escalar IA en toda la empresa.
                </p>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-blue-400"/> Gestión de roles y permisos</li>
                   <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-blue-400"/> Análisis de documentos privados</li>
                   <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-blue-400"/> Conexión con bases de datos</li>
                </ul>
              </div>
            </div>

            {/* Safe Learning */}
            <div className="product-card group relative rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] transition-all duration-500 flex flex-col">
              <div className="relative h-64 w-full bg-black/40 border-b border-white/[0.05] overflow-hidden flex items-end justify-center px-8 pt-12">
                 <div className="w-full h-full bg-[#0a0f0d] rounded-t-2xl border-x border-t border-white/10 shadow-[0_-20px_50px_rgba(16,185,129,0.1)] relative overflow-hidden transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-full h-16 bg-emerald-950/20 border-b border-emerald-500/10 p-4 flex items-center justify-between">
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"><Sparkles size={14} className="text-emerald-400"/></div>
                       </div>
                    </div>
                    <div className="p-6 space-y-4">
                       <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center"><Zap size={18} className="text-white"/></div>
                          <div className="h-16 w-3/4 bg-emerald-500/10 rounded-2xl rounded-tl-sm border border-emerald-500/20 p-4">
                             <div className="h-2 w-full bg-emerald-400/40 rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-10 lg:p-12 z-20 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">Catalizia Safe Learning AI</h3>
                  <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Pedagogía Socrática • Sandbox</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                  Ideal para educación, training corporativo y menores. Un entorno de aprendizaje que guía en lugar de dar respuestas hechas, bloqueando contenido inapropiado.
                </p>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-emerald-400"/> Filtros de seguridad impenetrables</li>
                   <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-emerald-400"/> Respuestas guiadas paso a paso</li>
                   <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-emerald-400"/> Bloqueo de fuga de PII</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR TABLE */}
      <section className="py-24 px-6 lg:px-12 bg-[#020205] border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">Mientras otros te dan acceso,<br/> nosotros te damos control.</h2>
             <p className="text-slate-400">Diseñado para equipos que no pueden fallar (Marketing, Operaciones, Legal).</p>
          </div>

          <div className="comparison-table rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
             <div className="grid grid-cols-3 bg-white/[0.02] border-b border-white/10 p-6 font-black uppercase text-xs tracking-widest text-slate-400">
                <div>Característica</div>
                <div className="text-center text-blue-400">Catalizia</div>
                <div className="text-center">Otras IA</div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
                <div className="font-bold text-white text-sm">Acceso Multi-modelo</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-400" /></div>
                <div className="flex justify-center"><XCircle className="text-red-500/50" /></div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
                <div className="font-bold text-white text-sm">Control de Privacidad / Datos</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-400" /></div>
                <div className="flex justify-center"><AlertTriangle className="text-amber-500" /></div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
                <div className="font-bold text-white text-sm">Routing y Optimización de Costos</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-400" /></div>
                <div className="flex justify-center"><XCircle className="text-red-500/50" /></div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 hover:bg-white/[0.02] transition-colors items-center">
                <div className="font-bold text-white text-sm">Gobierno por Equipo / Accesos</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-400" /></div>
                <div className="flex justify-center"><XCircle className="text-red-500/50" /></div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing / Scaling CTA */}
      <div className="bg-black border-t border-white/[0.05]">
         <PricingSection />
      </div>

      {/* FINAL CTA (CIERRE FUERTE) */}
      <section className="py-32 px-6 lg:px-12 bg-gradient-to-b from-black to-[#0a0f1c] border-t border-white/[0.05] relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-8">
               Si tu empresa usa IA sin control,<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">ya tienes un riesgo activo.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-12">Empieza hoy y toma control total de la infraestructura de Inteligencia Artificial de tu organización.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                  onClick={onStartSession}
                  className="px-8 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3"
               >
                  🚀 Crear Workspace Gratis
               </button>
               <button 
                  onClick={onStartSession}
                  className="px-8 py-5 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/[0.1] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
               >
                  📞 Hablar con Ventas
               </button>
            </div>
            
            <p className="mt-8 text-sm text-slate-500 font-medium">
               "No necesitas más herramientas. Necesitas control."
            </p>
         </div>
      </section>

      <div id="support">
        <SupportFooter />
      </div>

      <TrialEndedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onViewPricing={onStartSession} 
      />
    </div>
  );
};
