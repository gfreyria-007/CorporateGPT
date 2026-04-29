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
  Check,
  Zap,
  TrendingUp,
  BrainCircuit,
  Boxes,
  Microscope,
  Network
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
  type: 'hero' | 'infographic' | 'data_grid' | 'diagram' | 'process_flow';
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
          accent: 'bg-[#FFD500] text-black border-b-4 border-black/20', 
          header: 'text-[#FFD500] font-black uppercase tracking-tight font-sans',
          sub: 'text-white/80 font-bold uppercase tracking-widest',
          pattern: 'opacity-[0.1] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]',
          card: 'bg-white rounded-[1.5rem] border-b-8 border-r-8 border-black/20 text-slate-900 shadow-xl'
        };
      case 'plano_tecnico':
        return {
          bg: 'bg-[#003366]', 
          text: 'text-cyan-100',
          accent: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
          header: 'text-white font-mono tracking-tighter uppercase',
          sub: 'text-cyan-400/60 font-mono uppercase tracking-[0.2em]',
          pattern: 'opacity-[0.4] bg-[url("https://www.transparenttextures.com/patterns/graphy.png")]',
          card: 'bg-[#002b57] border-2 border-cyan-500/20 rounded-none font-mono shadow-[4px_4px_0_rgba(0,255,255,0.1)]'
        };
      case 'brutalista':
        return {
          bg: 'bg-[#f0f0f0]',
          text: 'text-black',
          accent: 'bg-black text-white',
          header: 'text-black font-black uppercase tracking-tighter leading-[0.85]',
          sub: 'text-black font-black uppercase tracking-widest border-b-4 border-black pb-2 inline-block',
          pattern: 'opacity-[0.03] bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]',
          card: 'bg-white border-4 border-black rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)]'
        };
      default: // Corporate Premium
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-900',
          accent: 'bg-[#166534] text-white shadow-xl shadow-green-500/10',
          header: 'text-[#166534] font-serif italic font-black tracking-tight',
          sub: 'text-slate-400 font-bold uppercase tracking-[0.3em]',
          pattern: 'opacity-[0.02] bg-[url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")]',
          card: 'bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100'
        };
    }
  };

  const generateWithStyle = async () => {
    if (!topic) return;
    setStep('generating');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 4500));
      
      const mockSlides: Slide[] = [
        {
          id: '1',
          type: 'hero',
          mood: selectedMood,
          title: topic.toUpperCase(),
          subtitle: lang === 'en' ? 'Advanced Strategic Intelligence Portfolio' : 'Portafolio de Inteligencia Estratégica Avanzada',
          badge: 'PREMIUM EXECUTIVE RELEASE',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
        },
        {
          id: '2',
          type: 'infographic',
          mood: selectedMood,
          title: lang === 'en' ? 'Core Performance Architecture' : 'Arquitectura de Rendimiento Core',
          subtitle: lang === 'en' ? 'Data integration and structural mapping' : 'Integración de datos y mapeo estructural',
          content: [
             { title: 'Neural Engine', val: '4.2ms', desc: 'Real-time response latency', icon: <BrainCircuit /> },
             { title: 'Data Flow', val: '128GB/s', desc: 'Throughput optimization', icon: <Zap /> },
             { title: 'Accuracy', val: '99.9%', desc: 'Verified synthesis precision', icon: <TrendingUp /> }
          ]
        },
        {
          id: '3',
          type: 'diagram',
          mood: selectedMood,
          title: lang === 'en' ? 'Integrated Solution Ecosystem' : 'Ecosistema de Solución Integrada',
          subtitle: lang === 'en' ? 'Bridging intelligence with action' : 'Conectando inteligencia con acción',
          content: [
             { label: 'Cloud Infrastructure', icon: <Cloud /> },
             { label: 'Local Processing', icon: <Cpu /> },
             { label: 'Strategic Output', icon: <FileText /> }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
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
      pptSlide.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 32, bold: true });
    });
    pptx.writeFile({ fileName: `Premium_Report_${Date.now()}.pptx` });
  };

  const renderSlideContent = (slide: Slide) => {
    const mood = getMoodStyles(slide.mood);
    
    switch (slide.type) {
      case 'hero':
        return (
          <div className={cn("flex-1 flex overflow-hidden relative", mood.bg)}>
            <div className={cn("absolute inset-0 z-0", mood.pattern)} />
            <div className="flex-1 flex flex-col justify-center px-24 z-10 relative">
               <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block", mood.accent)}>
                    {slide.badge}
                  </div>
                  <h1 className={cn("text-7xl max-w-3xl mb-8 leading-[1.05]", mood.header)}>
                    {slide.title}
                  </h1>
                  <p className={cn("text-2xl max-w-xl leading-relaxed opacity-60 font-medium", mood.sub)}>
                    {slide.subtitle}
                  </p>
               </motion.div>
            </div>
            {slide.imageUrl && (
              <div className="w-[45%] relative">
                 <img src={slide.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
                 <div className={cn("absolute inset-0 bg-gradient-to-r", mood.bg, "via-transparent to-transparent")} />
              </div>
            )}
          </div>
        );

      case 'infographic':
        return (
          <div className={cn("flex-1 p-24 flex flex-col relative", mood.bg)}>
             <div className={cn("absolute inset-0 z-0", mood.pattern)} />
             <div className="relative z-10 mb-20">
                <h2 className={cn("text-5xl mb-4 leading-tight", mood.header)}>{slide.title}</h2>
                <div className={cn("w-24 h-2 mb-6", mood.accent)} />
                <p className={cn("text-sm uppercase tracking-widest", mood.sub)}>{slide.subtitle}</p>
             </div>

             <div className="flex-1 grid grid-cols-3 gap-10 relative z-10">
                {slide.content.map((item, i) => (
                  <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className={cn("p-12 flex flex-col justify-between", mood.card)}>
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8", mood.accent)}>
                        {item.icon}
                     </div>
                     <div>
                        <span className={cn("text-5xl font-black block mb-4", mood.header)}>{item.val}</span>
                        <h4 className="text-lg font-black uppercase tracking-tight mb-2 opacity-80">{item.title}</h4>
                        <p className="text-xs opacity-50 font-medium leading-relaxed">{item.desc}</p>
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
             <div className="flex-1 flex gap-20">
                <div className="w-1/2 flex flex-col justify-center gap-10 relative z-10">
                   <h2 className={cn("text-5xl leading-tight mb-6", mood.header)}>{slide.title}</h2>
                   <div className="space-y-6">
                      {slide.content.map((item, i) => (
                        <div key={i} className={cn("p-8 flex items-center gap-8 transition-all hover:translate-x-4", mood.card)}>
                           <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", mood.accent)}>
                              {item.icon}
                           </div>
                           <span className="text-xl font-bold uppercase tracking-tight opacity-80">{item.label}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="w-1/2 relative group">
                   <div className={cn("absolute inset-0 rounded-[4rem] overflow-hidden", mood.card)}>
                      <img src={slide.imageUrl} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-12 left-12 right-12">
                         <div className={cn("px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 text-white")}>
                            <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">
                               {lang === 'es' ? 'La arquitectura definitiva que acelerará el descubrimiento mediante IA.' : 'The definitive architecture accelerating discovery via AI.'}
                            </p>
                         </div>
                      </div>
                   </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-12">
            
            <div className="w-full max-w-6xl mb-16 flex flex-col items-center">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xl">
                     <Palette size={24} />
                  </div>
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Premium Style Selector</h3>
               </div>
               <div className="flex flex-wrap justify-center gap-3 bg-white/5 p-4 rounded-[2.5rem] border border-white/10">
                  {studioStyles.map((style) => (
                    <button 
                      key={style.id}
                      onClick={() => setSelectedMood(style.id as DesignMood)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all",
                        selectedMood === style.id 
                          ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-105" 
                          : "text-white/30 hover:text-white hover:bg-white/5"
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-green-600 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative bg-[#0a0c10] rounded-[3.5rem] border border-white/10 p-12 overflow-hidden">
                     <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={lang === 'es' ? "¿Qué historia quieres contar hoy?" : "What story do you want to tell today?"}
                        className="w-full h-48 bg-transparent text-white text-3xl font-black outline-none resize-none italic tracking-tighter leading-tight placeholder:text-white/10"
                     />
                     <div className="mt-10 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                           <Layout size={16} />
                           <span>Build 4.0 Premium</span>
                        </div>
                        <button disabled={!topic} onClick={generateWithStyle} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-2xl">
                           {lang === 'es' ? 'ORQUESTAR SÍNTESIS' : 'ORCHESTRATE SYNTHESIS'}
                           <ChevronRightCircle size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>

            <button onClick={onClose} className="mt-20 text-white/20 hover:text-white transition-colors"><X size={40} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-24 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-12 shrink-0 bg-white/80 dark:bg-corporate-950/80 backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
            <Presentation size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black tracking-tighter uppercase leading-none dark:text-white italic">Neural Studio 4.0</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1.5 opacity-60">Architectural Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={downloadPPT} className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-3">
            <Download size={18} /> PPTX
          </button>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={32} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-100 dark:border-white/5 flex flex-col shrink-0 bg-[#f9fafb] dark:bg-black/20 p-8 space-y-6 overflow-y-auto">
           {slides.map((slide, i) => (
             <button key={slide.id} onClick={() => setSelectedSlide(i)} className={cn("w-full aspect-[16/10] rounded-[2rem] border-4 transition-all overflow-hidden relative group", selectedSlide === i ? "border-blue-600 shadow-2xl scale-105" : "border-transparent bg-white dark:bg-white/5 shadow-sm")}>
                <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-slate-900/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                   <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 mb-2">{slide.type}</span>
                   <span className="text-[10px] font-bold uppercase tracking-tight">{slide.title}</span>
                </div>
             </button>
           ))}
        </aside>

        <main className="flex-1 p-16 flex flex-col relative overflow-hidden bg-[#eff1f4] dark:bg-corporate-950">
           {step === 'generating' && (
             <div className="absolute inset-0 z-50 bg-white/95 dark:bg-corporate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-10 text-center">
                <div className="relative">
                   <div className="w-32 h-32 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                   <BrainCircuit size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-4xl font-display font-black uppercase tracking-tighter text-blue-600">Building High-Fidelity Infrastructure</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Orchestrating Composition Mood: {selectedMood.replace('_', ' ')}</p>
             </div>
           )}

           <div className="flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {slides.length > 0 && (
                  <motion.div key={selectedSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-[1300px] aspect-[16/9] bg-white dark:bg-corporate-900 rounded-[3.5rem] shadow-[0_60px_150px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col relative">
                     {renderSlideContent(slides[selectedSlide])}
                     <div className="h-16 bg-[#f9fafb] dark:bg-black/20 px-16 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <span>Neural Studio • Architectural View</span>
                        <span className="text-blue-600 font-black">Slide {selectedSlide + 1} of {slides.length}</span>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {slides.length > 0 && (
             <div className="mt-12 flex items-center justify-center gap-12">
                <button disabled={selectedSlide === 0} onClick={() => setSelectedSlide(s => s - 1)} className="w-16 h-16 bg-white dark:bg-corporate-800 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-200"><ChevronLeft size={32} /></button>
                <div className="flex gap-4">
                   {slides.map((_, i) => <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-700", selectedSlide === i ? "w-12 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-200 dark:bg-white/10")} />)}
                </div>
                <button disabled={selectedSlide === slides.length - 1} onClick={() => setSelectedSlide(s => s + 1)} className="w-16 h-16 bg-white dark:bg-corporate-800 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-200"><ChevronRight size={32} /></button>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};
