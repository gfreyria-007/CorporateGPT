import React from 'react';
import { HelpCircle, ChevronRight, MessageSquare, ShieldCheck, Zap, Gem, Palette, Coins, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FAQProps {
  onClose: () => void;
  lang: 'en' | 'es';
  theme: 'light' | 'dark';
}

const content = {
  en: {
    title: "CorporateGPT Intelligence Hub",
    subtitle: "Strategic Advantages & Quick Start Guide",
    sections: [
      {
        title: "Why CorporateGPT vs Personal Accounts?",
        icon: <ShieldCheck size={20} />,
        text: "Unlike personal ChatGPT or Claude subscriptions, CorporateGPT provides 'Zero Data Retention' (ZDR) across all models, ensuring your company secrets never train external AI. Plus, our Auto Router saves up to 70% in costs by selecting model efficiency based on query complexity, eliminating expensive $20/month seats for every employee."
      },
      {
        title: "How to use CorporateGPT (Quick Start)",
        icon: <Zap size={20} />,
        text: "1. Select your 'Intelligence' from the left sidebar (Auto Router is recommended). 2. Use the 'GPTs' panel to access corporate personas or create your own. 3. Start chatting or use the 'Creative Studio' to generate infographics and corporate visuals. It's that simple."
      },
      {
        title: "Intelligent Chat & Auto-Router",
        icon: <MessageSquare size={20} />,
        text: "Access 100+ LLMs. The system automatically routes your query to the most cost-effective model that can handle the complexity. You get high performance only when you need it, and cheaper models for simple tasks."
      },
      {
        title: "Creative Studio (Infographics)",
        icon: <Palette size={20} />,
        text: "Powered by Nano Banana 2.0. This isn't just an image editor; it's a corporate visualization engine. Upload data context, select a layout, and let CorporateGPT synthesize professional graphics for your reports."
      },
      {
        title: "What is a Token & Why Volume is Cheaper?",
        icon: <Coins size={20} />,
        text: "Tokens are the 'atomic units' of AI. Instead of paying for a flat monthly subscription per seat where many users barely use it, volume-based token management allows you pay only for actual output. For a company, it's 40-60% cheaper to consolidate employee queries into a central token pool than paying $20 for each person. You scale with usage, not headcount."
      }
    ]
  },
  es: {
    title: "Intelligence Hub de CorporateGPT",
    subtitle: "Ventajas Estratégicas y Guía de Inicio Rápido",
    sections: [
      {
        title: "¿Por qué CorporateGPT vs Cuentas Personales?",
        icon: <ShieldCheck size={20} />,
        text: "A diferencia de las suscripciones personales de ChatGPT o Claude, CorporateGPT ofrece 'Retención de Datos Cero' (ZDR) en todos los modelos, garantizando que sus secretos comerciales nunca entrenen a la IA externa. Además, nuestro Auto Router ahorra hasta un 70% en costos al seleccionar el modelo según la complejidad del query, eliminando las costosas licencias individuales de $20/mes."
      },
      {
        title: "Cómo usar CorporateGPT (Guía Rápida)",
        icon: <Zap size={20} />,
        text: "1. Seleccione su 'Inteligencia' en la barra lateral (se recomienda Auto Router). 2. Use el panel de 'GPTs' para acceder a personas corporativas o crear las suyas propias. 3. Comience a chatear o use el 'Creative Studio' para generar infografías y visuales corporativos."
      },
      {
        title: "Chat Inteligente y Auto-Router",
        icon: <MessageSquare size={20} />,
        text: "Acceda a más de 100 LLMs. El sistema dirige automáticamente su consulta al modelo más rentable que pueda manejar la complejidad. Obtiene el mayor rendimiento solo cuando lo necesita."
      },
      {
        title: "Creative Studio (Infografías)",
        icon: <Palette size={20} />,
        text: "Impulsado por Nano Banana 2.0. No es solo un editor; es un motor de visualización corporativa. Suba contexto de datos, elija un layout y deje que la IA sintetice gráficos profesionales para sus informes."
      },
      {
        title: "¿Qué es un Token y por qué es más barato por volumen?",
        icon: <Coins size={20} />,
        text: "Los tokens son las 'unidades atómicas' de la IA. En lugar de pagar una suscripción mensual fija por persona donde muchos casi no la usan, la gestión de tokens por volumen permite pagar solo por lo que realmente se genera. Para una empresa, es entre un 40-60% más barato consolidar miles de consultas de empleados en una bolsa de tokens que pagar $20 USD por cada usuario. Escalas por uso, no por nómina."
      }
    ]
  }
};

export function FAQ({ onClose, lang, theme }: FAQProps) {
  const c = content[lang];
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{c.title}</h3>
            <p className="text-sm text-slate-500">{c.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            Close
          </button>
        </div>
        <div className="p-8 grid gap-6">
          {c.sections.map((s, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  {s.title}
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100" />
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group cursor-help">
            <Zap size={14} className="text-blue-600" /> SYSTEM STATUS: 100% OPERATIONAL
          </div>
           <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold">Understood</button>
        </div>
      </motion.div>
    </div>
  );
}
