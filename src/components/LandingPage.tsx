import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { PricingSection } from './PricingSection';
import { SupportFooter } from './SupportFooter';
import { TrialEndedModal } from './TrialEndedModal';
import { ShieldCheck, ChevronRight, Zap, Globe, Sparkles, Coins, Cpu, Lock, MousePointer2 } from 'lucide-react';
import { translations } from '../lib/translations';

const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(37, 99, 235, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    init();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60" />;
};

interface LandingPageProps {
  onStartSession: () => void;
  isSigningIn: boolean;
  showTrialModal?: boolean;
  lang: 'en' | 'es';
  setLang: (lang: 'en' | 'es') => void;
  appConfig?: any;
}

export const LandingPage = ({ onStartSession, isSigningIn, showTrialModal = false, lang, setLang, appConfig }: LandingPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(showTrialModal);
  const t = translations[lang];
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTrialModal) {
      setIsModalOpen(true);
    }
  }, [showTrialModal]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-600 selection:text-white relative">
      <NeuralBackground />
      {/* Navigation */}
      <nav className="h-24 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-[100] bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-corporate-100 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">
             {appConfig?.appLogoText || 'C'}
          </div>
          <h1 className="text-xl font-display font-black tracking-tight uppercase dark:text-white">
             {appConfig?.appName || 'Catalizia'}
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-corporate-900 dark:text-white/70">
          <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="hover:text-blue-600 dark:hover:text-white transition-colors">{lang === 'en' ? 'Solutions' : 'Soluciones'}</a>
          <a href="#economics" className="hover:text-blue-600 dark:hover:text-white transition-colors">{lang === 'en' ? 'Efficiency' : 'Eficiencia'}</a>
          <a href="#support" className="hover:text-blue-600 dark:hover:text-white transition-colors">{lang === 'en' ? 'Support' : 'Soporte'}</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-corporate-200 dark:border-white/10">
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('es')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'es' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              ES
            </button>
          </div>
          <button 
            onClick={onStartSession}
            disabled={isSigningIn}
            className="px-6 h-12 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (lang === 'en' ? 'Verifying...' : 'Verificando...') : (lang === 'en' ? 'Client Access' : 'Acceso Clientes')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-6 lg:px-12 overflow-hidden bg-white dark:bg-black">
        {/* Sharper Gradients for better visibility */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full -mr-[20vw] -mt-[20vw]" />
           <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-amber-500/5 dark:bg-blue-400/5 blur-[120px] rounded-full -ml-[15vw] -mb-[15vw]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] border border-blue-600/20"
            >
              <Lock size={14} /> {lang === 'en' ? 'Certified AI Pipeline' : 'IA Certificada para PyMEs'}
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-[9rem] font-display font-black tracking-tighter leading-[0.85] uppercase max-w-6xl text-corporate-900 dark:text-white"
            >
              {(appConfig?.landingTitle || t.landingTitle).split(' ').map((word: string, i: number) => (
                <span key={i} className={word.toLowerCase() === 'private' || word.toLowerCase() === 'privada' ? 'text-blue-600' : ''}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl text-lg md:text-xl font-medium text-slate-500 dark:text-white/60 leading-relaxed uppercase tracking-wider px-4"
            >
              {appConfig?.landingSubtitle || t.landingSubtitle}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 w-full max-w-xl pt-4"
            >
              <motion.button 
                animate={{ 
                  boxShadow: isSigningIn ? "0 0 0px rgba(0,0,0,0)" : ["0 0 0px rgba(37,99,235,0.4)", "0 0 30px rgba(37,99,235,0.6)", "0 0 0px rgba(37,99,235,0.4)"],
                  scale: isSigningIn ? 1 : [1, 1.02, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={onStartSession}
                disabled={isSigningIn}
                className="flex-1 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (lang === 'en' ? 'Authenticating...' : 'Autenticando...') : t.getStarted} 
                {!isSigningIn && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </motion.button>
              <button 
                onClick={scrollToFeatures}
                className="flex-1 h-20 bg-slate-50 dark:bg-white/5 text-corporate-900 dark:text-white border border-corporate-200 dark:border-white/10 rounded-[2rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm group"
              >
                {t.viewDemo} <MousePointer2 size={18} className="text-blue-600 group-hover:scale-125 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* High Contrast Feature Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-48">
            <div className="p-10 lg:p-14 rounded-[3.5rem] bg-slate-50 dark:bg-white/5 border border-corporate-200 dark:border-white/10 space-y-8 group hover:bg-white dark:hover:bg-white/[0.08] transition-all">
               <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                 <ShieldCheck size={32} />
               </div>
               <div className="space-y-4">
                 <h3 className="font-display font-black text-2xl tracking-tight uppercase leading-none text-corporate-900 dark:text-white">{t.highlightSafetyTitle}</h3>
                 <p className="text-xs font-bold leading-relaxed text-slate-500 dark:text-white/50 uppercase tracking-widest">
                    {t.highlightSafetyDesc}
                 </p>
               </div>
            </div>
            
            <div id="economics" className="p-10 lg:p-14 rounded-[3.5rem] bg-corporate-900 dark:bg-blue-600 border border-transparent text-white space-y-8 shadow-2xl shadow-blue-600/30 md:translate-y-12">
               <div className="w-16 h-16 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                 <Coins size={32} />
               </div>
               <div className="space-y-4">
                 <h3 className="font-display font-black text-2xl tracking-tight uppercase leading-none">{t.highlightEfficiencyTitle}</h3>
                 <p className="text-xs font-bold leading-relaxed text-white/80 uppercase tracking-widest">
                    {t.highlightEfficiencyDesc}
                 </p>
               </div>
            </div>

            <div className="p-10 lg:p-14 rounded-[3.5rem] bg-slate-50 dark:bg-white/5 border border-corporate-200 dark:border-white/10 space-y-8 group hover:bg-white dark:hover:bg-white/[0.08] transition-all">
               <div className="w-16 h-16 bg-blue-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
                 <Cpu size={32} />
               </div>
               <div className="space-y-4">
                 <h3 className="font-display font-black text-2xl tracking-tight uppercase leading-none text-corporate-900 dark:text-white">{t.tokenRouterTitle}</h3>
                 <p className="text-xs font-bold leading-relaxed text-slate-500 dark:text-white/50 uppercase tracking-widest">
                    {t.tokenRouterDesc}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Proof Section */}
      <section className="py-32 px-6 lg:px-12 bg-slate-50 dark:bg-white/[0.02] border-y border-corporate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-[0.9] dark:text-white">
              {lang === 'en' ? 'Data Privacy as a' : 'Privacidad de Datos como una'} <br />
              <span className="text-blue-600">{lang === 'en' ? 'Non-Negotiable' : 'Innegociable'}</span>
            </h2>
            <p className="text-lg font-medium text-slate-500 dark:text-white/60 uppercase tracking-wider">
              {lang === 'en' 
                ? 'Your proprietary logic and corporate documents never touch the public internet. We implement a Zero Data Retention (ZDR) infrastructure for all Mexico-based SMEs.'
                : 'Tu lógica propietaria y documentos corporativos nunca tocan el internet público. Implementamos una infraestructura de Retención de Datos Cero (ZDR) para todas las PyMEs.'}
            </p>
            <ul className="space-y-4 pt-4">
               {[
                 lang === 'en' ? 'End-to-End Encryption' : 'Encriptación de Punto a Punto',
                 lang === 'en' ? 'ISO 27001 Certified Nodes' : 'Nodos Certificados ISO 27001',
                 lang === 'en' ? 'Local Mexican Compliance' : 'Cumplimiento Local Mexicano'
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest dark:text-white">
                   <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                     <ShieldCheck size={16} />
                   </div>
                   {item}
                 </li>
               ))}
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full animate-pulse" />
              <div className="relative z-10 w-full h-full bg-white dark:bg-corporate-900 rounded-[4rem] border border-corporate-200 dark:border-white/10 shadow-2xl flex items-center justify-center p-12">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                   className="absolute inset-0 border-4 border-dashed border-blue-600/20 rounded-[4rem]" 
                 />
                 <Lock size={120} className="text-blue-600 drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="support">
        <SupportFooter />
      </div>

      <TrialEndedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onViewPricing={onStartSession} // Redirect to app session
      />
    </div>
  );
};
