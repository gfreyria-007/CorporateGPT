import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { LandingEditor } from './LandingEditor';
import { 
  ShieldCheck, Shield, CheckCircle2, ChevronRight, Zap, Globe, Sparkles, Coins, 
  Cpu, Lock, MousePointer2, MessageSquare, Presentation, Palette, Database,
  AlertTriangle, Users, BarChart3, Fingerprint, Crosshair, Target, XCircle, FileWarning, Settings
} from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import { getLandingConfig, isAdminEditing, setAdminEditing } from '../lib/landingConfig';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onStartSession: () => void;
  onSignInWithApple?: () => void;
  isSigningIn: boolean;
  showTrialModal?: boolean;
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
  appConfig?: any;
  appMode?: 'corporate' | 'junior';
  isSuperAdmin?: boolean;
}

export const LandingPage = ({ onStartSession, onSignInWithApple, isSigningIn, showTrialModal = false, lang = 'es', setLang, appConfig, appMode = 'corporate', isSuperAdmin = false }: LandingPageProps) => {
  const t = translations[lang] || translations.es;
  const [isModalOpen, setIsModalOpen] = useState(showTrialModal);
  const [showEditor, setShowEditor] = useState(false);
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
  const heroRef = useRef<HTMLDivElement>(null);
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    tl.from('.nav-item', { 
      y: -20, 
      opacity: 0, 
      duration: 1, 
      stagger: 0.1 
    })
    .from('.hero-badge', { 
      scale: 0.8, 
      opacity: 0, 
      duration: 1 
    }, '-=0.5')
    .from('.hero-title', { 
      y: 40, 
      opacity: 0, 
      duration: 1.2,
      stagger: 0.2
    }, '-=0.8')
    .from('.hero-desc', { 
      y: 20, 
      opacity: 0, 
      duration: 1 
    }, '-=1')
    .from('.hero-btn', { 
      y: 20, 
      opacity: 0, 
      duration: 1, 
      stagger: 0.2 
    }, '-=0.8')
    .from('.hero-check', { 
      opacity: 0, 
      scale: 0, 
      duration: 0.5, 
      stagger: 0.1 
    }, '-=0.5');

    // 2. Interactive Parallax Glows
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 50;
      const yPos = (clientY / window.innerHeight - 0.5) * 50;

      gsap.to(glow1Ref.current, { x: xPos, y: yPos, duration: 2, ease: 'power2.out' });
      gsap.to(glow2Ref.current, { x: -xPos, y: -yPos, duration: 2, ease: 'power2.out' });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3. Problem Section Stagger
    gsap.from('.problem-card', {
      scrollTrigger: {
        trigger: '.problem-section',
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      },
      y: 60,
      opacity: 0,
      rotateX: -15,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out'
    });

    // 4. Solution Bento Animation
    gsap.from('.solution-card', {
      scrollTrigger: {
        trigger: '.solution-section',
        start: 'top 75%',
      },
      scale: 0.9,
      opacity: 0,
      y: 40,
      duration: 1.2,
      stagger: 0.15,
      ease: 'back.out(1.2)'
    });

    // 5. Product Cards Reveal
    gsap.from('.product-card', {
      scrollTrigger: {
        trigger: '.product-section',
        start: 'top 70%',
      },
      x: (i) => i % 2 === 0 ? -50 : 50,
      opacity: 0,
      duration: 1.5,
      ease: 'power4.out'
    });

    // 6. Comparison Table Row-by-Row
    gsap.from('.comparison-row', {
      scrollTrigger: {
        trigger: '.comparison-table',
        start: 'top 80%',
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power2.out'
    });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white relative perspective-1000">
      {/* Navigation */}
      <nav className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-[100] bg-white/80 backdrop-blur-3xl border-b border-slate-200">
        <div className="flex items-center gap-3 lg:gap-4 nav-item">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl bg-blue-600 border border-blue-400 transition-all">
             C
          </div>
          <h1 className="text-lg lg:text-xl font-display font-black tracking-tight uppercase text-slate-900">
             {appMode === 'junior' ? 'Techie Tutor' : 'Catalizia'}
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hover:text-blue-600 transition-colors nav-item">{lang === 'es' ? 'Plataforma' : 'Platform'}</a>
          <a href="#economics" className="hover:text-blue-600 transition-colors nav-item">{lang === 'es' ? 'Ahorro' : 'Savings'}</a>
          <a href="https://techie.catalizia.com" className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 group">
            <Sparkles size={12} className="text-emerald-600 group-hover:text-white" />
            {lang === 'es' ? 'Techie' : 'Techie'}
          </a>
          <a href="https://corporategpt.catalizia.com" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 group">
            <Shield size={12} className="text-blue-600 group-hover:text-white" />
            {lang === 'es' ? 'Corporate' : 'Corporate'}
          </a>
          <a href="#support" className="hover:text-blue-600 transition-colors nav-item">{lang === 'es' ? 'Soporte' : 'Support'}</a>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 nav-item">
          {isSuperAdmin && (
            <button 
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105"
            >
              <Settings size={14} className="inline mr-1" />
              Edit
            </button>
          )}
          <button 
              onClick={() => { console.log('[Landing] SignIn clicked'); onStartSession(); }}
              disabled={isSigningIn}
              className="px-4 lg:px-6 h-10 lg:h-12 bg-blue-600 text-white rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? '...' : 'Iniciar Sesión'}
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 overflow-hidden bg-white" ref={heroRef}>
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div ref={glow1Ref} className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-600/5 blur-[150px] rounded-full" />
           <div ref={glow2Ref} className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/5 blur-[150px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-0 contrast-150"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 mb-20">
            <div className="hero-badge inline-flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 backdrop-blur-3xl shadow-sm">
              <Sparkles size={14} className="text-blue-600" /> {t.landingBadge || 'Secure AI for Business & Family'}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-display font-black tracking-tighter leading-[1.05] text-slate-900">
              <div className="hero-title">
                {lang === 'es' ? 'Tu Empresa + Tu Familia:' : 'Your Enterprise + Your Family:'}
              </div>
              <div className="hero-title">
                <span className="text-blue-600">{lang === 'es' ? 'IA 100% Segura' : '100% Secure AI'}</span>
              </div>
              <div className="hero-title">
                {lang === 'es' ? 'para tu negocio y tu hogar' : 'for your business and your home'}
              </div>
            </h1>
            
            <div className="hero-desc max-w-4xl text-sm md:text-base lg:text-lg text-slate-600 font-medium leading-relaxed space-y-4 text-center bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <p><span className="font-bold text-slate-900">{lang === 'es' ? 'Accede a las 100+ mejores IAs del mundo.' : 'Access the 100+ best AIs in the world.'}</span> {lang === 'es' ? 'Nuestro Auto Router escoge la mejor para cada tarea optimizando costos.' : 'Our Auto Router picks the best one for each task, optimizing costs.'}</p>
              <p><span className="font-bold text-emerald-600">{lang === 'es' ? 'Activa ZDR para seguridad NDA total.' : 'Activate ZDR for total NDA security.'}</span> {lang === 'es' ? 'Tus datos nunca entren modelos públicos. Segurança corporativa real.' : 'Your data never trains public models. Real corporate security.'}</p>
            </div>

<div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <button 
                onClick={() => { console.log('[Landing] Google SignIn clicked'); onStartSession(); }}
                className="hero-btn px-8 py-5 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
              >
                <Shield size={18} /> {lang === 'es' ? 'Google' : 'Google'}
</button>
              <button
                onClick={onSignInWithApple}
                className="hero-btn px-8 py-5 rounded-2xl bg- black text-white font- black uppercase tracking-widest text-sm hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                <Sparkles size={18} /> {lang === 'es' ? 'Apple' : 'Apple'}
              </button>
              <button 
                onClick={() => { console.log('[Landing] Email SignIn clicked'); alert('Email sign-in: Contact support@catalizia.com'); }}
                className="hero-btn px-8 py-5 rounded-xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-sm hover:bg-slate-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group shadow-sm"
              >
                <Globe size={18} /> {lang === 'es' ? 'Email' : 'Email'}
              </button>
              <button 
                onClick={() => window.open('https://corporategpt.catalizia.com', '_blank')}
                className="hero-btn px-6 py-5 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest text-sm hover:bg-emerald-700 hover:scale-[1.02] transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3"
              >
                <Shield size={18} /> 
              </button>
              <button 
                onClick={() => window.open('https://techie.catalizia.com', '_blank')}
                className="hero-btn px-6 py-5 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3"
              >
                <Sparkles size={18} /> 
              </button>
              <button 
                onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                className="hero-btn px-5 py-5 rounded-xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-sm hover:bg-slate-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group shadow-sm"
              >
                <Globe size={18} />
              </button>
            </div>
            <div className="text-[11px] text-slate-500 font-black tracking-wide uppercase mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="hero-check flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600"/> {lang === 'es' ? '100+ LLMs' : '100+ LLMs'}</span>
              <span className="hero-check opacity-30">•</span> 
              <span className="hero-check flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600"/> {lang === 'es' ? 'AUTO ROUTER' : 'AUTO ROUTER'}</span>
              <span className="hero-check opacity-30">•</span> 
              <span className="hero-check flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600"/> {lang === 'es' ? 'ZDR / NDA' : 'ZDR / NDA'}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-slate-200">
            {[
              { value: '100+', label: lang === 'es' ? 'LLMs DISPONIBLES' : 'LLMS AVAILABLE' },
              { value: '70%', label: lang === 'es' ? 'AHORRO EN IA' : 'AI SAVINGS' },
              { value: '0', label: lang === 'es' ? 'FILTRACIONES' : 'DATA LEAKS' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-black text-blue-600">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50 border-y border-slate-200 problem-section" id="solutions">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">{lang === 'es' ? 'Usa la IA a tu favor, con total confianza' : 'Use AI to your advantage, with confidence'}</h2>
            <p className="text-slate-600 text-lg">{lang === 'es' ? 'Resolvemos los retos de la IA abierta para que puedas enfocarte en lo que importa: crecer.' : 'We solve open AI challenges so you can focus on what matters: growing.'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="problem-card p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform"><Lock size={24} /></div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{lang === 'es' ? 'Privacidad de NDA' : 'NDA Privacy'}</h4>
                <p className="text-slate-600 text-sm">{lang === 'es' ? 'Tus datos sensibles se quedan en tu entorno. Usa la IA para analizar contratos con total tranquilidad.' : 'Your sensitive data stays in your environment. Use AI to analyze contracts with total peace of mind.'}</p>
             </div>
             <div className="problem-card p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all group">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform"><Sparkles size={24} /></div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{lang === 'es' ? 'Entorno Junior' : 'Junior Environment'}</h4>
                <p className="text-slate-600 text-sm">{lang === 'es' ? 'Un espacio diseñado para menores, donde la IA actúa como un tutor mentor en lugar de un chat genérico.' : 'A space designed for minors, where AI acts as a mentor tutor instead of a generic chat.'}</p>
             </div>
             <div className="problem-card p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all group">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform"><BarChart3 size={24} /></div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{lang === 'es' ? 'Eficiencia de Costos' : 'Cost Efficiency'}</h4>
                <p className="text-slate-600 text-sm">{lang === 'es' ? 'Consolidamos tu gasto. Un solo motor optimizado que te da acceso a lo mejor de la IA por mucho menos.' : 'We consolidate your spending. One optimized engine that gives you access to the best AI for much less.'}</p>
             </div>
             <div className="problem-card p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all group">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform"><Target size={24} /></div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{lang === 'es' ? 'Gobierno Simple' : 'Simple Governance'}</h4>
                <p className="text-slate-600 text-sm">{lang === 'es' ? 'Gestiona usuarios y accesos desde un solo lugar. Transparencia total para Marketing, Legal y Operaciones.' : 'Manage users and access from one place. Total transparency for Marketing, Legal and Operations.'}</p>
             </div>
          </div>

          <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/30 flex items-center gap-6">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                <ShieldCheck size={32} />
             </div>
             <p className="font-bold text-lg leading-tight">{lang === 'es' ? 'Catalizia no es solo IA; es la armadura de seguridad y el cerebro de eficiencia que tu organización y familia necesitan hoy.' : 'Catalizia is not just AI; its the security armor and efficiency brain your organization and family need today.'}</p>
          </div>
        </div>
      </section>

      {/* THE SOLUTION & VALUE CLEAR SECTION */}
      <section className="py-24 px-6 lg:px-12 bg-white relative solution-section" id="economics">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
             <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                {lang === 'es' ? 'El Valor Real' : 'The Real Value'}
             </div>
             <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
                {lang === 'es' ? 'Orden, Seguridad' : 'Order, Security'}<br className="hidden lg:block"/> {lang === 'es' ? 'y Economía de Escala' : 'and Scale Economics'}
             </h2>
             <p className="text-xl text-slate-600 max-w-2xl">
               {lang === 'es' ? 'Deja de pagar suscripciones individuales sin control. Centraliza, asegura y potencia el talento humano con inteligencia responsable.' : 'Stop paying for individual subscriptions without control. Centralize, secure and empower human talent with responsible intelligence.'}
             </p>
          </div>

          {/* Value Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
             <div className="solution-card p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 mb-6 group-hover:scale-110 transition-transform"><Coins size={24} /></div>
                <div>
                   <h4 className="text-4xl font-black text-slate-900 mb-3">-70% Gasto</h4>
                   <p className="text-slate-600 text-sm font-medium">Nuestro Auto Router elige el modelo más económico para tareas simples y el más potente para decisiones críticas. Máxima eficiencia automática.</p>
                </div>
             </div>
             
             <div className="solution-card p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 mb-6 group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
                <div>
                   <h4 className="text-4xl font-black text-slate-900 mb-3">NDA Proof</h4>
                   <p className="text-slate-600 text-sm font-medium">Arquitectura Zero-Data Retention. Tus secretos comerciales no entrenan modelos públicos. Seguridad nivel Enterprise para todos.</p>
                </div>
             </div>

             <div className="solution-card p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 mb-6 group-hover:scale-110 transition-transform"><Target size={24} /></div>
                <div>
                   <h4 className="text-4xl font-black text-slate-900 mb-3">Safe Mode</h4>
                   <p className="text-slate-600 text-sm font-medium">Filtros dinámicos que adaptan la IA al usuario. Sandbox educativo para niños y potente asistente de gestión para adultos.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

{/* PRODUCTS (REPOSITIONED) */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-200 product-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{lang === 'es' ? 'Un solo motor. Dos entornos.' : 'One engine. Two environments.'}</h2>
             <p className="text-slate-600 text-lg">{lang === 'es' ? 'Poder y seguridad adaptados al contexto de uso.' : 'Power and security adapted to your use case.'}</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enterprise Core */}
            <div className="product-card group relative rounded-[2.5rem] bg-white border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="relative h-64 w-full bg-slate-100 border-b border-slate-200 overflow-hidden flex items-end justify-center px-8 pt-12">
                 <div className="w-full h-full bg-white rounded-t-2xl border-x border-t border-slate-200 shadow-2xl relative overflow-hidden flex transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-20 lg:w-24 h-full border-r border-slate-100 p-4 flex flex-col gap-4 bg-slate-50">
                       <div className="w-full h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100"><Shield size={20} className="text-blue-600"/></div>
                       <div className="w-full h-12 bg-slate-100 rounded-xl flex items-center justify-center"><Database size={20} className="text-slate-400"/></div>
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                       <div className="flex gap-3 items-center mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Cpu size={14} className="text-blue-600"/></div>
                          <div className="h-2 w-24 bg-slate-200 rounded-full" />
                       </div>
                       <div className="h-16 w-full bg-slate-50 rounded-xl border border-slate-100 p-4"><div className="h-2 w-full bg-slate-200 rounded-full"/></div>
                       <div className="h-16 w-full bg-slate-50 rounded-xl border border-slate-100 p-4"><div className="h-2 w-3/4 bg-slate-200 rounded-full"/></div>
                    </div>
                 </div>
              </div>
              <div className="p-10 lg:p-12 z-20 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{lang === 'es' ? 'IA Empresarial' : 'Corporate AI'}</h3>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{lang === 'es' ? 'Seguridad + Control de Costos' : 'Security + Cost Control'}</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                  {lang === 'es' ? 'Accede a los mejores LLMs del mundo sin exponer tus datos. Análisis de contratos, NDAs y documentos sensibles con arquitectura zero-data retention.' : 'Access the worlds best LLMs without exposing your data. Analyze contracts, NDAs and sensitive documents with zero-data retention architecture.'}
                </p>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 size={16} className="text-blue-600"/> {lang === 'es' ? 'Nano Banana 2: Presentaciones + Infografías' : 'Nano Banana 2: Presentations + Infographics'}</li>
                   <li className="flex items-center gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 size={16} className="text-blue-600"/> {lang === 'es' ? '100+ LLMs con Auto Router' : '100+ LLMs with Auto Router'}</li>
                   <li className="flex items-center gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 size={16} className="text-blue-600"/> {lang === 'es' ? 'ZDR: Seguridad NDA Total' : 'ZDR: Total NDA Security'}</li>
                 </ul>
              </div>
            </div>

            {/* Safe Learning */}
            <div className="product-card group relative rounded-[2.5rem] bg-white border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="relative h-64 w-full bg-slate-100 border-b border-slate-200 overflow-hidden flex items-end justify-center px-8 pt-12">
                 <div className="w-full h-full bg-white rounded-t-2xl border-x border-t border-slate-200 shadow-2xl relative overflow-hidden transform group-hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-full h-16 bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-between">
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center"><Sparkles size={14} className="text-emerald-600"/></div>
                       </div>
                    </div>
                    <div className="p-6 space-y-4">
                       <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/30 flex items-center justify-center"><Zap size={18} className="text-white"/></div>
                          <div className="h-16 w-3/4 bg-emerald-50 rounded-2xl rounded-tl-sm border border-emerald-100 p-4">
                             <div className="h-2 w-full bg-emerald-200 rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-10 lg:p-12 z-20 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{lang === 'es' ? 'IA Familiar Segura' : 'Family Safe AI'}</h3>
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{lang === 'es' ? 'Se Adapta a la Edad' : 'Se Adapta a la Edad'}</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                  {lang === 'es' ? 'Selecciona el grado de tu hijo y Techie adapta sus respuestas. No es lo mismo 1º de primaria que 3º de secundaria. Tutoría personalizada por nivel educativo.' : 'Select your childs grade and Techie adapts its responses. 1st grade is different from 3rd grade. Personalized tutoring by education level.'}
                </p>
                <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 size={16} className="text-emerald-600"/> {lang === 'es' ? 'Selecciona Grado (1º-3ºsecundaria)' : 'Select Grade (1st-3rd grade)'}</li>
                   <li className="flex items-center gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 size={16} className="text-emerald-600"/> {lang === 'es' ? 'Respuestas por Nivel' : 'Age-Appropriate Answers'}</li>
                   <li className="flex items-center gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 size={16} className="text-emerald-600"/> {lang === 'es' ? 'Controles Parentales' : 'Parent Controls'}</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR TABLE */}
      <section className="py-24 px-6 lg:px-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-4">{lang === 'es' ? 'Mientras otros te dan acceso,' : 'While others give you access,'}<br/>{lang === 'es' ? 'nosotros te damos control.' : 'we give you control.'}</h2>
             <p className="text-slate-600 font-medium">{lang === 'es' ? 'Diseñado para quienes no pueden comprometer la seguridad ni el presupuesto.' : 'Designed for those who cant compromise on security or budget.'}</p>
          </div>

          <div className="comparison-table rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
             <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-6 font-black uppercase text-xs tracking-widest text-slate-500">
                <div>{lang === 'es' ? 'Característica' : 'Feature'}</div>
                <div className="text-center text-blue-600">Catalizia</div>
                <div className="text-center">{lang === 'es' ? 'Otras IA' : 'Other AI'}</div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center group">
                <div className="font-bold text-slate-900 text-sm group-hover:translate-x-2 transition-transform">{lang === 'es' ? 'Acceso Multi-modelo' : 'Multi-model Access'}</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-600" /></div>
                <div className="flex justify-center"><XCircle className="text-red-300" /></div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center group">
                <div className="font-bold text-slate-900 text-sm group-hover:translate-x-2 transition-transform">{lang === 'es' ? 'Retención Cero (NDA Proof)' : 'Zero Retention (NDA Proof)'}</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-600" /></div>
                <div className="flex justify-center"><AlertTriangle className="text-amber-500" /></div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center group">
                <div className="font-bold text-slate-900 text-sm group-hover:translate-x-2 transition-transform">{lang === 'es' ? 'Auto Router de Costos' : 'Auto Cost Router'}</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-600" /></div>
                <div className="flex justify-center"><XCircle className="text-red-300" /></div>
             </div>
             <div className="comparison-row grid grid-cols-3 p-6 hover:bg-slate-50 transition-colors items-center group">
                <div className="font-bold text-slate-900 text-sm group-hover:translate-x-2 transition-transform">{lang === 'es' ? 'Protección Infantil Real' : 'Real Kids Protection'}</div>
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-600" /></div>
                <div className="flex justify-center"><XCircle className="text-red-300" /></div>
             </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 px-6 lg:px-12 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black mb-4">{lang === 'es' ? 'Empresas que ya confían en Catalizia' : 'Companies that trust Catalizia'}</h2>
            <p className="text-slate-400">{lang === 'es' ? 'Lo que dicen nuestros usuarios' : 'What our users say'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-lg font-medium mb-6">{lang === 'es' ? '"Pasamos de pagar 15 suscripciones separadas a tener todo centralizado. El ahorro real fue del 70% y nuestra paz mental."' : '"We went from paying 15 separate subscriptions to having everything centralized. Real 70% savings and peace of mind."'}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black">MA</div>
                <div>
                  <div className="font-bold text-sm">María A.</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{lang === 'es' ? 'Directora, Colegio ST' : 'Director, School ST'}</div>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-lg font-medium mb-6">{lang === 'es' ? '"Analizamos contratos de M&A con IA. En 2 horas hicimos lo que antes tomaba 2 semanas. Y ningún dato salió."' : '"We analyzed M&A contracts with AI. In 2 hours we did what used to take 2 weeks. And no data left our infrastructure."'}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-black">JR</div>
                <div>
                  <div className="font-bold text-sm">Javier R.</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">COO, LegalTech SA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FINAL CTA (CIERRE FUERTE) */}
      <section className="py-32 px-6 lg:px-12 bg-gradient-to-b from-white to-slate-100 border-t border-slate-200 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-8">
               {lang === 'es' ? 'Lleva tu empresa y hogar' : 'Take your business and home'}<br/>
               <span className="text-blue-600 italic">{lang === 'es' ? 'al siguiente nivel de inteligencia.' : 'to the next level of intelligence.'}</span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 font-medium">{lang === 'es' ? 'Únete a la plataforma que empodera a las personas mediante el uso responsable y seguro de la IA.' : 'Join the platform that empowers people through responsible and secure AI use.'}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                  onClick={onStartSession}
                  className="px-8 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3"
               >
                  🚀 {lang === 'es' ? 'Crear Workspace Seguro' : 'Create Secure Workspace'}
               </button>
               <button 
                  onClick={onStartSession}
                  className="px-8 py-5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-sm hover:bg-slate-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-sm"
               >
                  📞 {lang === 'es' ? 'Hablar con un Asesor' : 'Talk to an Advisor'}
               </button>
            </div>
            
            <p className="mt-8 text-sm text-slate-500 font-black uppercase tracking-widest">
              "{lang === 'es' ? 'No necesitas más IA. Necesitas gobierno.' : 'You dont need more AI. You need governance.'}"
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

      {showEditor && <LandingEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
};
