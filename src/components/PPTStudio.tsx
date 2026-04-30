import React, { useState } from 'react';
import { 
  BrainCircuit, X, Plus, Trash2, RefreshCw, 
  ChevronRight, Sparkles, Layout, Type, Palette, 
  Zap, Database, BarChart3, Presentation, Image as ImageIcon
} from 'lucide-react';
import { NeuralOverlay } from './NeuralOverlay';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateSkeleton, renderSlideVisual, SlideSkeleton,
  generateClarifyingQuestions, ClarifyingQuestion
} from '../services/geminiService';

type StudioStep = 'config' | 'clarify' | 'skeleton';

const studioStyles = [
  { id: 'cyber', name: 'Cyberpunk', icon: <Zap size={14} />, color: 'bg-blue-600' },
  { id: 'minimal', name: 'Executive', icon: <ChevronRight size={14} />, color: 'bg-slate-800' },
  { id: 'brutalist', name: 'Brutalist', icon: <Layout size={14} />, color: 'bg-orange-600' },
  { id: 'glass', name: 'Glass', icon: <Palette size={14} />, color: 'bg-purple-600' }
];

const PPTStudio: React.FC<{ 
  onClose: () => void, 
  theme: string, 
  lang: string, 
  user: any, 
  isMobile?: boolean 
}> = ({ onClose, theme, lang, user, isMobile = false }) => {
  const [step, setStep] = useState<StudioStep>('config');
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [slides, setSlides] = useState<(SlideSkeleton & { 
    rendered?: boolean, 
    visualLayout?: string, 
    badge?: string, 
    narrativePhase?: string 
  })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('minimal');
  const [genError, setGenError] = useState<string | null>(null);
  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Step 1: fetch clarifying questions
  const startClarify = async () => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const qs = await generateClarifyingQuestions(prompt);
      // If AI returns no questions, skip directly to generation
      if (!qs || qs.length === 0) {
        await generateWithContext('');
        return;
      }
      setClarifyQuestions(qs);
      setClarifyAnswers({});
      setStep('clarify');
      setIsGenerating(false); // Stop main loading to show questions
    } catch {
      // On any error, skip clarify and generate directly
      setGenError('Neural Interview no disponible, generando directamente...');
      setTimeout(() => setGenError(null), 3000);
      await generateWithContext('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2: generate slides with enriched context
  const generateWithContext = async (extraContext: string) => {
    setIsGenerating(true);
    setGenError(null);
    const enrichedPrompt = extraContext
      ? `${prompt}\n\nContexto adicional del usuario:\n${extraContext}`
      : prompt;
    try {
      const skeleton = await generateSkeleton(enrichedPrompt, slideCount);
      if (!skeleton || skeleton.length === 0) {
        setGenError('No se pudo generar contenido. Intenta con un prompt más específico o verifica tu API key de Gemini.');
        return;
      }
      setSlides(skeleton.map(s => ({ ...s, rendered: false, visualLayout: 'split' })));
      setStep('skeleton');
    } catch (error: any) {
      console.error("Error:", error);
      setGenError(`Error: ${error.message || 'Error al conectar con el motor de IA'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGraphicsForSlide = async (index: number) => {
    setIsGenerating(true);
    try {
      const slide = slides[index];
      const design = await renderSlideVisual(
        slide.title, 
        slide.subtitle, 
        slide.content, 
        selectedStyle,
        (slide as any).chartType,
        (slide as any).tableData,
        !!logoUrl
      );
      
      const newSlides = [...slides];
      newSlides[index] = { 
        ...newSlides[index], 
        rendered: true, 
        visualLayout: design.visualLayout || 'split',
        badge: design.badge || 'PHASE',
        narrativePhase: design.narrativePhase || 'ANALYSIS',
        visualInstruction: design.visualInstruction || ''
      } as any;
      setSlides(newSlides);
    } catch (e) {
      console.error("Render Error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSlide = (index: number, field: string, value: any) => {
    const newSlides = [...slides];
    (newSlides[index] as any)[field] = value;
    setSlides(newSlides);
  };

  const addSlide = () => {
    const newSlide: any = {
      id: Date.now().toString(),
      title: 'Nueva Diapositiva',
      subtitle: 'Añade un subtítulo aquí',
      content: ['Punto clave 1'],
      tableData: '',
      chartType: 'none',
      rendered: false,
      visualLayout: 'split'
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (activeSlide >= newSlides.length) {
      setActiveSlide(Math.max(0, newSlides.length - 1));
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden transition-colors duration-300",
      isDark ? "bg-corporate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <NeuralOverlay isLoading={isGenerating} theme={isDark ? 'dark' : 'light'} />
      {/* Header */}
      <div className={cn(
        "h-20 border-b flex items-center justify-between px-10 backdrop-blur-xl z-50",
        isDark
          ? "border-white/5 bg-corporate-950/80"
          : "border-slate-200 bg-white/80"
      )}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 ring-1 ring-white/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h1 className={cn(
              "text-sm font-black uppercase tracking-widest italic",
              isDark ? "text-white" : "text-slate-900"
            )}>Neural Studio 6.5</h1>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", isGenerating ? "bg-yellow-500" : "bg-green-500")} />
              <span className={cn(
                "text-[10px] uppercase tracking-widest font-bold",
                isDark ? "text-slate-400" : "text-slate-400"
              )}>
                {step === 'config' ? 'Setup' : step === 'clarify' ? 'Neural Interview' : 'Skeleton Editor'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {step === 'skeleton' && (
            <div className={cn(
              "flex items-center gap-2 p-1 rounded-xl border",
              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            )}>
              {studioStyles.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    selectedStyle === s.id
                      ? isDark
                        ? "bg-white/10 text-blue-400 border border-white/10"
                        : "bg-white text-blue-600 shadow-sm border border-slate-200"
                      : isDark
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={onClose} className={cn(
            "p-3 rounded-xl transition-colors border",
            isDark
              ? "hover:bg-white/5 border-white/10 text-slate-400 hover:text-white"
              : "hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700"
          )}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div 
              key="config"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center",
                isMobile ? "p-6" : "p-20"
              )}
            >
              <div className={cn("w-full space-y-8", isMobile ? "max-w-full" : "max-w-3xl")}>
                <div className="text-center space-y-4">
                  <div className={cn(
                    "inline-block px-4 py-1.5 rounded-full border",
                    isDark ? "bg-blue-600/10 border-blue-500/20" : "bg-blue-50 border-blue-100"
                  )}>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">NUEVA ARQUITECTURA</span>
                  </div>
                  <h2 className={cn(
                    "font-black tracking-tighter leading-none italic",
                    isMobile ? "text-5xl" : "text-8xl",
                    isDark ? "text-white" : "text-slate-950"
                  )}>Estructura primero. <br className={isMobile ? "" : "hidden"} /> Diseño después.</h2>
                </div>

                <div className={cn(
                  "rounded-[2.5rem] shadow-2xl border overflow-hidden",
                  isDark
                    ? "bg-white/[0.03] border-white/20 shadow-2xl backdrop-blur-2xl"
                    : "bg-white border-slate-300 shadow-2xl shadow-slate-200"
                )}>
                    <div className="flex flex-col relative z-10">
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={isMobile 
                        ? "¿De qué trata tu presentación?" 
                        : `Describe tu presentación en lenguaje natural...\n\nEjemplos:\n• "La historia de Tarzán en 3 slides"\n• "Estrategia de ventas Q3 2025"\n• "Resumen ejecutivo del mercado de IA"`
                      }
                      className={cn(
                        "w-full border-none p-10 font-medium focus:ring-0 outline-none resize-none placeholder:text-slate-500 placeholder:opacity-70 leading-relaxed bg-transparent",
                        isMobile ? "h-64 text-lg" : "h-56 text-2xl",
                        isDark ? "text-white placeholder:text-white/50" : "text-slate-800"
                      )}
                    />
                      <div className={cn(
                      "w-full px-8 py-8 flex border-t border-inherit",
                      isMobile ? "flex-col gap-6" : "items-center justify-between",
                      isDark ? "bg-white/2" : "bg-slate-50/50"
                    )}>
                       <div className={cn(
                         "flex items-center",
                         isMobile ? "justify-between w-full" : "gap-10"
                       )}>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slides</span>
                             <input 
                               min={1} max={25} type="number" value={slideCount}
                               onChange={(e) => setSlideCount(Math.min(25, Math.max(1, Number(e.target.value))))}
                               className={cn(
                                 "w-16 py-2 px-3 rounded-xl text-xs font-black text-center outline-none border transition-all",
                                 isDark ? "bg-white/10 border-white/20 text-white" : "bg-white border-slate-300 text-slate-900"
                               )}
                             />
                          </div>

                          {!isMobile && <div className="h-8 w-px bg-slate-400/20" />}

                          <div className="flex items-center gap-3">
                             {logoUrl ? (
                               <div className="relative group flex items-center gap-3">
                                  <img src={logoUrl} className="h-10 object-contain rounded-lg" alt="Logo" />
                                  <button onClick={() => setLogoUrl(null)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                    <X size={14} />
                                  </button>
                               </div>
                             ) : (
                               <label className={cn(
                                 "flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600/20 transition-all border border-blue-600/20",
                                 isMobile && "flex-1 justify-center"
                               )}>
                                  <ImageIcon size={14} /> {isMobile ? 'LOGO' : 'IMPORTAR LOGO'}
                                  <input 
                                    type="file" accept="image/*" className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                      }
                                    }} 
                                  />
                               </label>
                             )}
                          </div>
                       </div>

                       <button 
                         onClick={(e) => {
                           e.preventDefault();
                           startClarify();
                         }}
                         disabled={!prompt.trim() || isGenerating}
                         className={cn(
                           "bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/30 active:scale-95",
                           isMobile ? "w-full py-6 text-base" : "px-12 py-5 text-sm"
                         )}
                       >
                         {isGenerating ? (
                           <><RefreshCw size={18} className="animate-spin" /> {isMobile ? 'ANALIZANDO...' : 'EJECUTANDO NEURAL SCAN...'}</>
                         ) : (
                           <>Continuar <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                         )}
                       </button>
                    </div>
                  </div>
                </div>
                {genError && (
                  <div className="mt-8 px-8 py-5 bg-red-600/10 border border-red-500/30 rounded-[2rem] text-red-600 text-xs font-black uppercase tracking-[0.2em] text-center">
                    ⚠️ {genError}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'clarify' && (
            <motion.div
              key="clarify"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="flex-1 flex flex-col items-center justify-center p-16"
            >
              <div className="max-w-2xl w-full space-y-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 relative">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                      <BrainCircuit size={16} className="text-white" />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-blue-400" : "text-blue-600")}>
                      Neural Interview — {isGenerating ? 'Sincronizando...' : 'Define tu visión'}
                    </span>
                    {isGenerating && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30">
                        <Sparkles size={12} /> Procesando Insights...
                      </div>
                    )}
                  </div>
                  <h2 className={cn("text-4xl font-black tracking-tighter italic", isDark ? "text-white" : "text-slate-900")}>
                    Cuéntame más
                  </h2>
                  <p className={cn("text-sm font-medium opacity-50", isDark ? "text-white" : "text-slate-900")}>
                    &ldquo;{prompt}&rdquo;
                  </p>
                </div>

                <div className="space-y-6">
                  {clarifyQuestions.map((q, i) => (
                    <div key={q.id} className={cn(
                      "p-6 rounded-[1.5rem] border space-y-4",
                      isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
                    )}>
                      <div className="flex items-start gap-3">
                        <span className={cn("text-[10px] font-black opacity-30 mt-0.5 uppercase tracking-widest shrink-0", isDark ? "text-white" : "text-slate-900")}>0{i+1}</span>
                        <div className="space-y-1">
                          <p className={cn("text-sm font-black", isDark ? "text-white" : "text-slate-900")}>{q.question}</p>
                          <p className={cn("text-[10px] font-medium opacity-40", isDark ? "text-white" : "text-slate-500")}>{q.hint}</p>
                        </div>
                      </div>
                      {q.type === 'choice' && q.choices ? (
                        <div className="flex flex-wrap gap-2 pl-6">
                          {q.choices.map(c => (
                            <button
                              key={c}
                              onClick={() => setClarifyAnswers(prev => ({ ...prev, [q.id]: c }))}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                                clarifyAnswers[q.id] === c
                                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                  : isDark
                                    ? "bg-white/5 border-white/10 text-slate-300 hover:border-blue-500"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-500"
                              )}
                            >{c}</button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Tu respuesta..."
                          value={clarifyAnswers[q.id] || ''}
                          onChange={e => setClarifyAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className={cn(
                            "w-full pl-6 py-3 text-sm font-medium rounded-xl border outline-none transition-all bg-transparent",
                            isDark
                              ? "border-white/20 text-white placeholder:text-white/60 focus:border-blue-500"
                              : "border-slate-300 text-slate-900 placeholder:text-slate-600 focus:border-blue-600"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <button
                    onClick={() => setStep('config')}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                      isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => {
                      const ctx = clarifyQuestions
                        .filter(q => clarifyAnswers[q.id])
                        .map(q => `${q.question}: ${clarifyAnswers[q.id]}`)
                        .join('\n');
                      generateWithContext(ctx);
                    }}
                    disabled={isGenerating}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-600/40 active:scale-95 group"
                  >
                    {isGenerating
                      ? <><RefreshCw size={16} className="animate-spin" /> Sintetizando...</>
                      : <>Generar Presentación <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /></>}
                  </button>
                </div>
                {genError && (
                  <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold text-center animate-shake">
                    ⚠️ {genError}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'skeleton' && (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex">
              {/* Navegador Lateral */}
              <div className={cn(
                "w-80 border-r flex flex-col",
                isDark ? "border-white/5 bg-corporate-950" : "border-slate-200 bg-white"
              )}>
                <div className={cn(
                  "p-6 border-b flex items-center justify-between",
                  isDark ? "border-white/5" : "border-slate-100"
                )}>
                  <h3 className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-slate-400" : "text-slate-400")}>Slides Skeleton</h3>
                  <button onClick={addSlide} className={cn(
                    "p-2 rounded-lg border transition-colors",
                    isDark
                      ? "hover:bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      : "hover:bg-slate-50 border-slate-100 text-slate-400"
                  )}>
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {slides.map((s, i) => (
                    <button 
                      key={s.id}
                      onClick={() => setActiveSlide(i)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all border group relative",
                        activeSlide === i 
                          ? isDark
                            ? "bg-white/10 border-white/20 text-white shadow-xl translate-x-2"
                            : "bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2"
                          : isDark
                            ? "bg-white/5 border-white/5 hover:border-white/20 text-slate-400 hover:text-white"
                            : "bg-white border-slate-100 hover:border-slate-300 text-slate-600 shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black opacity-40 uppercase italic">0{i + 1}</span>
                        {s.rendered && <Sparkles size={10} className="text-blue-500" />}
                      </div>
                      <p className="text-xs font-bold truncate">{s.title || 'Untitled'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor + Render Preview */}
              <div className={cn(
                "flex-1 p-12 overflow-y-auto",
                isDark ? "bg-corporate-950" : "bg-slate-50"
              )}>
                <div className="max-w-5xl mx-auto grid grid-cols-12 gap-10">
                  
                  {/* Panel de Texto */}
                  <div className="col-span-5 space-y-8">
                    <div className={cn(
                      "p-8 rounded-[2rem] border shadow-sm space-y-6",
                      isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Type size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Contenido de Texto</span>
                      </div>
                      <div className="space-y-4">
                        <input 
                          type="text" value={slides[activeSlide]?.title}
                          onChange={(e) => handleUpdateSlide(activeSlide, 'title', e.target.value)}
                          className={cn(
                            "w-full text-2xl font-black tracking-tight outline-none border-b transition-all py-2 italic bg-transparent",
                            isDark
                              ? "border-white/10 focus:border-blue-500 text-white"
                              : "border-slate-100 focus:border-blue-600 text-slate-900"
                          )}
                          placeholder="Título de la slide"
                        />
                        <textarea 
                          value={slides[activeSlide]?.subtitle}
                          onChange={(e) => handleUpdateSlide(activeSlide, 'subtitle', e.target.value)}
                          className={cn(
                            "w-full text-sm font-medium outline-none resize-none h-20 placeholder:text-slate-500 placeholder:opacity-60 bg-transparent",
                            isDark ? "text-slate-300 placeholder:text-white/40" : "text-slate-600"
                          )}
                          placeholder="Contexto o subtítulo..."
                        />
                      </div>
                      
                      <div className="pt-10 space-y-10">
                        {/* Puntos Clave */}
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Puntos Clave</p>
                          {slides[activeSlide]?.content.map((point, pi) => (
                            <div key={pi} className="group flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              <input 
                                type="text" value={point} 
                                onChange={(e) => {
                                  const newContent = [...slides[activeSlide].content];
                                  newContent[pi] = e.target.value;
                                  handleUpdateSlide(activeSlide, 'content', newContent);
                                }}
                                className={cn(
                                  "bg-transparent text-lg font-medium outline-none border-b border-transparent flex-1 py-1 transition-colors",
                                  isDark
                                    ? "text-slate-200 focus:border-white/20"
                                    : "text-slate-800 focus:border-slate-200"
                                )}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Excel Data Box */}
                        <div className={cn(
                          "space-y-4 p-6 rounded-2xl border",
                          isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Excel / Table Data</p>
                            <select 
                              value={slides[activeSlide]?.chartType || 'none'}
                              onChange={(e) => handleUpdateSlide(activeSlide, 'chartType', e.target.value)}
                              className={cn(
                                "border rounded-lg text-[9px] font-black uppercase tracking-widest px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-600/20",
                                isDark
                                  ? "bg-white/10 border-white/10 text-white"
                                  : "bg-white border-slate-200 text-slate-900"
                              )}
                            >
                              <option value="none">Sin Gráfica</option>
                              <option value="bar">Barras</option>
                              <option value="bar_horizontal">Barras Horizontales</option>
                              <option value="bar_grouped">Barras Agrupadas</option>
                              <option value="line">Líneas</option>
                              <option value="area">Área</option>
                              <option value="pie">Circular (Pie)</option>
                              <option value="donut">Dona (Donut)</option>
                              <option value="radar">Radar</option>
                              <option value="scatter">Dispersión</option>
                              <option value="bubble">Burbuja</option>
                              <option value="waterfall">Cascada</option>
                              <option value="pyramid">Pirámide</option>
                            </select>
                          </div>
                          <textarea 
                            value={slides[activeSlide]?.tableData}
                            onChange={(e) => handleUpdateSlide(activeSlide, 'tableData', e.target.value)}
                            placeholder="Pega aquí tus datos de Excel (Celdas, Columnas...)"
                            className={cn(
                              "w-full h-32 border rounded-xl p-4 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-600/20 resize-none placeholder:opacity-30",
                              isDark
                                ? "bg-white/5 border-white/10 text-white"
                                : "bg-white border-slate-200 text-slate-900"
                            )}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => renderGraphicsForSlide(activeSlide)}
                        disabled={isGenerating}
                        className={cn(
                          "w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all mt-6 active:scale-95 shadow-lg",
                          isDark
                            ? "bg-white text-corporate-950 hover:bg-slate-100 shadow-white/10"
                            : "bg-slate-900 hover:bg-black text-white shadow-slate-200"
                        )}
                      >
                        {slides[activeSlide]?.rendered ? <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} /> : <ImageIcon size={14} />}
                        {slides[activeSlide]?.rendered ? 'Regenerar Gráficos' : 'Generar Visual'}
                      </button>
                    </div>
                  </div>

                  {/* Previsualización de Diseño */}
                  <div className="col-span-7">
                    <div className={cn(
                      "aspect-video rounded-[2rem] border shadow-2xl overflow-hidden relative group",
                      isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}>
                      {!slides[activeSlide]?.rendered ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                          <ImageIcon size={64} className={isDark ? "text-white/10" : "text-slate-300 opacity-30"} />
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isDark ? "text-white/20" : "text-slate-400 opacity-40"
                          )}>Vista previa no generada</p>
                        </div>
                      ) : (
                        <div className="w-full h-full p-12 flex flex-col bg-slate-950 text-white relative">
                          <div className="mb-8 flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">{selectedStyle} // L0{activeSlide+1}</span>
                            {logoUrl ? (
                              <img src={logoUrl} className="h-6 object-contain" alt="Branding" />
                            ) : (
                              <BarChart3 size={20} className="text-white/20" />
                            )}
                          </div>
                          <h3 className="text-4xl font-black mb-4 italic tracking-tighter uppercase">{slides[activeSlide].title}</h3>
                          <p className="text-lg text-white/40 font-medium mb-10">{slides[activeSlide].subtitle}</p>
                          <div className="grid grid-cols-2 gap-4">
                            {slides[activeSlide].content.map((p, i) => (
                              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs font-bold leading-relaxed">{p}</p>
                              </div>
                            ))}
                          </div>
                          <div className="absolute bottom-8 right-8 opacity-20">
                             <BrainCircuit size={32} />
                          </div>
                        </div>
                      )}
                      
                      {isGenerating && (
                        <div className={cn(
                          "absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-50",
                          isDark ? "bg-black/60" : "bg-white/80"
                        )}>
                          <div className={cn(
                            "w-16 h-1 rounded-full overflow-hidden mb-4",
                            isDark ? "bg-white/10" : "bg-slate-100"
                          )}>
                            <motion.div 
                              initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1 }}
                              className="w-full h-full bg-blue-600"
                            />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Sintetizando Visual...</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={cn(
        "h-10 border-t flex items-center px-10 justify-between",
        isDark ? "bg-corporate-950 border-white/5" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span>Engine 6.2</span>
          <span className={cn("w-1 h-1 rounded-full", isDark ? "bg-white/20" : "bg-slate-300")} />
          <span>Workflow: Incremental Synthesis</span>
        </div>
        <div className="flex items-center gap-2">
          <Presentation size={14} className="text-blue-600" />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest italic",
            isDark ? "text-white" : "text-slate-900"
          )}>Catalizia Neural Core</span>
        </div>
      </div>
    </div>
  );
};

export default PPTStudio;
