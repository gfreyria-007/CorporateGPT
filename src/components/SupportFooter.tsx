import React from 'react';
import { Mail, Globe, Shield, Terminal } from 'lucide-react';

export const SupportFooter = () => {
  return (
    <footer className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12 border-t border-corporate-100 dark:border-white/5 bg-corporate-50 dark:bg-corporate-950/20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16">
        <div className="space-y-8 max-w-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-xl shadow-blue-500/30">C</div>
            <div>
              <h4 className="text-lg lg:text-xl font-display font-black tracking-tight uppercase leading-none text-corporate-900 dark:text-white">Catalizia</h4>
              <p className="text-[9px] lg:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Corporate GPT Suite</p>
            </div>
          </div>
          <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">
            Aseguramos la ventaja competitiva de tu PyME mediante inteligencia artificial segura, privada y auditada de nivel corporativo.
          </p>
          <div className="flex items-center gap-4 lg:gap-6 text-slate-400">
             {[Shield, Globe, Terminal].map((Icon, i) => (
               <Icon key={i} size={18} className="hover:text-blue-600 transition-colors cursor-pointer" />
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-32">
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Soluciones</h5>
            <ul className="space-y-3 lg:space-y-4">
              {['SME Suite', 'Professional Vault', 'Enterprise API', 'Creative Studio'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs font-black uppercase text-corporate-900 dark:text-white hover:text-blue-600 transition-colors tracking-widest">{link}</a>
                </li>
              ))}
              <li>
                <a href="https://techie.catalizia.com" className="text-xs font-black uppercase text-emerald-500 hover:text-emerald-400 transition-colors tracking-widest">Techie Tutor (Junior)</a>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Soporte y Ventas</h5>
            <div className="p-4 lg:p-8 bg-white dark:bg-corporate-900 rounded-[2rem] border border-corporate-200 dark:border-white/10 space-y-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dudas comerciales o ventas personalizadas:</p>
               <div className="flex items-center gap-3 text-blue-600 font-display font-black text-base lg:text-lg tracking-tight">
                 <Shield size={18} />
                 Soporte Premium 24/7
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 lg:pt-16 mt-10 lg:mt-16 border-t border-corporate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          © 2026 Catalizia AI Labs. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 lg:gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          <a href="#" className="hover:text-corporate-900 dark:hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-corporate-900 dark:hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-corporate-900 dark:hover:text-white transition-colors">NDA</a>
        </div>
      </div>
    </footer>
  );
};
