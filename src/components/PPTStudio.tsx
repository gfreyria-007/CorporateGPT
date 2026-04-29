import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Presentation, 
  Download,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Cloud,
  FileText,
  Gamepad2,
  Orbit,
  Activity,
  Trophy,
  Palette,
  ChevronRightCircle,
  Building2,
  PenTool,
  FlaskConical,
  Grid3X3,
  Box,
  Eraser,
  Pencil,
  Compass,
  Layout,
  Zap,
  TrendingUp,
  BrainCircuit,
  Atom,
  ScrollText,
  Monitor,
  ZapOff,
  Dna,
  Infinity,
  Layers,
  Sparkles,
  Wand2,
  Stars
} from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';
import pptxgen from 'pptxgenjs';
import { generateStudioSlides, StudioSlideData } from '../services/geminiService';

type DesignMood = 
  | 'ai_orchestrator'
  | 'corporativo' | 'lego' | 'boceto' | 'laboratorio' | 'brutalista' 
  | 'arcilla_3d' | 'pizarron_blanco' | 'pizarron_verde' | 'pizarron_negro' | 'plano_tecnico'
  | 'cuantico' | 'manuscrito' | 'retro_80s' | 'minimal_jp' | 'ciberpunk';

export const PPTStudio: React.FC<{ 
  theme: 'light' | 'dark', 
  lang: 'en' | 'es', 
  user: any,
  onClose: () => void 
}> = ({ theme, lang, user, onClose }) => {
  const [step, setStep] = useState<'config' | 'generating' | 'viewer'>('config');
  const [topic, setTopic] = useState('');
  const [selectedMood, setSelectedMood] = useState<DesignMood>('ai_orchestrator');
  const [activeMood, setActiveMood] = useState<DesignMood>('corporativo');
  const [slides, setSlides] = useState<StudioSlideData[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  
  const t = translations[lang];

  const studioStyles = [
    { id: 'ai_orchestrator', name: lang === 'es' ? 'ORQUESTADOR IA' : 'AI ORCHESTRATOR', icon: <Wand2 size={16} />, premium: true },
    { id: 'corporativo', name: 'EXECUTIVE', icon: <Building2 size={16} /> },
    { id: 'minimal_jp', name: 'ZEN', icon: <Infinity size={16} /> },
    { id: 'cuantico', name: 'QUANTUM', icon: <Atom size={16} /> },
    { id: 'lego', name: 'LEGO', icon: <Gamepad2 size={16} /> },
    { id: 'arcilla_3d', name: '3D CLAY', icon: <Box size={16} /> },
    { id: 'brutalista', name: 'BRUTAL', icon: <Grid3X3 size={16} /> },
    { id: 'plano_tecnico', name: 'BLUEPRINT', icon: <Compass size={16} /> },
    { id: 'manuscrito', name: 'SCRIPT', icon: <ScrollText size={16} /> },
    { id: 'retro_80s', name: '80S RETRO', icon: <Monitor size={16} /> },
    { id: 'ciberpunk', name: 'CYBER', icon: <Zap size={16} /> },
  ];

  const getMoodStyles = (mood: DesignMood) => {
    switch (mood) {
      case 'cuantico':
        return {
          bg: 'bg-black', text: 'text-cyan-400',
          accent: 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.5)]',
          header: 'text-white font-black tracking-tighter uppercase font-mono italic',
          sub: 'text-cyan-500/60 font-mono uppercase tracking-[0.4em]',
          pattern: 'opacity-[0.2] bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]',
          card: 'bg-cyan-950/20 border border-cyan-500/30 rounded-none backdrop-blur-xl'
        };
      case 'minimal_jp':
        return {
          bg: 'bg-[#fafafa]', text: 'text-slate-900',
          accent: 'bg-red-600 text-white',
          header: 'text-slate-900 font-light tracking-widest uppercase',
          sub: 'text-red-600 font-bold uppercase tracking-[0.5em] border-l-4 border-red-600 pl-4',
          pattern: 'opacity-[0.05] bg-[url("https://www.transparenttextures.com/patterns/natural-paper.png")]',
          card: 'bg-white rounded-none shadow-[20px_20px_0_rgba(0,0,0,0.03)] border border-slate-100'
        };
      case 'ciberpunk':
        return {
          bg: 'bg-[#050505]', text: 'text-fuchsia-500',
          accent: 'bg-yellow-400 text-black font-black italic',
          header: 'text-yellow-400 font-black uppercase tracking-tighter skew-x-[-10deg]',
          sub: 'text-fuchsia-500 font-bold uppercase tracking-widest bg-fuchsia-500/10 px-2',
          pattern: 'opacity-[0.3] bg-[url("https://www.transparenttextures.com/patterns/grid.png")]',
          card: 'bg-black border-2 border-fuchsia-500 shadow-[4px_4px_0_#fde047]'
        };
      case 'manuscrito':
        return {
          bg: 'bg-[#f4ead5]', text: 'text-[#5d4037]',
          accent: 'bg-[#5d4037] text-[#f4ead5]',
          header: 'text-[#5d4037] font-serif italic font-light tracking-tight',
          sub: 'text-[#8d6e63] font-serif italic tracking-widest border-b border-[#8d6e63]',
          pattern: 'opacity-[0.8] bg-[url("https://www.transparenttextures.com/patterns/old-paper.png")]',
          card: 'bg-white/40 border border-[#8d6e63]/20 rounded-sm'
        };
      case 'lego':
        return {
          bg: 'bg-[#005596]', text: 'text-white',
          accent: 'bg-[#FFD500] text-black border-b-4 border-black/20',
          header: 'text-[#FFD500] font-black uppercase tracking-tight',
          sub: 'text-white/80 font-bold uppercase tracking-widest',
          pattern: 'opacity-[0.1] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]',
          card: 'bg-white rounded-[1.5rem] border-b-8 border-r-8 border-black/20 text-slate-900 shadow-xl'
        };
      case 'laboratorio':
        return {
          bg: 'bg-white', text: 'text-blue-900',
          accent: 'bg-blue-600 text-white',
          header: 'text-blue-900 font-black tracking-tight uppercase leading-none',
          sub: 'text-blue-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2',
          pattern: 'opacity-[0.05] bg-[url("https://www.transparenttextures.com/patterns/graphy.png")]',
          card: 'bg-white border border-blue-100 rounded-2xl shadow-lg'
        };
      case 'plano_tecnico':
        return {
          bg: 'bg-[#003366]', text: 'text-cyan-100',
          accent: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
          header: 'text-white font-mono tracking-tighter uppercase',
          sub: 'text-cyan-400/60 font-mono uppercase tracking-[0.2em]',
          pattern: 'opacity-[0.4] bg-[url("https://www.transparenttextures.com/patterns/graphy.png")]',
          card: 'bg-[#002b57] border-2 border-cyan-500/20 rounded-none font-mono shadow-[4px_4px_0_rgba(0,255,255,0.1)]'
        };
      case 'brutalista':
        return {
          bg: 'bg-[#f0f0f0]', text: 'text-black',
          accent: 'bg-black text-white',
          header: 'text-black font-black uppercase tracking-tighter leading-[0.85]',
          sub: 'text-black font-black uppercase tracking-widest border-b-4 border-black pb-2 inline-block',
          pattern: 'opacity-[0.03] bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]',
          card: 'bg-white border-4 border-black rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)]'
        };
      case 'arcilla_3d':
        return {
          bg: 'bg-[#e0e5ec]', text: 'text-[#44476a]',
          accent: 'bg-[#e0e5ec] text-[#44476a] shadow-[inset_6px_6px_12px_#b8bec9,inset_-6px_-6px_12px_#ffffff]',
          header: 'text-[#44476a] font-black tracking-tight leading-none',
          sub: 'text-[#44476a]/60 font-bold uppercase tracking-widest',
          pattern: 'opacity-0',
          card: 'bg-[#e0e5ec] rounded-[3rem] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]'
        };
      case 'pizarron_verde':
        return {
          bg: 'bg-[#2e4d3d]', text: 'text-[#f5f5f5]/80',
          accent: 'bg-white/10 text-white border border-white/20',
          header: 'text-white font-serif italic tracking-tight',
          sub: 'text-white/40 font-serif italic tracking-[0.2em]',
          pattern: 'opacity-[0.5] bg-[url("https://www.transparenttextures.com/patterns/chalkboard.png")]',
          card: 'bg-white/5 border border-white/10 rounded-sm'
        };
      default: // Corporate Premium
        return {
          bg: 'bg-slate-50', text: 'text-slate-900',
          accent: 'bg-[#166534] text-white shadow-xl shadow-green-500/10',
          header: 'text-[#166534] font-serif italic font-black tracking-tight',
          sub: 'text-slate-400 font-bold uppercase tracking-[0.3em]',
          pattern: 'opacity-[0.02] bg-[url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")]',
          card: 'bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100'
        };
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setStep('generating');
    try {
      const response = await generateStudioSlides(topic, selectedMood, lang);
      setSlides(response.slides);
      setActiveMood(response.finalMood as DesignMood);
      setSelectedSlide(0);
      setStep('viewer');
    } catch (error) {
      console.error('Synthesis failed:', error);
      setStep('config');
    }
  };

  const downloadPPT = () => {
    const pptx = new pptxgen();
    slides.forEach(slide => {
      const pptSlide = pptx.addSlide();
      pptSlide.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 32, bold: true });
    });
    pptx.writeFile({ fileName: `Neural_Synthesis_${Date.now()}.pptx` });
  };

  const renderSlideContent = (slide: StudioSlideData) => {
    const mood = getMoodStyles(activeMood);
    
    switch (slide.type) {
      case 'hero':
        return (
          <div className={cn("flex-1 flex overflow-hidden relative", mood.bg)}>
            <div className={cn("absolute inset-0 z-0", mood.pattern)} />
            <div className="flex-1 flex flex-col justify-center px-24 z-10 relative">
               <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block", mood.accent)}>
                    {slide.badge || 'AUTONOMOUS SYNTHESIS'}
                  </div>
                  <h1 className={cn("text-8xl max-w-4xl mb-8 leading-[0.95] tracking-tighter", mood.header)}>
                    {slide.title}
                  </h1>
                  <p className={cn("text-2xl max-w-xl leading-relaxed opacity-60 font-medium", mood.sub)}>
                    {slide.subtitle}
                  </p>
               </motion.div>
            </div>
            {slide.imagePrompt && (
              <div className="w-[40%] relative">
                 <div className="absolute inset-0 bg-slate-800 animate-pulse" />
                 <div className={cn("absolute inset-0 bg-gradient-to-r", mood.bg, "via-transparent to-transparent")} />
              </div>
            )}
          </div>
        );

      case 'metric_focus':
        return (
          <div className={cn("flex-1 p-24 flex flex-col items-center justify-center text-center relative", mood.bg)}>
             <div className={cn("absolute inset-0 z-0", mood.pattern)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 max-w-4xl">
                <span className={cn("text-[10px] font-black uppercase tracking-[0.5em] mb-12 block opacity-40", mood.sub)}>{slide.subtitle}</span>
                <h2 className={cn("text-[12rem] font-black leading-none mb-10 tracking-tighter", mood.header)}>
                   {slide.content[0]?.value || '100%'}
                </h2>
                <div className={cn("w-32 h-2 mx-auto mb-12", mood.accent)} />
                <h3 className="text-4xl font-black uppercase tracking-tight mb-8">{slide.title}</h3>
                <p className="text-xl opacity-60 leading-relaxed max-w-2xl mx-auto font-medium">
                   {slide.content[0]?.description}
                </p>
             </motion.div>
          </div>
        );

      case 'infographic':
        return (
          <div className={cn("flex-1 p-24 flex flex-col relative", mood.bg)}>
             <div className={cn("absolute inset-0 z-0", mood.pattern)} />
             <div className="relative z-10 mb-24">
                <h2 className={cn("text-6xl mb-6 leading-tight max-w-3xl", mood.header)}>{slide.title}</h2>
                <p className={cn("text-sm uppercase tracking-[0.3em] opacity-40", mood.sub)}>{slide.subtitle}</p>
             </div>
             <div className="flex-1 grid grid-cols-3 gap-12 relative z-10">
                {slide.content.map((item, i) => (
                  <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className={cn("p-12 flex flex-col justify-between group", mood.card)}>
                     <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110", mood.accent)}>
                        <Layers size={24} />
                     </div>
                     <div>
                        <span className={cn("text-5xl font-black block mb-6", mood.header)}>{item.value}</span>
                        <h4 className="text-xl font-black uppercase tracking-tight mb-4 opacity-80">{item.label}</h4>
                        <p className="text-sm opacity-50 font-medium leading-relaxed">{item.description}</p>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>
        );

      case 'diagram':
        return (
          <div className={cn("flex-1 p-24 flex flex-col relative", mood.bg)}>
             <div className={cn("absolute inset-0 z-0", mood.pattern)} />
             <div className="flex-1 flex gap-24">
                <div className="w-1/2 flex flex-col justify-center gap-12 relative z-10">
                   <div className={cn("px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-widest inline-block w-fit mb-4", mood.accent)}>
                      STRUCTURAL MAPPING
                   </div>
                   <h2 className={cn("text-6xl leading-[1.1] tracking-tighter mb-8", mood.header)}>{slide.title}</h2>
                   <div className="space-y-6">
                      {slide.content.map((item, i) => (
                        <div key={i} className={cn("p-8 flex items-center gap-8 transition-all hover:translate-x-6", mood.card)}>
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", mood.accent)}>
                              <Infinity size={20} />
                           </div>
                           <div>
                              <span className="text-lg font-black uppercase tracking-tight block mb-1">{item.label}</span>
                              <p className="text-xs opacity-40 uppercase tracking-widest font-bold">{item.description}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="w-1/2 relative flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[4rem] animate-pulse" />
                   <div className="relative z-10 w-full aspect-square border-4 border-dashed border-white/10 rounded-full flex items-center justify-center">
                      <div className={cn("w-48 h-48 rounded-full flex items-center justify-center shadow-2xl animate-bounce", mood.accent)}>
                         <Sparkles size={64} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className={cn("flex-1 flex items-center justify-center p-24", mood.bg)}>
             <div className={cn("p-20 text-center max-w-3xl", mood.card)}>
                <h2 className={cn("text-5xl mb-8", mood.header)}>{slide.title}</h2>
                <p className="text-xl opacity-60 leading-relaxed font-medium">{slide.subtitle}</p>
             </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col h-full overflow-hidden relative", theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white')}>
      <AnimatePresence>
        {step === 'config' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#0a0c10] flex flex-col items-center justify-center p-12">
            
            <div className="w-full max-w-6xl mb-16 flex flex-col items-center">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xl animate-pulse">
                     <BrainCircuit size={24} />
                  </div>
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Neural Studio Synthesis</h3>
               </div>
               <div className="flex flex-wrap justify-center gap-3 bg-white/5 p-4 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
                  {studioStyles.map((style) => (
                    <button 
                      key={style.id}
                      onClick={() => setSelectedMood(style.id as DesignMood)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all",
                        selectedMood === style.id 
                          ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-105" 
                          : "text-white/30 hover:text-white hover:bg-white/5",
                        style.premium && "border border-blue-500/30"
                      )}
                    >
                      {style.icon}
                      {style.name}
                    </button>
                  ))}
               </div>
            </div>

            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-3xl">
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-fuchsia-600 to-green-600 rounded-[3.5rem] blur opacity-20 group-hover:opacity-60 transition duration-1000 animate-pulse" />
                  <div className="relative bg-[#050505] rounded-[3.5rem] border border-white/10 p-12 overflow-hidden shadow-2xl">
                     <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={lang === 'es' ? "Ingresa el tema para la síntesis de alto nivel..." : "Enter the topic for high-level synthesis..."}
                        className="w-full h-48 bg-transparent text-white text-3xl font-black outline-none resize-none italic tracking-tighter leading-tight placeholder:text-white/5"
                     />
                     <div className="mt-10 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                           <Zap size={16} />
                           <span>Build 4.3 • AI Autonomous</span>
                        </div>
                        <button disabled={!topic} onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-2xl">
                           {lang === 'es' ? 'ORQUESTAR AHORA' : 'ORCHESTRATE NOW'}
                           <ChevronRightCircle size={18} className="animate-bounce" />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>

            <button onClick={onClose} className="mt-20 text-white/20 hover:text-white transition-colors"><X size={40} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-10 shrink-0 bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-3xl">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            {selectedMood === 'ai_orchestrator' ? <Wand2 size={22} className="animate-pulse" /> : <Presentation size={22} />}
          </div>
          <div>
            <h2 className="text-xl font-display font-black tracking-tighter uppercase leading-none dark:text-white italic">Neural Studio</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] opacity-60">Nanobannana 2 Synthesis</span>
              <span className="w-1 h-1 rounded-full bg-blue-600/30" />
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{activeMood.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={downloadPPT} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2">
            <Download size={14} /> EXPORT PPTX
          </button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg"><X size={20} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-100 dark:border-white/5 flex flex-col shrink-0 bg-[#f9fafb] dark:bg-[#0a0c10] p-6 space-y-6 overflow-y-auto">
           <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cinematic View</span>
              {selectedMood === 'ai_orchestrator' && <Stars size={14} className="text-blue-600 animate-pulse" />}
           </div>
           {slides.map((slide, i) => (
             <button 
               key={slide.id} 
               onClick={() => setSelectedSlide(i)} 
               className={cn(
                 "w-full aspect-[16/10] rounded-2xl border-2 transition-all overflow-hidden relative group p-1", 
                 selectedSlide === i 
                   ? "border-blue-600 shadow-2xl bg-blue-600/5 scale-[1.02]" 
                   : "border-transparent bg-white dark:bg-white/5 shadow-sm hover:border-white/10"
               )}
             >
                <div className="h-full rounded-xl overflow-hidden relative bg-slate-50 dark:bg-black/40 flex flex-col p-4 border border-black/5 dark:border-white/5">
                   <div className="flex justify-between items-start mb-3">
                      <div className="w-6 h-6 rounded-md bg-slate-900/10 dark:bg-white/10 flex items-center justify-center text-[8px] font-black">{i + 1}</div>
                      <Layout size={12} className="opacity-20" />
                   </div>
                   <div className="flex-1 flex flex-col justify-end">
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-30 mb-1">{slide.type}</span>
                      <span className="text-[9px] font-bold uppercase tracking-tight leading-tight line-clamp-2">{slide.title}</span>
                   </div>
                </div>
             </button>
           ))}
        </aside>

        <main className="flex-1 p-12 lg:p-20 flex flex-col relative overflow-hidden bg-[#eff1f4] dark:bg-[#0a0c10]">
           {step === 'generating' && (
             <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#0a0c10]/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-10 text-center p-20">
                <div className="relative">
                   <div className="w-32 h-32 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                   {selectedMood === 'ai_orchestrator' ? <Wand2 size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" /> : <BrainCircuit size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />}
                </div>
                <h3 className="text-5xl font-display font-black uppercase tracking-tighter text-white">
                  {selectedMood === 'ai_orchestrator' ? 'AI ORCHESTRATOR: DECIDING BEST ARCHITECTURE' : 'NANO BANANA 2: HIGH INTELLIGENCE SYNTHESIS'}
                </h3>
                <p className="text-blue-600 font-bold uppercase tracking-[0.5em] text-xs">
                   {selectedMood === 'ai_orchestrator' ? 'ANALYZING DATA CONTEXT...' : `Architecting Mood: ${selectedMood.toUpperCase()}`}
                </p>
                <div className="w-full max-w-md h-1 bg-white/10 rounded-full overflow-hidden">
                   <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 15, ease: "linear" }} className="w-full h-full bg-blue-600" />
                </div>
             </div>
           )}

           <div className="flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {slides.length > 0 && (
                  <motion.div key={selectedSlide} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="w-full max-w-[1300px] aspect-[16/9] bg-white dark:bg-[#0a0c10] rounded-[3.5rem] shadow-[0_80px_200px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative group">
                     {renderSlideContent(slides[selectedSlide])}
                     <div className="h-16 bg-[#f9fafb] dark:bg-black/40 px-16 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] shrink-0 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-4">
                           <span className="opacity-40">System Architecture 4.3</span>
                           <span className="w-1 h-1 rounded-full bg-blue-600" />
                           <span className="text-blue-600">Slide {selectedSlide + 1} of {slides.length}</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="text-blue-600/60">{activeMood.toUpperCase()} MOOD</span>
                           <span className="w-px h-4 bg-white/10" />
                           <span>{slides[selectedSlide].visualStrategy || 'Standard Optimization'}</span>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {slides.length > 0 && (
             <div className="mt-12 flex items-center justify-center gap-12">
                <button disabled={selectedSlide === 0} onClick={() => setSelectedSlide(s => s - 1)} className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-200 dark:border-white/5"><ChevronLeft size={32} /></button>
                <div className="flex gap-4">
                   {slides.map((_, i) => <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-700", selectedSlide === i ? "w-12 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-200 dark:bg-white/10")} />)}
                </div>
                <button disabled={selectedSlide === slides.length - 1} onClick={() => setSelectedSlide(s => s + 1)} className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-200 dark:border-white/5"><ChevronRight size={32} /></button>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};
