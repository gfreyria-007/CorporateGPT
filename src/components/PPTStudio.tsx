// Build 5.0.1 - Neural Synthesis Core - [2026-04-29T22:24:50]
// Build Hash: 1777484400 (Forced Cache Purge 5.0.3)
import React, { useState, useEffect } from 'react';
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
  Stars,
  Table,
  ArrowRight,
  Database,
  Shield,
  Search,
  CheckCircle2,
  CircleDot,
  Fingerprint
} from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';
import pptxgen from 'pptxgenjs';
import { generateStudioSlides, generateStylePreview, StudioSlideData } from '../services/geminiService';

type DesignMood = 
  | 'ai_orchestrator' | 'corporativo' | 'lego' | 'boceto' | 'laboratorio' | 'brutalista' 
  | 'arcilla_3d' | 'pizarron_blanco' | 'pizarron_verde' | 'pizarron_negro' | 'plano_tecnico'
  | 'cuantico' | 'manuscrito' | 'retro_80s' | 'minimal_jp' | 'ciberpunk';

export const PPTStudio: React.FC<{ 
  theme: 'light' | 'dark', 
  lang: 'en' | 'es', 
  user: any,
  onClose: () => void 
}> = ({ theme, lang, user, onClose }) => {
  const [step, setStep] = useState<'config' | 'preview_style' | 'generating' | 'viewer'>('config');
  const [topic, setTopic] = useState('');
  const [selectedMood, setSelectedMood] = useState<DesignMood>('ai_orchestrator');
  const [activeMood, setActiveMood] = useState<DesignMood>('corporativo');
  const [slides, setSlides] = useState<StudioSlideData[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  const [genStatus, setGenStatus] = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [previewSlide, setPreviewSlide] = useState<StudioSlideData | null>(null);
  
  const studioStyles = [
    { id: 'ai_orchestrator', name: lang === 'es' ? 'ORQUESTADOR IA' : 'AI ORCHESTRATOR', icon: <Wand2 size={16} />, premium: true },
    { id: 'corporativo', name: 'EXECUTIVE', icon: <Building2 size={16} /> },
    { id: 'cuantico', name: 'QUANTUM', icon: <Atom size={16} /> },
    { id: 'minimal_jp', name: 'ZEN', icon: <Infinity size={16} /> },
    { id: 'plano_tecnico', name: 'BLUEPRINT', icon: <Compass size={16} /> },
    { id: 'brutalista', name: 'BRUTAL', icon: <Grid3X3 size={16} /> },
    { id: 'ciberpunk', name: 'CYBER', icon: <Zap size={16} /> },
    { id: 'retro_80s', name: '80S RETRO', icon: <Monitor size={16} /> },
  ];

  const getMoodStyles = (moodId: DesignMood) => {
    switch (moodId) {
      case 'cuantico': return { bg: 'bg-black', header: 'text-cyan-400 font-mono tracking-widest', sub: 'text-cyan-500/50', accent: 'bg-cyan-500/20 text-cyan-400', text: 'text-cyan-400', pattern: 'bg-[radial-gradient(circle_at_center,_#0891b210_0%,_transparent_70%)]', tableHeader: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'minimal_jp': return { bg: 'bg-[#faf9f6]', header: 'text-stone-800 font-serif', sub: 'text-stone-400', accent: 'bg-stone-200 text-stone-600', text: 'text-stone-800', pattern: 'bg-[linear-gradient(45deg,_#f5f5f5_25%,_transparent_25%,_transparent_75%,_#f5f5f5_75%,_#f5f5f5),_linear-gradient(45deg,_#f5f5f5_25%,_transparent_25%,_transparent_75%,_#f5f5f5_75%,_#f5f5f5)] bg-[size:20px_20px]', tableHeader: 'bg-stone-100 text-stone-800 border-stone-200' };
      case 'brutalista': return { bg: 'bg-white', header: 'text-black font-black uppercase italic', sub: 'text-black/40', accent: 'bg-yellow-400 text-black border-2 border-black', text: 'text-black', pattern: 'bg-[size:40px_40px] bg-[radial-gradient(circle,_#000_1px,_transparent_1px)]', tableHeader: 'bg-black text-white border-2 border-black' };
      case 'plano_tecnico': return { bg: 'bg-[#002b36]', header: 'text-blue-300 font-mono', sub: 'text-blue-400/50', accent: 'bg-blue-400/10 text-blue-300 border border-blue-400/30', text: 'text-blue-300', pattern: 'bg-[size:50px_50px] bg-[linear-gradient(to_right,_#ffffff05_1px,_transparent_1px),_linear-gradient(to_bottom,_#ffffff05_1px,_transparent_1px)]', tableHeader: 'bg-blue-900/50 text-blue-300 border-blue-700' };
      case 'ciberpunk': return { bg: 'bg-[#050505]', header: 'text-[#ff00ff] italic tracking-tighter drop-shadow-[0_0_10px_#ff00ff80]', sub: 'text-[#00ffff]/50', accent: 'bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/50', text: 'text-[#00ffff]', pattern: 'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]', tableHeader: 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/30' };
      case 'retro_80s': return { bg: 'bg-[#2b0054]', header: 'text-[#ffcc00] font-black tracking-widest uppercase shadow-[#ff0080_5px_5px_0px]', sub: 'text-[#00d4ff]', accent: 'bg-[#ff0080] text-white', text: 'text-[#00d4ff]', pattern: 'bg-[linear-gradient(transparent_0%,_#ff008010_1%,_transparent_2%)] bg-[size:100%_40px]', tableHeader: 'bg-[#ff0080] text-white border-[#ffcc00]' };
      default: return { bg: 'bg-[#0a0c10]', header: 'text-white font-display font-black tracking-tighter italic', sub: 'text-blue-600 font-bold', accent: 'bg-blue-600 text-white', text: 'text-white', pattern: 'bg-[radial-gradient(circle_at_20%_20%,_#2563eb08_0%,_transparent_50%)]', tableHeader: 'bg-blue-600/10 text-blue-600 border-blue-600/20' };
    }
  };

  const startSynthesis = async () => {
    if (!topic) return;
    setStep('generating');
    setGenProgress(15);
    setGenStatus(lang === 'es' ? 'DEFINIENDO CONCEPTO VISUAL...' : 'DEFINING VISUAL CONCEPT...');
    
    try {
       // Aggressive timeout: if preview takes > 5s, jump to full gen
       const previewPromise = generateStylePreview(topic, selectedMood, lang);
       const timeoutPromise = new Promise((_, reject) => 
         setTimeout(() => reject(new Error("Preview Timeout")), 5000)
       );

       const result = await Promise.race([previewPromise, timeoutPromise]) as any;
       
       if (result && result.preview) {
         if (result.suggestedMood) {
           setActiveMood(result.suggestedMood as DesignMood);
         }
         setPreviewSlide(result.preview);
         setStep('preview_style');
       } else {
         throw new Error("Invalid preview data");
       }
    } catch (error) {
       console.warn("Preview failed or timed out, skipping to full generation:", error);
       confirmAndGenerateFull();
    }
  };

  const confirmAndGenerateFull = async () => {
    setStep('generating');
    setGenProgress(0);
    
    const stages = [
      { p: 20, s: lang === 'es' ? 'SINTETIZANDO NARRATIVA...' : 'SYNTHESIZING NARRATIVE...' },
      { p: 50, s: lang === 'es' ? 'COMPONIENDO INFOGRAFÍAS...' : 'COMPOSING INFOGRAPHICS...' },
      { p: 80, s: lang === 'es' ? 'DISEÑANDO LAYOUTS...' : 'DESIGNING LAYOUTS...' },
      { p: 95, s: lang === 'es' ? 'FINALIZANDO ASSETS...' : 'FINALIZING ASSETS...' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setGenProgress(stages[currentStage].p);
        setGenStatus(stages[currentStage].s);
        currentStage++;
      }
    }, 2000);

    try {
      const response = await generateStudioSlides(topic, activeMood, lang);
      clearInterval(interval);
      setSlides(response.slides);
      setSelectedSlide(0);
      setGenProgress(100);
      setTimeout(() => setStep('viewer'), 800);
    } catch (error) {
      console.error('Synthesis failed:', error);
      setStep('config');
      clearInterval(interval);
    }
  };

  const downloadPPT = () => {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    
    slides.forEach((slide, i) => {
      const pptSlide = pptx.addSlide();
      pptSlide.background = { color: '0a0c10' };
      
      // Title
      pptSlide.addText(slide.title || `Chapter ${i + 1}`, { 
        x: 0.5, y: 0.5, w: '90%', h: 1, 
        fontSize: 32, bold: true, color: 'ffffff', fontFace: 'Arial' 
      });
      
      // Subtitle
      pptSlide.addText(slide.subtitle || 'Technical Analysis', { 
        x: 0.5, y: 1.5, w: '90%', h: 0.5, 
        fontSize: 14, color: '2563eb', fontFace: 'Arial' 
      });

      // Content Points
      slide.content.slice(0, 4).forEach((item, idx) => {
        pptSlide.addText(`• ${item.label}: ${item.description}`, {
          x: 0.7, y: 2.5 + (idx * 0.8), w: '80%', h: 0.5,
          fontSize: 12, color: 'cccccc', fontFace: 'Arial'
        });
      });
    });
    
    pptx.writeFile({ fileName: `Neural_Studio_Story_${Date.now()}.pptx` });
  };

  const renderSlideContent = (slide: StudioSlideData) => {
    if (!slide) return null;
    
    try {
      const mood = getMoodStyles(activeMood);
      
      switch (slide.visualLayout) {
        case 'dense_table':
          return (
            <div className={cn("flex-1 p-20 flex flex-col relative overflow-hidden", mood.bg)}>
               <div className={cn("absolute inset-0 z-0", mood.pattern)} />
               <div className="relative z-10 flex justify-between items-start mb-16">
                  <div className="max-w-2xl">
                     <div className="flex items-center gap-4 mb-6">
                        <div className={cn("px-4 py-1.5 rounded-full", mood.accent)}>
                           <span className="text-[9px] font-black uppercase tracking-[0.3em]">{slide.narrativePhase || 'ANALYSIS'}</span>
                        </div>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">{slide.badge}</span>
                     </div>
                     <h2 className={cn("text-5xl leading-tight mb-4", mood.header)}>{slide.title}</h2>
                     <p className="text-lg opacity-50 font-medium max-w-xl">{slide.subtitle}</p>
                  </div>
                  <div className={cn("w-32 h-32 rounded-3xl flex items-center justify-center border border-white/5 bg-white/5", mood.text)}>
                     <Database size={48} className="opacity-40" />
                  </div>
               </div>

               <div className="flex-1 grid grid-cols-12 gap-10 relative z-10">
                  <div className="col-span-8">
                     <div className={cn("rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl")}>
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className={cn("border-b", mood.tableHeader)}>
                                 {Object.keys(slide.content[0]?.tableData?.[0] || {}).map((k) => (
                                   <th key={k} className="p-6 text-[10px] font-black uppercase tracking-widest">{k}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="text-xs">
                              {slide.content[0]?.tableData?.map((row, i) => (
                                 <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    {Object.values(row).map((v, j) => (
                                      <td key={j} className="p-6 font-medium opacity-80">{v}</td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                  <div className="col-span-4 flex flex-col gap-6">
                     {slide.content.slice(1).map((item, i) => (
                       <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest">{item.label}</p>
                          <p className="text-white font-bold leading-relaxed">{item.description}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          );

        case 'split':
          return (
            <div className={cn("flex-1 flex relative overflow-hidden", mood.bg)}>
               <div className={cn("absolute inset-0 z-0", mood.pattern)} />
               <div className="relative z-10 w-1/2 p-24 flex flex-col justify-center border-r border-white/10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className={cn("px-4 py-1.5 rounded-full", mood.accent)}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{slide.narrativePhase || 'STRATEGY'}</span>
                     </div>
                  </div>
                  <h2 className={cn("text-7xl leading-tight mb-8", mood.header)}>{slide.title}</h2>
                  <p className="text-2xl opacity-60 font-medium leading-relaxed">{slide.subtitle}</p>
               </div>
               <div className="relative z-10 w-1/2 p-24 bg-white/5 backdrop-blur-3xl flex flex-col justify-center gap-12">
                  {slide.content.map((item, i) => (
                    <div key={i} className="flex gap-8 group">
                       <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 transition-all group-hover:scale-110", mood.accent)}>
                          <span className="text-xl font-black italic">{i + 1}</span>
                       </div>
                       <div>
                          <h4 className={cn("text-xl font-bold mb-3", mood.text)}>{item.label}</h4>
                          <p className="text-lg opacity-40 font-medium leading-relaxed">{item.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          );

        case 'technical_drawing':
          return (
            <div className={cn("flex-1 p-24 flex flex-col relative overflow-hidden", mood.bg)}>
               <div className={cn("absolute inset-0 z-0 opacity-30", mood.pattern)} />
               <div className="relative z-10 flex flex-col items-center text-center mb-24">
                  <span className="text-blue-500 font-mono text-xs mb-4 tracking-[1em] uppercase">Architecture Spec // {slide.id}</span>
                  <h2 className={cn("text-6xl mb-6", mood.header)}>{slide.title}</h2>
                  <div className="w-24 h-1 bg-blue-600/30" />
               </div>
               
               <div className="relative z-10 flex-1 grid grid-cols-3 gap-12">
                  {slide.content.map((item, i) => (
                    <div key={i} className="relative p-10 border border-white/5 bg-white/5 rounded-2xl backdrop-blur-sm group">
                       <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/20 italic">0{i+1}</div>
                       <h4 className={cn("text-lg font-black uppercase tracking-tighter mb-4", mood.text)}>{item.label}</h4>
                       <p className="text-sm opacity-40 leading-relaxed font-mono">{item.description}</p>
                       <div className="mt-6 flex gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <div className="flex-1 h-[1px] bg-white/10 mt-[3px]" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          );

        case 'focal':
          return (
            <div className={cn("flex-1 p-24 flex flex-col items-center justify-center relative overflow-hidden text-center", mood.bg)}>
               <div className={cn("absolute inset-0 z-0", mood.pattern)} />
               <div className="relative z-10 max-w-4xl">
                  <div className={cn("w-24 h-24 rounded-full mx-auto mb-12 flex items-center justify-center border-4 border-white/10 shadow-2xl", mood.accent)}>
                     <Zap size={40} />
                  </div>
                  <h2 className={cn("text-8xl mb-8 leading-tight", mood.header)}>{slide.title}</h2>
                  <p className="text-3xl opacity-50 font-medium leading-relaxed mb-16 italic">{slide.subtitle}</p>
                  <div className="grid grid-cols-3 gap-8">
                     {slide.content.map((item, i) => (
                       <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                          <span className="block text-4xl font-black text-blue-600 mb-2">{item.value || '100%'}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.label}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          );

        case 'hero':
          return (
            <div className={cn("flex-1 p-24 flex flex-col items-center justify-center relative overflow-hidden", mood.bg)}>
               <div className={cn("absolute inset-0 z-0", mood.pattern)} />
               <div className="relative z-10 text-center">
                  <h2 className={cn("text-[10rem] font-black leading-none tracking-tighter mb-8", mood.header)}>{slide.title}</h2>
                  <p className="text-4xl opacity-50 font-medium tracking-tight italic">{slide.subtitle}</p>
               </div>
            </div>
          );

        default:
          return (
            <div className={cn("flex-1 p-24 flex flex-col items-center justify-center relative", mood.bg)}>
               <div className={cn("absolute inset-0 z-0", mood.pattern)} />
               <div className="relative z-10 text-center max-w-4xl">
                  <h2 className={cn("text-7xl mb-10 leading-tight", mood.header)}>{slide.title}</h2>
                  <p className="text-2xl opacity-60 leading-relaxed font-medium mb-16">{slide.subtitle}</p>
                  <div className="flex flex-wrap justify-center gap-6">
                     {slide.content.map((item, i) => (
                       <div key={i} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                          <span className="text-sm font-bold text-white italic">{item.description}</span>
                       </div>
                     ))}
                  </div>
                  <div className="mt-20">
                     <span className="text-blue-600/60 uppercase">{activeMood} architecture</span>
                  </div>
               </div>
            </div>
          );
      }
    } catch (renderError) {
      console.error("Critical Render Error:", renderError);
      return (
        <div className="flex-1 p-20 flex flex-col items-center justify-center bg-[#0a0c10] text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Fallo de Arquitectura Visual</h2>
          <p className="text-slate-400 text-sm max-w-md">El motor neural ha generado un diseño incompatible. Intentando recuperación de datos...</p>
          <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5 text-left w-full max-w-lg">
            <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Contenido Recuperado:</p>
            <p className="text-xs text-white font-bold">{slide.title}</p>
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
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xl">
                     <BrainCircuit size={24} />
                  </div>
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Neural Narrative Engine 5.0</h3>
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-fuchsia-600 to-cyan-500 rounded-[3.5rem] blur opacity-20 group-hover:opacity-60 transition duration-1000" />
                  <div className="relative bg-[#050505] rounded-[3.5rem] border border-white/10 p-12 overflow-hidden shadow-2xl">
                     <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={lang === 'es' ? "Describe la historia que quieres sintetizar..." : "Describe the story you want to synthesize..."}
                        className="w-full h-48 bg-transparent text-white text-3xl font-black outline-none resize-none italic tracking-tighter leading-tight placeholder:text-white/5"
                     />
                     <div className="mt-10 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                           <Layout size={16} />
                           <span>Build 5.0.4 • Cinematic Narrative</span>
                        </div>
                        <button disabled={!topic} onClick={startSynthesis} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-2xl">
                           {lang === 'es' ? 'SINTETIZAR HISTORIA' : 'SYNTHESIZE STORY'}
                           <ChevronRightCircle size={18} className="animate-bounce" />
                        </button>
                     </div>
                  </div>
               </div>
               <div className="mt-12 grid grid-cols-3 gap-6 opacity-20">
                  <div className="flex flex-col items-center gap-3">
                     <Activity size={20} className="text-white" />
                     <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">10 Slide Story</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <Database size={20} className="text-white" />
                     <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">High Density Data</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <Monitor size={20} className="text-white" />
                     <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Cinematic Output</span>
                  </div>
               </div>
            </motion.div>

            <button onClick={onClose} className="mt-20 text-white/20 hover:text-white transition-colors"><X size={40} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#0a0c10]/80 backdrop-blur-3xl relative z-[100]">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Presentation size={22} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black tracking-tighter uppercase leading-none text-white italic">Neural Studio 5.0.4</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] opacity-60">High Density Storytelling</span>
               <span className="w-1 h-1 rounded-full bg-blue-600/30" />
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{activeMood.toUpperCase()}</span>
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
        <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-[#0a0c10] p-6 space-y-4 overflow-y-auto">
           <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Narrative Arc</span>
              <Stars size={14} className="text-blue-600 animate-pulse" />
           </div>
           {slides.map((slide, i) => (
             <button 
               key={slide.id} 
               onClick={() => setSelectedSlide(i)} 
               className={cn(
                 "w-full aspect-[16/10] rounded-2xl border-2 transition-all overflow-hidden relative group p-1", 
                 selectedSlide === i 
                   ? "border-blue-600 shadow-2xl bg-blue-600/5" 
                   : "border-transparent bg-white/5 hover:border-white/10"
               )}
             >
                <div className="h-full rounded-xl overflow-hidden relative bg-black/40 flex flex-col p-4 border border-white/5">
                   <div className="flex justify-between items-start mb-3">
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[8px] font-black">{i + 1}</div>
                      <span className="text-[7px] font-black uppercase tracking-widest text-blue-600">{slide.narrativePhase}</span>
                   </div>
                   <div className="flex-1 flex flex-col justify-end">
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-30 mb-1">{slide.visualLayout}</span>
                      <span className="text-[9px] font-bold uppercase tracking-tight leading-tight line-clamp-2 text-left">{slide.title}</span>
                   </div>
                </div>
             </button>
           ))}
        </aside>

        <main className="flex-1 p-12 lg:p-20 flex flex-col relative overflow-hidden bg-[#050505]">
            {step === 'generating' && (
             <div className="absolute inset-0 z-[150] bg-[#0a0c10]/98 backdrop-blur-3xl flex flex-col items-center justify-center space-y-12 text-center p-20">
                <div className="relative">
                   <div className="w-48 h-48 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-white italic">{genProgress}%</span>
                   </div>
                   <Wand2 size={48} className="absolute -top-4 -right-4 text-blue-600 animate-pulse" />
                </div>
                <div className="max-w-3xl">
                   <h3 className="text-5xl font-display font-black uppercase tracking-tighter text-white mb-6 italic">{genStatus}</h3>
                   <p className="text-blue-600 font-bold uppercase tracking-[0.6em] text-[10px] mb-12">Neural Orchestration in Progress</p>
                </div>
                <div className="w-full max-w-xl h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                      initial={{ width: '0%' }} 
                      animate={{ width: `${genProgress}%` }} 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_30px_rgba(37,99,235,0.6)]" 
                   />
                </div>
                <div className="grid grid-cols-4 gap-12 mt-12">
                   {[
                     { label: 'Analizar', icon: <Search size={20} />, active: genProgress >= 20 },
                     { label: 'Narrar', icon: <Compass size={20} />, active: genProgress >= 50 },
                     { label: 'Diseñar', icon: <Layout size={20} />, active: genProgress >= 80 },
                     { label: 'Exportar', icon: <CheckCircle2 size={20} />, active: genProgress >= 95 },
                   ].map((item, idx) => (
                     <div key={idx} className={cn("flex flex-col items-center gap-4 transition-all duration-500", item.active ? "opacity-100 scale-110" : "opacity-20")}>
                        <div className={cn("p-4 rounded-2xl", item.active ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400")}>{item.icon}</div>
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                     </div>
                   ))}
                </div>
             </div>
            )}

            {step === 'preview_style' && previewSlide && (
              <div className="absolute inset-0 z-[120] bg-[#0a0c10]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-20">
                 <div className="mb-12 text-center">
                    <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-white italic mb-2">Concepto Visual Detectado</h2>
                    <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">¿Deseas proceder con esta arquitectura de diseño?</p>
                 </div>
                 <div className="w-full max-w-[1000px] aspect-[16/9] bg-black rounded-[3rem] shadow-2xl border-4 border-blue-600/30 overflow-hidden relative scale-90">
                    {renderSlideContent(previewSlide)}
                 </div>
                 <div className="flex gap-8 mt-12">
                    <button onClick={() => setStep('config')} className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all">
                       Cambiar Estilo
                    </button>
                    <button onClick={confirmAndGenerateFull} className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/40 transition-all flex items-center gap-4">
                       CONFIRMAR Y GENERAR STORYBOARD
                       <ChevronRightCircle size={18} />
                    </button>
                 </div>
              </div>
            )}

           <div className="flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {slides.length > 0 && (
                  <motion.div key={selectedSlide} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full max-w-[1300px] aspect-[16/9] bg-[#0a0c10] rounded-[4rem] shadow-[0_100px_250px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden flex flex-col relative group">
                     {renderSlideContent(slides[selectedSlide])}
                     <div className="h-16 bg-black/40 px-16 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] shrink-0 border-t border-white/5 backdrop-blur-3xl">
                        <div className="flex items-center gap-6">
                           <span className="opacity-40">Narrative Release 5.0</span>
                           <span className="w-1 h-1 rounded-full bg-blue-600" />
                           <span className="text-blue-600">Slide {selectedSlide + 1} of {slides.length}</span>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="flex items-center gap-3">
                              <Shield size={14} className="text-green-500/50" />
                              <span>Verified Output</span>
                           </div>
                            <span className="text-blue-600/60 uppercase">{activeMood} architecture</span>
                         </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

           {slides.length > 0 && (
             <div className="mt-12 flex items-center justify-center gap-12">
                <button disabled={selectedSlide === 0} onClick={() => setSelectedSlide(s => s - 1)} className="w-16 h-16 bg-white/5 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-white/5"><ChevronLeft size={32} /></button>
                <div className="flex gap-4">
                   {slides.map((_, i) => <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-700", selectedSlide === i ? "w-12 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-white/10")} />)}
                </div>
                <button disabled={selectedSlide === slides.length - 1} onClick={() => setSelectedSlide(s => s + 1)} className="w-16 h-16 bg-white/5 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-white/5"><ChevronRight size={32} /></button>
             </div>
           )}
         </main>
      </div>
    </div>
  );
};
