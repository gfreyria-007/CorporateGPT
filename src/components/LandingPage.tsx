import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { LandingEditor } from './LandingEditor';
import { PricingSection } from './PricingSection';
import { 
  ShieldCheck, Shield, CheckCircle2, ChevronRight, Zap, Globe, Sparkles, Coins, 
  Cpu, Lock, MousePointer2, MessageSquare, Presentation, Palette, Database,
  AlertTriangle, Users, BarChart3, Fingerprint, Crosshair, Target, XCircle, FileWarning, Settings, ArrowRight, Mail, Chrome
} from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import anime from 'animejs';

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (showTrialModal) setIsModalOpen(true);
    
    // Simulate system initialization
    const timer = setTimeout(() => setIsInitialized(true), 800);
    return () => clearTimeout(timer);
  }, [showTrialModal]);

  useGSAP(() => {
    if (!isInitialized) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    // Entrance Animation
    tl.to('.loader-overlay', { opacity: 0, duration: 1, pointerEvents: 'none' })
      .from('.nav-blur', { y: -50, opacity: 0, duration: 1 }, '-=0.5')
      .from('.hero-badge', { scale: 0.8, opacity: 0, duration: 0.8 }, '-=0.3')
      .from('.hero-title-line', { 
        y: 80, 
        opacity: 0, 
        rotateX: -20,
        duration: 1.2, 
        stagger: 0.15 
      }, '-=0.6')
      .from('.hero-p', { y: 20, opacity: 0, duration: 0.8 }, '-=0.8')
      .from('.hero-btns button', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.6')
      .from('.hero-mockup-container', { 
        z: -500, 
        rotateY: 45,
        opacity: 0, 
        duration: 2,
        ease: 'expo.inOut'
      }, '-=1.5');

    // Scroll-Driven Adaptive UI
    // Hero Mockup Parallax
    gsap.to('.hero-mockup-container', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
      rotateY: -20,
      rotateX: 10,
      y: -150,
      scale: 1.2,
      filter: 'blur(5px)',
      opacity: 0.3
    });

    // Feature cards forming on scroll
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.feature-grid',
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
      x: (i) => (i % 3 === 0 ? -100 : i % 3 === 2 ? 100 : 0),
      y: 100,
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      stagger: {
        each: 0.1,
        from: 'center'
      },
      ease: 'power4.out'
    });

    // Table rows sliding in
    gsap.from('.table-row', {
      scrollTrigger: {
        trigger: '.comparison-table',
        start: 'top 75%',
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Background Glow Adaptive Movement
    gsap.to('.bg-glow-adaptive', {
      x: 'random(-300, 300)',
      y: 'random(-300, 300)',
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 2
    });

    // Magnetic Buttons Interaction
    const buttons = gsap.utils.toArray('.magnetic-btn');
    buttons.forEach((btn: any) => {
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      });
    });

  }, [isInitialized]);

  // Cursor Follower
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden perspective-1000">
      {/* Custom Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 bg-blue-500/20 blur-xl rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
      
      {/* Loader Overlay */}
      <div className="loader-overlay fixed inset-0 z-[1000] bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center">
            <span className="text-3xl font-black text-white italic">C</span>
          </div>
          <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} className="h-full bg-blue-600" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Initializing Singularity</p>
        </div>
      </div>

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-glow-adaptive absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 blur-[150px] rounded-full" />
        <div className="bg-glow-adaptive absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-emerald-500/10 blur-[180px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-slate-950"></div>
      </div>

      {/* Navigation */}
      <nav className="nav-blur fixed top-0 w-full z-[100] px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 border border-white/20">
              <span className="font-black text-xl text-white">C</span>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">{appMode === 'junior' ? 'Techie Tutor' : 'Catalizia'}</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-white transition-all hover:tracking-[0.2em]">Plataforma</a>
            <a href="#pricing" className="hover:text-white transition-all hover:tracking-[0.2em]">Ahorro</a>
            <a href="#plans" className="hover:text-white transition-all hover:tracking-[0.2em]">Planes</a>
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="hover:text-white">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <button onClick={() => setShowEditor(true)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                Edit
              </button>
            )}
            <button 
              onClick={onStartSession}
              className="magnetic-btn px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30"
            >
              {isSigningIn ? '...' : 'Acceder'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section relative pt-52 pb-32 px-6 lg:px-12 z-10 flex flex-col items-center">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="hero-content space-y-10">
            <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={14} className="animate-spin-slow" /> {lang === 'es' ? 'IA Corporativa Gen 2.5' : 'Corporate AI Gen 2.5'}
            </div>
            
            <div className="space-y-2">
              <h1 className="hero-title-line text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] text-white">
                {lang === 'es' ? 'La IA que tu' : 'The AI your'}
              </h1>
              <h1 className="hero-title-line text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400">
                {lang === 'es' ? 'empresa confía' : 'business trusts'}
              </h1>
            </div>

            <p className="hero-p text-base sm:text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-xl border-l-2 border-blue-500/30 pl-4 sm:pl-8">
              {lang === 'es' ? 'Accede a los mejores modelos de IA con seguridad corporativa.' : 'Access the world\'s top 100+ models with total NDA security. Save up to 70% by centralizing your team spend.'}
            </p>

            <div className="hero-btns flex flex-wrap gap-6 pt-4">
              {!showAuthOptions ? (
                <button onClick={() => setShowAuthOptions(true)} disabled={isSigningIn} className="magnetic-btn px-10 py-6 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-3">
                  {isSigningIn ? <Sparkles size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                  {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'} <ArrowRight size={20} />
                </button>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <button onClick={onStartSession} disabled={isSigningIn} className="magnetic-btn px-8 py-5 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-3">
                    <Chrome size={20} />
                    Google
                  </button>
                  <button onClick={() => onSignInWithApple?.()} disabled={isSigningIn} className="magnetic-btn px-8 py-5 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all flex items-center gap-3">
                    <Fingerprint size={20} />
                    Apple
                  </button>
                  <button onClick={() => {
                    const email = prompt(lang === 'es' ? 'Ingresa tu correo electrónico:' : 'Enter your email:');
                    if (email && onSignInWithEmail) onSignInWithEmail(email);
                  }} disabled={isSigningIn} className="magnetic-btn px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-xl">
                    <Mail size={20} />
                    {lang === 'es' ? 'Correo' : 'Email'}
                  </button>
                </div>
              )}
              <button onClick={() => setShowAuthOptions(true)} className="magnetic-btn px-10 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-xl">
                <Shield size={20} /> {lang === 'es' ? 'Seguridad ZDR' : 'ZDR Security'}
              </button>
            </div>

            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-4">
              {lang === 'es' 
                ? 'Al iniciar sesión, confirmas que eres mayor de 18 años y aceptas nuestras Políticas de Privacidad y Cumplimiento.' 
                : 'By signing in, you confirm you are 18+ years old and agree to our Privacy & Compliance policies.'}
            </p>

            <div className="hero-p flex items-center gap-8 pt-10 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-2 group cursor-help hover:text-emerald-400 transition-colors"><CheckCircle2 size={16} className="text-emerald-500 group-hover:scale-125 transition-transform"/> Google Gemini</span>
              <span className="flex items-center gap-2 group cursor-help hover:text-emerald-400 transition-colors"><CheckCircle2 size={16} className="text-emerald-500 group-hover:scale-125 transition-transform"/> Privacidad</span>
            </div>
          </div>

<div className="hero-mockup-container relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <div className="relative group">
               <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(37,99,235,0.4)] border border-white/20 bg-[#020617]"
              >
                <img src="/landing/dashboard.png" alt="Dashboard" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-40" />
              </motion.div>
              
              {/* Animated Floating Badges - Hide on small mobile */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="hidden sm:flex absolute -top-8 sm:-top-12 -right-4 sm:-right-8 glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-blue-500/30 border border-white/20 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck size={24} className="text-emerald-400" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                    <div className="text-lg font-black text-white">ZDR ACTIVE</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 lg:py-44 px-4 sm:px-6 lg:px-12 relative overflow-hidden" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 lg:gap-16 mb-16 lg:mb-32">
            <div className="reveal-up max-w-3xl">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl xl:text-8xl font-black tracking-tighter text-white mb-6 lg:mb-10 leading-[0.9]">
                {lang === 'es' ? 'La tecnología que otros' : 'The technology others'}<br/>
                <span className="text-blue-500 italic">{lang === 'es' ? 'no te dicen.' : 'won\'t tell you.'}</span>
              </h2>
              <p className="text-base lg:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                {lang === 'es' ? 'No solo te damos acceso a la IA, te damos la infraestructura para gobernarla, asegurar tus datos y optimizar cada centavo.' : 'We don\'t just give you AI access; we give you the infrastructure to govern it, secure your data, and optimize every cent.'}
              </p>
            </div>
            <div className="reveal-up pb-6">
              <div className="p-6 sm:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-all">
                <span className="block text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-2 group-hover:scale-110 transition-transform">-70%</span>
                <span className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-[0.5em]">{lang === 'es' ? 'EN COSTOS' : 'ON COSTS'}</span>
              </div>
            </div>
          </div>

          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card glass-card p-12 rounded-[3.5rem] hover:bg-white/10 transition-all group overflow-hidden border border-white/5">
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 border border-blue-500/20 mb-10 group-hover:rotate-12 transition-transform">
                <Cpu size={40} />
              </div>
              <h3 className="text-3xl font-black text-white mb-6 leading-tight">{lang === 'es' ? 'Auto-Router Inteligente' : 'Intelligent Auto-Router'}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                {lang === 'es' ? 'Nuestra IA decide cuál es el mejor modelo (Pro o Flash) para tu tarea específica. Máximo rendimiento, mínimo costo.' : 'Our AI decides the best model (Pro or Flash) for your specific task. Maximum performance, minimum cost.'}
              </p>
<div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 group-hover:scale-105 transition-transform duration-700">
                 <img src="/landing/dashboard.png" alt="Corporate Chat" className="w-full h-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
               </div>
            </div>

            <div className="feature-card glass-card p-12 rounded-[3.5rem] hover:bg-white/10 transition-all group overflow-hidden border border-white/5">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-10 group-hover:rotate-12 transition-transform">
                <Lock size={40} />
              </div>
              <h3 className="text-3xl font-black text-white mb-6 leading-tight">{lang === 'es' ? 'Seguridad NDA/ZDR' : 'NDA/ZDR Security'}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                {lang === 'es' ? 'Zero Data Retention. Tus datos corporativos nunca entrenan modelos públicos. Seguridad de nivel bancario total.' : 'Zero Data Retention. Your corporate data never trains public models. Total banking-level security.'}
              </p>
              <div className="p-10 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-center gap-6 h-[200px]">
                <div className="flex justify-between items-center">
                  <div className="text-[12px] font-black text-emerald-400 uppercase tracking-widest">Shield Protocol 4.0</div>
                  <ShieldCheck size={24} className="text-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="h-2 w-3/4 bg-emerald-500/20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="feature-card glass-card p-12 rounded-[3.5rem] hover:bg-white/10 transition-all group overflow-hidden border border-white/5">
              <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center text-purple-400 border border-purple-500/20 mb-10 group-hover:rotate-12 transition-transform">
                <Target size={40} />
              </div>
              <h3 className="text-3xl font-black text-white mb-6 leading-tight">{lang === 'es' ? 'Tutoría por Grados' : 'Grade-Based Tutoring'}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                {lang === 'es' ? 'Techie Tutor adapta sus explicaciones al nivel académico del usuario. Desde primaria hasta nivel ejecutivo.' : 'Techie Tutor adapts its explanations to the academic level. From elementary to executive level.'}
              </p>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 group-hover:scale-105 transition-transform duration-700">
                <img src="/landing/junior.png" alt="Techie Tutor" className="w-full h-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-44 px-6 lg:px-12 relative" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="reveal-up text-center mb-32">
            <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-white mb-8">
              {lang === 'es' ? 'No es solo IA,' : 'Not just AI,'}<br/>
              <span className="text-emerald-400 italic">{lang === 'es' ? 'es control total.' : 'it\'s total control.'}</span>
            </h2>
          </div>

          <div className="comparison-table glass-card rounded-[2rem] lg:rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl bg-white/2">
            <div className="hidden sm:grid grid-cols-3 p-4 sm:p-12 border-b border-white/10 bg-white/5 font-black uppercase text-[10px] sm:text-[12px] tracking-[0.4em] text-slate-500">
              <div>Característica</div>
              <div className="text-center text-blue-400">Catalizia</div>
              <div className="text-center">Estándar</div>
            </div>
            {[
              { feat: 'Google Gemini Models', catalizia: true, other: true },
              { feat: 'Privacidad Corporativa', catalizia: true, other: 'Parcial' },
              { feat: 'Techie Tutor (Junior)', catalizia: true, other: false },
            ].map((row, i) => (
              <div key={i} className="table-row grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 p-4 sm:p-12 border-b border-white/5 items-center hover:bg-white/5 transition-all cursor-default">
                <div className="text-sm sm:text-lg font-bold text-slate-300">{row.feat}</div>
                <div className="flex justify-center text-emerald-400"><CheckCircle2 size={24} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" /></div>
                <div className="flex justify-center text-slate-600 text-xs sm:text-sm font-black uppercase tracking-widest">
                  {row.other === false ? <XCircle size={24} className="text-red-500/20" /> : row.other}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrated Pricing Section */}
      <div id="plans" className="reveal-up">
        <PricingSection />
      </div>

      {/* Final CTA Adaptive Section */}
      <section className="py-24 lg:py-64 px-4 sm:px-6 lg:px-12 relative overflow-hidden bg-gradient-to-b from-[#020617] to-blue-950/20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/10 blur-[200px] rounded-full animate-pulse" />
        </div>
        
        <div className="reveal-up max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl xl:text-9xl font-black tracking-tighter text-white mb-12 lg:mb-16 leading-[0.85]">
            {lang === 'es' ? 'Empodera a tu' : 'Empower your'}<br/>
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              {lang === 'es' ? 'organización hoy.' : 'organization today.'}
            </span>
          </h2>
          <p className="text-base lg:text-2xl text-slate-400 font-medium mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed border-t border-white/10 pt-8 lg:pt-12">
            {lang === 'es' ? 'Únete a las empresas que están definiendo el futuro del trabajo con inteligencia responsable y segura.' : 'Join the companies defining the future of work with responsible and secure intelligence.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 justify-center">
            <button onClick={onStartSession} className="magnetic-btn px-8 sm:px-16 py-6 sm:py-8 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-xs sm:text-sm transition-all shadow-[0_0_70px_rgba(37,99,235,0.5)] active:scale-95">
              🚀 {lang === 'es' ? 'Iniciar Sesión Segura' : 'Start Sesión Segura'}
            </button>
            <button 
              onClick={onStartSession}
              className="magnetic-btn px-8 sm:px-16 py-6 sm:py-8 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-xs sm:text-sm hover:bg-white/10 transition-all backdrop-blur-3xl"
            >
              📞 {lang === 'es' ? 'Hablar con Humano' : 'Talk to Human'}
            </button>
          </div>
        </div>
      </section>

      <SupportFooter />

      <TrialEndedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onViewPricing={onStartSession} 
      />

      {showEditor && <LandingEditor onClose={() => setShowEditor(false)} />}
      <div className="py-8 text-center opacity-20 pointer-events-none">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Neural Synthesis: REDIRECT_V1 [RECOVERY_MODE]</p>
      </div>
    </div>
  );
};
