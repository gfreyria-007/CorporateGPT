import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Presentation, 
  Download,
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  Cpu,
  History,
  Globe,
  Binary,
  School,
  Cloud,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  GlassWater,
  FileText,
  Wand2,
  Rocket,
  Gamepad2,
  Table,
  Orbit,
  Star,
  Info,
  Layers,
  Activity,
  BarChart2,
  Trophy,
  Dna,
  ShieldAlert,
  Palette,
  CheckCircle2,
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
  CircleDot,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';
import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';

type DesignMood = 
  | 'corporativo' 
  | 'lego' 
  | 'boceto' 
  | 'laboratorio' 
  | 'brutalista' 
  | 'arcilla_3d' 
  | 'pizarron_blanco' 
  | 'pizarron_verde' 
  | 'pizarron_negro' 
  | 'plano_tecnico';

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  type: 'title' | 'data_comparison' | 'structural_breakdown' | 'pictogram_stats';
  mood: DesignMood;
  content: any[];
  badge?: string;
  imageUrl?: string;
  metric?: string;
}

export const PPTStudio: React.FC<{ 
  theme: 'light' | 'dark', 
  lang: 'en' | 'es', 
  user: any,
  onClose: () => void 
}> = ({ theme, lang, user, onClose }) => {
  const [step, setStep] = useState<'config' | 'mood_selection' | 'generating' | 'viewer'>('config');
  const [topic, setTopic] = useState('');
  const [selectedMood, setSelectedMood] = useState<DesignMood>('corporativo');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  
  const t = translations[lang];

  const studioStyles = [
    { id: 'corporativo', name: lang === 'es' ? 'CORPORATIVO' : 'CORPORATE', icon: <Building2 size={16} /> },
    { id: 'lego', name: lang === 'es' ? 'ESTILO LEGO' : 'LEGO STYLE', icon: <Gamepad2 size={16} /> },
    { id: 'boceto', name: lang === 'es' ? 'BOCETO' : 'SKETCH', icon: <PenTool size={16} /> },
    { id: 'laboratorio', name: lang === 'es' ? 'LABORATORIO' : 'LABORATORY', icon: <FlaskConical size={16} /> },
    { id: 'brutalista', name: lang === 'es' ? 'BRUTALISTA' : 'BRUTALIST', icon: <Grid3X3 size={16} /> },
    { id: 'arcilla_3d', name: lang === 'es' ? 'ARCILLA 3D' : '3D CLAY', icon: <Box size={16} /> },
    { id: 'pizarron_blanco', name: lang === 'es' ? 'PIZARRÓN BLANCO' : 'WHITEBOARD', icon: <Eraser size={16} /> },
    { id: 'pizarron_verde', name: lang === 'es' ? 'PIZARRÓN VERDE' : 'GREEN BOARD', icon: <Pencil size={16} /> },
    { id: 'pizarron_negro', name: lang === 'es' ? 'PIZARRÓN NEGRO' : 'BLACK BOARD', icon: <Pencil size={16} /> },
    { id: 'plano_tecnico', name: lang === 'es' ? 'PLANO TÉCNICO' : 'TECHNICAL BLUEPRINT', icon: <Compass size={16} /> },
  ];

  const getMoodStyles = (mood: DesignMood) => {
    switch (mood) {
      case 'lego':
        return {
          bg: 'bg-[#005596]', 
          text: 'text-white',
          accent: 'bg-[#FFD500] text-black', 
          header: 'text-[#FFD500] font-black uppercase tracking-normal font-sans',
          sub: 'text-white/80 font-bold uppercase tracking-widest',
          pattern: 'opacity-[0.1] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]',
          card: 'bg-white rounded-[2rem] border-b-8 border-r-8 border-black/20 text-slate-900'
        };
      case 'plano_tecnico':
        return {
          bg: 'bg-[#004d99]', 
          text: 'text-cyan-100',
          accent: 'bg-white/10 text-white border border-white/20',
          header: 'text-white font-mono tracking-tighter uppercase',
          sub: 'text-cyan-400/60 font-mono uppercase tracking-[0.3em]',
          pattern: 'opacity-[0.3] bg-[url("https://www.transparenttextures.com/patterns/graphy.png")]',
          card: 'bg-[#003d7a] border-2 border-white/20 rounded-none font-mono'
        };
      case 'brutalista':
        return {
          bg: 'bg-white',
          text: 'text-black',
          accent: 'bg-black text-white',
          header: 'text-black font-black uppercase tracking-tighter text-9xl leading-[0.8]',
          sub: 'text-black font-bold uppercase tracking-widest border-t-4 border-black pt-4',
          pattern: 'opacity-[0.05] bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]',
          card: 'bg-white border-8 border-black rounded-none shadow-[20px_20px_0_0_rgba(0,0,0,1)]'
        };
      case 'arcilla_3d':
        return {
          bg: 'bg-[#f0f2f5]',
          text: 'text-slate-800',
          accent: 'bg-indigo-500 text-white shadow-xl',
          header: 'text-slate-900 font-bold tracking-tight',
          sub: 'text-slate-400 font-medium',
          pattern: 'opacity-[0.5] bg-[url("https://www.transparenttextures.com/patterns/noise-lines.png")]',
          card: 'bg-white rounded-[3rem] shadow-[20px_20px_60px_#d9dbde,-20px_-20px_60px_#ffffff]'
        };
      case 'pizarron_verde':
        return {
          bg: 'bg-[#2d4c3b]',
          text: 'text-white',
          accent: 'bg-white/10 text-yellow-200 border border-white/20',
          header: 'text-white font-serif italic tracking-wide',
          sub: 'text-white/60 font-serif',
          pattern: 'opacity-[0.4] bg-[url("https://www.transparenttextures.com/patterns/chalkboard.png")]',
          card: 'bg-white/5 border-2 border-white/20 rounded-xl font-serif'
        };
      case 'laboratorio':
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-900',
          accent: 'bg-blue-600 text-white',
          header: 'text-slate-900 font-light tracking-[0.2em] uppercase',
          sub: 'text-blue-600 font-black uppercase tracking-widest text-xs',
          pattern: 'opacity-[0.02] bg-[url("https://www.transparenttextures.com/patterns/grid.png")]',
          card: 'bg-white border border-slate-200 rounded-none shadow-sm'
        };
      case 'boceto':
        return {
          bg: 'bg-[#fffcf0]',
          text: 'text-slate-800',
          accent: 'bg-slate-900 text-white',
          header: 'text-slate-900 font-serif italic font-light',
          sub: 'text-slate-400 font-serif',
          pattern: 'opacity-[0.8] bg-[url("https://www.transparenttextures.com/patterns/paper-fibers.png")]',
          card: 'bg-transparent border-2 border-slate-300 rounded-lg border-dashed'
        };
      default:
        return {
          bg: 'bg-[#0a0c10]',
          text: 'text-white',
          accent: 'bg-[#166534] text-white',
          header: 'text-white font-black italic tracking-tighter',
          sub: 'text-green-500 font-black uppercase tracking-[0.4em]',
          pattern: 'opacity-[0.05] bg-[url("https://www.transparenttextures.com/patterns/circuit-board.png")]',
          card: 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem]'
        };
    }
  };

  const generateWithStyle = async () => {
    if (!topic) return;
    setStep('generating');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const mockSlides: Slide[] = [
        {
          id: '1',
          type: 'title',
          mood: selectedMood,
          title: topic.toUpperCase(),
          subtitle: lang === 'en' ? 'Architectural Studio Synthesis' : 'Síntesis de Estudio Arquitectónico',
          badge: selectedMood.toUpperCase().replace('_', ' ') + ' EDITION',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000'
        },
        {
          id: '2',
          type: 'data_comparison',
          mood: selectedMood,
          title: lang === 'en' ? 'Core Metrics' : 'Métricas Principales',
          subtitle: lang === 'en' ? 'Performance & Output Analysis' : 'Análisis de Rendimiento y Salida',
          content: [
            { label: 'Growth', value: '+42%', status: 'high' },
            { label: 'Retention', value: '98%', status: 'stable' },
            { label: 'Efficiency', value: '1.2ms', status: 'optimal' }
          ],
          metric: 'Target Achieved'
        },
        {
          id: '3',
          type: 'structural_breakdown',
          mood: selectedMood,
          title: lang === 'en' ? 'System Layers' : 'Capas del Sistema',
          subtitle: lang === 'en' ? 'Full stack architectural view' : 'Vista arquitectónica completa',
          content: ['Neural Engine', 'Data Pipeline', 'Synthesis Layer', 'Output Interface']
        }
      ];
      
      setSlides(mockSlides);
      setSelectedSlide(0);
      setStep('viewer');
    } catch (error) {
      console.error('Failed to generate:', error);
    }
  };

  const downloadPPT = () => {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    slides.forEach(slide => {
      const pptSlide = pptx.addSlide();
      pptSlide.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 36, bold: true });
    });
    pptx.writeFile({ fileName: `Studio_${selectedMood}_${Date.now()}.pptx` });
  };

  const renderSlideContent = (slide: Slide) => {
    const mood = getMoodStyles(slide.mood);
    
    switch (slide.type) {
      case 'title':
        return (
          <div className={cn("flex-1 flex overflow-hidden relative", mood.bg)}>
            <div className={cn("absolute inset-0 z-0", mood.pattern)} />
            <div className="flex-1 flex flex-col justify-center px-24 z-10 relative">
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <div className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] mb-12 inline-block", mood.accent)}>
                    {slide.badge}
                  </div>
                  <h1 className={cn("text-8xl tracking-tighter mb-10 leading-none", mood.header)}>
                    {slide.title}
                  </h1>
                  <p className={cn("text-2xl leading-relaxed opacity-60", mood.sub)}>
                    {slide.subtitle}
                  </p>
               </motion.div>
            </div>
            {slide.imageUrl && slide.mood !== 'pizarron_verde' && slide.mood !== 'pizarron_negro' && (
              <div className="w-1/2 relative">
                 <img src={slide.imageUrl} className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" />
                 <div className={cn("absolute inset-0 bg-gradient-to-r", mood.bg, "via-transparent to-transparent")} />
              </div>
            )}
          </div>
        );

      case 'data_comparison':
        return (
          <div className={cn("flex-1 p-20 flex flex-col relative", mood.bg)}>
             <div className={cn("absolute inset-0 z-0", mood.pattern)} />
             <div className="relative z-10 mb-16 flex justify-between items-end">
                <div>
                   <h2 className={cn("text-6xl uppercase tracking-tight mb-2", mood.header)}>{slide.title}</h2>
                   <p className={cn("text-sm uppercase tracking-widest", mood.sub)}>{slide.subtitle}</p>
                </div>
             </div>

             <div className="flex-1 grid grid-cols-3 gap-12 relative z-10">
                {slide.content.map((item, i) => (
                  <div key={i} className={cn("p-12 flex flex-col justify-center items-center text-center", mood.card)}>
                     <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40", mood.sub)}>{item.label}</span>
                     <span className={cn("text-7xl font-black mb-4", mood.header)}>{item.value}</span>
                     <div className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase", mood.accent)}>
                        {item.status}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'structural_breakdown':
        return (
          <div className={cn("flex-1 p-20 flex flex-col relative", mood.bg)}>
             <div className={cn("absolute inset-0 z-0", mood.pattern)} />
             <div className="flex-1 flex flex-col justify-center">
                <h2 className={cn("text-6xl uppercase tracking-tighter mb-16 text-center", mood.header)}>{slide.title}</h2>
                <div className="grid grid-cols-4 gap-8">
                   {slide.content.map((layer, i) => (
                     <div key={i} className={cn("p-10 text-center flex flex-col gap-6", mood.card)}>
                        <div className={cn("w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-xl font-black", mood.accent)}>
                           {i + 1}
                        </div>
                        <span className={cn("text-lg font-black uppercase", mood.header)}>{layer}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col h-full overflow-hidden relative", theme === 'dark' ? 'bg-corporate-950' : 'bg-white')}>
      <AnimatePresence>
        {step === 'config' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12">
            
            {/* Visual Style Selector (Horizontal Pill) */}
            <div className="w-full max-w-6xl mb-12 flex flex-col items-center">
               <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em] mb-8">Visual Style</h3>
               <div className="flex flex-wrap justify-center gap-3 bg-white/5 p-3 rounded-full border border-white/10">
                  {studioStyles.map((style) => (
                    <button 
                      key={style.id}
                      onClick={() => setSelectedMood(style.id as DesignMood)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                        selectedMood === style.id 
                          ? "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105" 
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {style.icon}
                      {style.name}
                    </button>
                  ))}
               </div>
            </div>

            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl bg-[#0a0c10] rounded-[4rem] border border-white/5 overflow-hidden flex flex-col">
              <div className="px-12 py-10 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-6">
                  <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500", getMoodStyles(selectedMood).accent)}>
                    <Presentation size={36} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-3xl tracking-tighter uppercase italic">Studio Engine v3.0</h3>
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mt-1">Multi-Architecture Synthesis</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-4"><X size={40} /></button>
              </div>

              <div className="p-12">
                 <textarea 
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   placeholder={lang === 'es' ? "Describe el tema de tu presentación..." : "Describe the topic of your presentation..."}
                   className="w-full h-48 bg-white/5 border-2 border-white/5 p-10 rounded-[3rem] text-white text-xl outline-none focus:border-blue-600 transition-all resize-none italic font-medium"
                 />
              </div>

              <div className="px-12 py-10 bg-white/5">
                 <button disabled={!topic} onClick={generateWithStyle} className="w-full bg-[#166534] hover:bg-green-700 text-white py-7 rounded-full font-black text-sm uppercase tracking-[0.6em] transition-all shadow-2xl flex items-center justify-center gap-6">
                   <Sparkles size={24} />
                   <span>{lang === 'es' ? 'GENERAR PRESENTACIÓN' : 'GENERATE PRESENTATION'}</span>
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-24 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-12 shrink-0 bg-white/80 dark:bg-corporate-950/80 backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#166534] rounded-2xl flex items-center justify-center text-white shadow-2xl">
            <Layout size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black tracking-tighter uppercase leading-none dark:text-white italic">Studio Viewer</h2>
            <p className="text-[10px] font-black text-[#166534] uppercase tracking-[0.3em] mt-1.5 opacity-60">Mood: {selectedMood.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={downloadPPT} className="px-8 py-3 bg-[#166534] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-500/20 flex items-center gap-3">
            <Download size={18} /> PPTX
          </button>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={32} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-100 dark:border-white/5 flex flex-col shrink-0 bg-[#f9fafb] dark:bg-black/20 p-8 space-y-6 overflow-y-auto">
           {slides.map((slide, i) => (
             <button key={slide.id} onClick={() => setSelectedSlide(i)} className={cn("w-full aspect-[16/10] rounded-[2.5rem] border-4 transition-all overflow-hidden relative group", selectedSlide === i ? "border-[#166534] shadow-2xl scale-105" : "border-transparent bg-white dark:bg-white/5 shadow-sm")}>
                <div className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                <div className="h-full flex items-center justify-center p-6 text-center text-[8px] font-black uppercase tracking-tighter opacity-40 italic">{slide.title}</div>
             </button>
           ))}
        </aside>

        <main className="flex-1 p-16 flex flex-col relative overflow-hidden bg-[#eff1f4] dark:bg-corporate-950">
           {step === 'generating' && (
             <div className="absolute inset-0 z-50 bg-white/90 dark:bg-corporate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center space-y-10 text-center">
                <div className="relative">
                   <div className="w-32 h-32 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                   <Wand2 size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-4xl font-display font-black uppercase tracking-tighter text-blue-600">Synthesizing: {selectedMood.replace('_', ' ')}</h3>
             </div>
           )}

           <div className="flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {slides.length > 0 && (
                  <motion.div key={selectedSlide} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-[1300px] aspect-[16/9] bg-white dark:bg-corporate-900 rounded-[4.5rem] shadow-[0_60px_150px_rgba(0,0,0,0.12)] border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col relative">
                     {renderSlideContent(slides[selectedSlide])}
                     <div className="h-16 bg-[#f9fafb] dark:bg-black/20 px-16 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <span>Studio Architecture • Build 3.0</span>
                        <span className="text-[#166534]">Slide {selectedSlide + 1} / {slides.length}</span>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {slides.length > 0 && (
             <div className="mt-12 flex items-center justify-center gap-12">
                <button disabled={selectedSlide === 0} onClick={() => setSelectedSlide(s => s - 1)} className="w-20 h-20 bg-white dark:bg-corporate-800 rounded-[2.5rem] shadow-xl flex items-center justify-center text-slate-400 hover:text-[#166534] transition-all border border-slate-200"><ChevronLeft size={40} /></button>
                <div className="flex gap-4">
                   {slides.map((_, i) => <div key={i} className={cn("w-4 h-4 rounded-full transition-all duration-700", selectedSlide === i ? "w-16 bg-[#166534] shadow-[0_0_20px_rgba(22,101,52,0.4)]" : "bg-slate-200 dark:bg-white/10")} />)}
                </div>
                <button disabled={selectedSlide === slides.length - 1} onClick={() => setSelectedSlide(s => s + 1)} className="w-20 h-20 bg-white dark:bg-corporate-800 rounded-[2.5rem] shadow-xl flex items-center justify-center text-slate-400 hover:text-[#166534] transition-all border border-slate-200"><ChevronRight size={40} /></button>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};
