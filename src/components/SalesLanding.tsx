import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { translations } from '../lib/translations';
import { salesAgentChat } from '../services/geminiService';

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
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Content */}
        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} fill="currentColor" />
              {lang === 'es' ? 'Potenciado por el Empresario' : 'Empowered by the Entrepreneur'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
              {t.trialEndedTitle}
            </h1>
            <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
              {t.trialEndedSubtitle} {t.longTermValue}
            </p>
          </motion.div>

          {/* Value Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <ValueCard 
              icon={<Lock className="text-emerald-400" />}
              title={lang === 'es' ? 'Privacidad vs Gratuito' : 'Privacy vs Free AI'}
              desc={t.dataPrivacyWarning}
            />
            <ValueCard 
              icon={<TrendingUp className="text-blue-400" />}
              title={lang === 'es' ? 'Escalabilidad PyME' : 'SME Scalability'}
              desc={t.pricingEfficiency}
            />
          </div>

          {/* Use Case Spotlight */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Users className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[11px] text-indigo-400">{t.hrUseTitle}</h3>
                <p className="text-lg font-bold text-white">{lang === 'es' ? 'Automatización Inteligente de RR.HH.' : 'Intelligent HR Automation'}</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed italic">
              {t.hrUseDesc}
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              {['LFT Expert', 'Internal Policies', 'NDA Safety', '24/7 Response'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
             <button className="h-16 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 group">
                <CreditCard size={18} />
                {t.buyNow}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
             <button 
                onClick={onContact}
                className="h-16 px-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95"
             >
                <Mail size={18} />
                {t.contactSales}
             </button>
          </div>
        </div>

        {/* Right Side: Sales Agent Agent */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-slate-900/80 border border-white/10 backdrop-blur-2xl rounded-[3rem] h-[700px] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center relative">
                   <ShieldCheck className="text-white" size={20} />
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{t.salesAgentTitle}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Online Now</span>
                  </div>
                </div>
              </div>
              <CheckCircle2 size={24} className="text-blue-500" />
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
                    <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                        : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                 <div className="flex gap-2 p-4 bg-white/5 rounded-2xl w-fit">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150" />
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white/5 border-t border-white/5">
              <div className="relative group/input">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.salesAgentPlaceholder}
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-600 pr-16"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-3 top-3 bottom-3 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                >
                   <ArrowRight size={20} />
                </button>
              </div>
              <p className="mt-4 text-[10px] text-center text-slate-600 uppercase tracking-widest font-black">
                {lang === 'es' ? 'Asesoría Oficial CorporateGPT' : 'Official CorporateGPT Advisory'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-[#020617]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {/* Fake logos representing the professional target */}
           <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter">TRUSTED SECURITY</div>
           <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter">SME COMPLIANT</div>
           <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter">60% LOWER TCO</div>
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
  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed leading-relaxed">{desc}</p>
  </div>
);
