import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Coins, 
  Users, 
  Zap, 
  MessageSquare, 
  ChevronRight, 
  Lock, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Rocket,
  CreditCard,
  Mail,
  ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { translations } from '../lib/translations';
import { salesAgentChat } from '../services/geminiService';

gsap.registerPlugin(ScrollTrigger);

interface SalesLandingProps {
  lang: 'en' | 'es';
  onContact?: () => void;
}

export const SalesLanding = ({ lang, onContact }: SalesLandingProps) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: lang === 'es' ? 'Hola. Soy su Asesor de CorporateGPT. ¿Cómo puedo ayudarle a optimizar la inteligencia de su empresa hoy?' : 'Hello. I am your CorporateGPT Advisor. How can I help you optimize your company intelligence today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

    tl.from('.sales-hero-content > *', {
      y: 40,
      opacity: 0,
      stagger: 0.2,
    })
    .from('.sales-agent-box', {
      x: 60,
      opacity: 0,
      duration: 1.5,
    }, '-=1')
    .from('.sales-value-card', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
    }, '-=0.8');

    gsap.from('.trust-item', {
      scrollTrigger: {
        trigger: '.trust-footer',
        start: 'top 90%',
      },
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
    });
  }, { scope: containerRef });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await salesAgentChat(userMsg, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Sales Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600/30 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[130px] rounded-full pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Content */}
        <div className="space-y-12 sales-hero-content">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} fill="currentColor" />
              {lang === 'es' ? 'Potenciado para el Empresario' : 'Empowered for the Entrepreneur'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-slate-900">
              {t.trialEndedTitle}
            </h1>
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
              {t.trialEndedSubtitle} {t.longTermValue}
            </p>
          </div>

          {/* Value Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sales-value-card">
              <ValueCard 
                icon={<Lock className="text-blue-600" />}
                title={lang === 'es' ? 'Privacidad Pro' : 'Pro Privacy'}
                desc={lang === 'es' ? 'Seguridad NDA Proof para tu empresa. Tus datos nunca entrenan modelos públicos.' : 'NDA Proof security for your business. Your data never trains public models.'}
              />
            </div>
            <div className="sales-value-card">
              <ValueCard 
                icon={<TrendingUp className="text-emerald-600" />}
                title={lang === 'es' ? 'Crecimiento SME' : 'SME Growth'}
                desc={lang === 'es' ? 'IA económica y de alta potencia adaptada a tu presupuesto operativo.' : 'Economic, high-power AI tailored to your operating budget.'}
              />
            </div>
          </div>

          {/* Use Case Spotlight */}
          <div className="sales-value-card p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Users className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[11px] text-indigo-600">{t.hrUseTitle}</h3>
                <p className="text-lg font-bold text-slate-900">{lang === 'es' ? 'Empoderamiento Corporativo' : 'Corporate Empowerment'}</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed italic font-medium">
              {lang === 'es' ? 'Dale a tu equipo las mejores herramientas de IA del mundo con la confianza de un entorno seguro y privado.' : 'Give your team the world\'s best AI tools with the confidence of a safe and private environment.'}
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              {['NDA Proof', 'Cost Optimized', 'Senior Support', 'Junior Safe'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <button className="h-16 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 active:scale-95 group">
                <CreditCard size={18} />
                {t.buyNow}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
             <button 
                onClick={onContact}
                className="h-16 px-8 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
             >
                <Mail size={18} />
                {t.contactSales}
             </button>
          </div>
        </div>

        {/* Right Side: Sales Agent Agent */}
        <div className="relative group sales-agent-box">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative bg-white/80 border border-slate-200 backdrop-blur-2xl rounded-[3rem] h-[700px] flex flex-col overflow-hidden shadow-2xl shadow-slate-200/50">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center relative">
                   <ShieldCheck className="text-white" size={20} />
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div>
                   <h3 className="font-bold text-sm tracking-tight text-slate-900">{t.salesAgentTitle}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">En línea</span>
                  </div>
                </div>
              </div>
              <CheckCircle2 size={24} className="text-blue-600" />
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {messages.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed font-medium ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                 <div className="flex gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150" />
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <div className="relative group/input">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.salesAgentPlaceholder}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 pr-16 shadow-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-3 top-3 bottom-3 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                >
                   <ArrowRight size={20} />
                </button>
              </div>
              <p className="mt-4 text-[10px] text-center text-slate-400 uppercase tracking-widest font-black">
                {lang === 'es' ? 'Asesoría Oficial Catalizia' : 'Official Catalizia Advisory'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="relative z-10 border-t border-slate-200 py-12 bg-white/50 backdrop-blur-md trust-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-60 hover:opacity-100 transition-all duration-700">
           <div className="trust-item flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">EMPOWERED INNOVATION</div>
           <div className="trust-item flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">NDA PROTECTED</div>
           <div className="trust-item flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">JUNIOR SAFE SANDBOX</div>
        </div>
      </footer>
    </div>
  );
};

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const ValueCard = ({ icon, title, desc }: ValueCardProps) => (
  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all group">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-xs text-slate-600 leading-relaxed font-medium">{desc}</p>
  </div>
);
