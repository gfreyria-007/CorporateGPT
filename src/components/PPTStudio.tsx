import React, { useState } from 'react';
import { 
  BrainCircuit, X, Plus, Minus, Trash2, RefreshCw, 
  ChevronRight, Sparkles, Layout, Type, Palette, 
  Zap, Database, BarChart3, Presentation, Image as ImageIcon
} from 'lucide-react';
import { NeuralOverlay } from './NeuralOverlay';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateSkeleton, renderSlideVisual, SlideSkeleton,
  generateClarifyingQuestions, ClarifyingQuestion,
  generateProImageForSlide
} from '../services/geminiService';

type StudioStep = 'config' | 'clarify' | 'skeleton';

const studioStyles = [
  { id: 'auto', name: 'Auto-select', icon: <RefreshCw size={14} />, color: 'bg-blue-500' },
  { id: 'sketch', name: 'Sketch Note', icon: <Palette size={14} />, color: 'bg-slate-500' },
  { id: 'kawaii', name: 'Kawaii', icon: <Sparkles size={14} />, color: 'bg-pink-400' },
  { id: 'professional', name: 'Professional', icon: <Shield size={14} />, color: 'bg-blue-800' },
  { id: 'scientific', name: 'Scientific', icon: <Database size={14} />, color: 'bg-emerald-600' },
  { id: 'anime', name: 'Anime', icon: <Zap size={14} />, color: 'bg-orange-500' },
  { id: 'clay', name: 'Clay', icon: <Layout size={14} />, color: 'bg-red-400' },
  { id: 'editorial', name: 'Editorial', icon: <Type size={14} />, color: 'bg-slate-900' },
  { id: 'instructional', name: 'Instructional', icon: <Presentation size={14} />, color: 'bg-indigo-600' },
  { id: 'bento', name: 'Bento Grid', icon: <Layout size={14} />, color: 'bg-purple-600' },
  { id: 'bricks', name: 'Bricks', icon: <Box size={14} />, color: 'bg-yellow-500' }
];

import { Shield, Box, Download, FileText } from 'lucide-react';

const PPTStudio: React.FC<{ 
  onClose: () => void, 
  theme: string, 
  lang: string, 
  user: any, 
  isMobile?: boolean 
}> = ({ onClose, theme, lang, user, isMobile = false }) => {
  const isDark = theme === 'dark';

  const parseTableData = (data: string) => {
    if (!data) return [];
    return data.split('\n').map(line => {
      const parts = line.split(/[,\t]/);
      return { label: parts[0]?.trim(), value: parseFloat(parts[1]) || 0 };
    }).filter(p => p.label && !isNaN(p.value));
  };

  const NeuralChart = ({ type, data, style = 'auto' }: { type: string, data: string, style?: string }) => {
    const points = parseTableData(data);
    if (points.length === 0) return null;

    const maxVal = Math.max(...points.map(p => p.value));
    const height = 180;
    const width = 450;
    const padding = 30;

    const isScientific = style === 'scientific';
    const isBricks = style === 'bricks';

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Background grid for scientific */}
          {isScientific && (
            <g className="opacity-20">
              {[0, 25, 50, 75, 100].map(v => {
                const y = height - padding - (v/100) * (height - padding * 2);
                return <line key={v} x1={padding} y1={y} x2={width-padding} y2={y} stroke="#22d3ee" strokeDasharray="4 4" />;
              })}
            </g>
          )}

          {type === 'bar' && points.map((p, i) => {
            const barWidth = (width - padding * 2) / points.length - 15;
            const barHeight = (p.value / maxVal) * (height - padding * 2);
            const x = padding + i * (barWidth + 15);
            const y = height - padding - barHeight;

            if (isBricks) {
              // LEGO Style Bar
              const studs = Math.ceil(barHeight / 15);
              return (
                <g key={i}>
                  {Array.from({ length: studs }).map((_, si) => (
                    <rect 
                      key={si}
                      x={x} 
                      y={height - padding - (si + 1) * 15} 
                      width={barWidth} 
                      height={14} 
                      fill={['#ef4444', '#3b82f6', '#f59e0b', '#10b981'][i % 4]}
                      rx="2"
                    />
                  ))}
                  <text x={x + barWidth/2} y={height - padding + 15} textAnchor="middle" fontSize="10" fill={isDark ? 'white' : 'black'} fontWeight="900" className="uppercase tracking-tighter">{p.label}</text>
                </g>
              );
            }

            return (
              <g key={i}>
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill={isScientific ? 'url(#sciGradient)' : (isDark ? '#3b82f6' : '#2563eb')}
                  rx={isScientific ? "0" : "8"}
                  className="transition-all duration-1000"
                />
                {isScientific && <line x1={x} y1={y} x2={x+barWidth} y2={y} stroke="#22d3ee" strokeWidth="2" />}
                <text 
                  x={x + barWidth/2} 
                  y={height - padding + 15} 
                  textAnchor="middle" 
                  fontSize="8" 
                  fill={isDark ? 'white' : 'black'} 
                  opacity="0.5"
                  className="font-mono font-bold"
                >{p.label}</text>
              </g>
            );
          })}

          {type === 'line' && (
            <g>
              {isScientific && (
                <defs>
                  <linearGradient id="sciLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>
              )}
              <polyline
                fill={isScientific ? "url(#sciLineGrad)" : "none"}
                stroke={isScientific ? "#22d3ee" : (isDark ? '#3b82f6' : '#2563eb')}
                strokeWidth={isBricks ? "8" : "3"}
                strokeLinecap={isBricks ? "square" : "round"}
                points={points.map((p, i) => {
                  const x = padding + i * ((width - padding * 2) / (points.length - 1));
                  const y = height - padding - (p.value / maxVal) * (height - padding * 2);
                  return `${x},${y}`;
                }).join(' ')}
              />
              {points.map((p, i) => {
                const x = padding + i * ((width - padding * 2) / (points.length - 1));
                const y = height - padding - (p.value / maxVal) * (height - padding * 2);
                return <circle key={i} cx={x} cy={y} r={isBricks ? "6" : "4"} fill={isBricks ? "white" : (isScientific ? "#22d3ee" : "#3b82f6")} stroke={isBricks ? "black" : "none"} strokeWidth="2" />;
              })}
            </g>
          )}

          {isScientific && (
            <defs>
              <linearGradient id="sciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          )}
        </svg>
      </div>
    );
  };

  const [step, setStep] = useState<StudioStep>('config');
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [slides, setSlides] = useState<(SlideSkeleton & { 
    rendered?: boolean, 
    visualLayout?: string, 
    badge?: string, 
    narrativePhase?: string,
    generatedImageUrl?: string
  })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('minimal');
  const [genError, setGenError] = useState<string | null>(null);
  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Step 1: fetch clarifying questions
  const startClarify = async () => {
    console.log("[Studio] Starting Neural Interview clarify phase...");
    setIsGenerating(true);
    setGenError(null);
    try {
      console.log("[Studio] Generating questions for prompt:", prompt);
      const qs = await generateClarifyingQuestions(prompt);
      console.log("[Studio] Received questions:", qs);
      // If AI returns no questions, skip directly to generation
      if (!qs || qs.length === 0) {
        console.log("[Studio] No questions returned, skipping to direct generation...");
        await generateWithContext('');
        return;
      }
      setClarifyQuestions(qs);
      setClarifyAnswers({});
      setStep('clarify');
      setIsGenerating(false); // Stop main loading to show questions
    } catch (error: any) {
      console.error("[Studio] Clarify error:", error);
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
    console.log("[Studio] Generating slides with context...");
    setIsGenerating(true);
    setGenError(null);
    const enrichedPrompt = extraContext
      ? `${prompt}\n\nContexto adicional del usuario:\n${extraContext}`
      : prompt;
    try {
      const skeleton = await generateSkeleton(enrichedPrompt, slideCount);
      console.log("[Studio] Generated skeleton:", skeleton);
      if (!skeleton || skeleton.length === 0) {
        setGenError('No se pudo generar contenido. Intenta con un prompt más específico o verifica tu API key de Gemini.');
        return;
      }
      setSlides(skeleton.map(s => ({ ...s, rendered: false, visualLayout: 'split' })));
      setStep('skeleton');
    } catch (error: any) {
      console.error("[Studio] Error:", error.message);
      setGenError('La presentación tardó más de lo normal. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPPT = async () => {
    setIsGenerating(true);
    try {
      // @ts-ignore
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      
      slides.forEach(slide => {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: selectedStyle === 'scientific' ? '0F172A' : 'FFFFFF' };
        
        pptSlide.addText(slide.title, { 
          x: 0.5, y: 0.5, w: '90%', h: 1, 
          fontSize: 32, bold: true, 
          color: selectedStyle === 'scientific' ? '22D3EE' : '1E293B' 
        });
        
        pptSlide.addText(slide.subtitle, { 
          x: 0.5, y: 1.5, w: '90%', h: 0.5, 
          fontSize: 18, 
          color: selectedStyle === 'scientific' ? '94A3B8' : '64748B' 
        });
        
        slide.content.forEach((point, i) => {
          pptSlide.addText(`• ${point}`, { 
            x: 0.8, y: 2.5 + (i * 0.5), w: '80%', 
            fontSize: 14,
            color: selectedStyle === 'scientific' ? 'E2E8F0' : '334155'
          });
        });

        if (logoUrl) {
          pptSlide.addImage({ data: logoUrl, x: 8.5, y: 0.2, w: 1, h: 0.5 });
        }
      });
      
      await pptx.writeFile({ fileName: `CorporateGPT_${prompt.substring(0, 20)}.pptx` });
    } catch (error) {
      console.error("PPT Export Error:", error);
      setGenError("Error al exportar a PowerPoint");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('landscape');
      
      slides.forEach((slide, i) => {
        if (i > 0) doc.addPage();
        
        // Background
        doc.setFillColor(selectedStyle === 'scientific' ? '#0f0f0f' : '#ffffff');
        doc.rect(0, 0, 297, 210, 'F');
        
        doc.setTextColor(selectedStyle === 'scientific' ? '#222222' : '#1e1e1e');
        doc.setFontSize(28);
        doc.text(slide.title, 20, 30);
        
        doc.setTextColor('#646464');
        doc.setFontSize(16);
        doc.text(slide.subtitle, 20, 45);
        
        doc.setFontSize(12);
        slide.content.forEach((point, pi) => {
          doc.text(`• ${point}`, 25, 70 + (pi * 10));
        });
      });
      
      doc.save(`CorporateGPT_${prompt.substring(0, 20)}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
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
        visualInstruction: design.visualInstruction || '',
        chartType: design.chartType || (newSlides[index] as any).chartType,
        tableData: design.tableData || (newSlides[index] as any).tableData
      } as any;
      setSlides(newSlides);
    } catch (e) {
      console.error("Render Error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateProImage = async (index: number) => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const slide = slides[index];
      const imgBase64 = await generateProImageForSlide(
        slide.title,
        slide.subtitle,
        slide.content,
        selectedStyle,
        (slide as any).chartType,
        (slide as any).tableData,
        (slide as any).userImageUrl
      );
      
      const newSlides = [...slides];
      newSlides[index] = { 
        ...newSlides[index], 
        generatedImageUrl: imgBase64
      } as any;
      setSlides(newSlides);
    } catch (e: any) {
      console.error("Pro Image Generation Error:", e);
      setGenError(e.message || "Error al generar imagen PRO");
      setTimeout(() => setGenError(null), 5000);
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
        "h-16 sm:h-20 border-b flex items-center justify-between px-4 sm:px-10 backdrop-blur-xl z-50",
        isDark
          ? "border-white/5 bg-corporate-950/80"
          : "border-slate-200 bg-white/80"
      )}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 ring-1 ring-white/20">
            <BrainCircuit size={18} />
          </div>
          <div className="hidden sm:block">
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
                  onClick={() => {
                    setSelectedStyle(s.id);
                    // If auto is selected, the engine will pick a real style based on content
                    if (s.id === 'auto') {
                      const styles = studioStyles.filter(st => st.id !== 'auto');
                      const randomStyle = styles[Math.floor(Math.random() * styles.length)].id;
                      console.log("Auto-select engine picked:", randomStyle);
                      // In a real scenario, we'd use keywords from the prompt
                    }
                  }}
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
                    isMobile ? "text-5xl" : "text-7xl",
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
                        : "Describe tu presentación en lenguaje natural..."
                      }
                      className={cn(
                        "w-full border-none p-10 pb-4 font-medium focus:ring-0 outline-none resize-none placeholder:text-slate-500 placeholder:opacity-50 leading-relaxed bg-transparent",
                        isMobile ? "h-64 text-lg" : "h-40 text-2xl",
                        isDark ? "text-white placeholder:text-white/30" : "text-slate-800"
                      )}
                    />
                    
                    {!isMobile && !prompt && (
                      <div className="px-10 pb-6 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 self-center">Sugerencias:</span>
                        {[
                          { text: 'Historia de Tarzán en 3 slides', icon: '🌴' },
                          { text: 'Estrategia de ventas Q3 2025', icon: '📈' },
                          { text: 'Resumen ejecutivo IA', icon: '🧠' }
                        ].map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => setPrompt(sug.text)}
                            className={cn(
                              "px-4 py-2 rounded-full text-[11px] font-bold transition-all border flex items-center gap-2",
                              isDark 
                                ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-lg shadow-blue-200/20"
                            )}
                          >
                            <span>{sug.icon}</span> {sug.text}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Visual Style Selector */}
                    <div className="px-10 pb-8 space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isDark ? "text-blue-400" : "text-blue-600")}>
                           Choose Visual Style
                         </h3>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x no-scrollbar">
                        {studioStyles.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStyle(s.id)}
                            className={cn(
                              "flex-shrink-0 w-32 group relative snap-start transition-all",
                              selectedStyle === s.id ? "scale-105" : "hover:scale-102 opacity-60 hover:opacity-100"
                            )}
                          >
                            <div className={cn(
                              "aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden",
                              selectedStyle === s.id 
                                ? "bg-blue-600/10 border-blue-600 shadow-xl shadow-blue-600/20" 
                                : isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                            )}>
                               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", s.color)}>
                                 {s.icon}
                               </div>
                               {selectedStyle === s.id && (
                                 <motion.div layoutId="styleCheck" className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                   <Sparkles size={10} />
                                 </motion.div>
                               )}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className={cn(
                              "mt-2 text-[10px] font-black uppercase tracking-widest text-center",
                              selectedStyle === s.id ? "text-blue-600" : "text-slate-500"
                            )}>
                              {s.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
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
                            console.log('[Studio] Button Clicked - Starting Neural Interview');
                            try {
                              startClarify();
                            } catch (err) {
                              console.error('[Studio] Error starting clarification:', err);
                            }
                          }}
                          disabled={isGenerating || !prompt}
                          className={cn(
                            "group px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-4",
                            !prompt 
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                              : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-2xl shadow-blue-600/30 active:scale-[0.98]"
                          )}
                        >
                          {isGenerating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <span>Continuar</span>
                              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
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
                    “{prompt}”
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

                <div className="flex items-center justify-between mt-12">
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
                    <div key={s.id} className="relative group">
                      <button 
                        onClick={() => setActiveSlide(i)}
                        className={cn(
                          "w-full p-4 rounded-2xl text-left transition-all border relative overflow-hidden",
                          activeSlide === i 
                            ? isDark
                              ? "bg-white/10 border-white/20 text-white shadow-xl"
                              : "bg-slate-900 border-slate-900 text-white shadow-xl"
                            : isDark
                              ? "bg-white/5 border-white/5 hover:border-white/20 text-slate-400 hover:text-white"
                              : "bg-white border-slate-100 hover:border-slate-300 text-slate-600 shadow-sm"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black opacity-40 uppercase italic">Slide {i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
                          <div className="flex gap-1">
                            {s.rendered && <Sparkles size={10} className="text-blue-500" />}
                            {s.userImageUrl && <ImageIcon size={10} className="text-emerald-500" />}
                          </div>
                        </div>
                        <p className="text-xs font-bold truncate pr-6">{s.title || 'Untitled'}</p>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                        className={cn(
                          "absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10",
                          activeSlide === i ? "text-white/50 hover:text-red-400 hover:bg-white/10" : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        )}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={addSlide}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:bg-blue-600/5 hover:border-blue-600/30 text-slate-400 hover:text-blue-600 group",
                      isDark ? "border-white/10" : "border-slate-200"
                    )}
                  >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AÃ±adir Diapositiva</span>
                  </button>
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
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" value={slides[activeSlide]?.title}
                            onChange={(e) => handleUpdateSlide(activeSlide, 'title', e.target.value)}
                            className={cn(
                              "flex-1 text-2xl font-black tracking-tight outline-none border-b transition-all py-2 italic bg-transparent",
                              isDark
                                ? "border-white/10 focus:border-blue-500 text-white"
                                : "border-slate-100 focus:border-blue-600 text-slate-900"
                            )}
                            placeholder="TÃ­tulo de la slide"
                          />
                          <div className="flex gap-1 shrink-0">
                            <input 
                              type="file" 
                              id={`slide-image-${activeSlide}`}
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (re) => {
                                    handleUpdateSlide(activeSlide, 'userImageUrl', re.target?.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <button 
                              onClick={() => document.getElementById(`slide-image-${activeSlide}`)?.click()}
                              className={cn(
                                "p-2 rounded-xl transition-all border",
                                slides[activeSlide]?.userImageUrl 
                                  ? (isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-600")
                                  : (isDark ? "border-white/10 bg-white/5 text-white/40 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600")
                              )}
                              title="Anexar Imagen de Referencia"
                            >
                              <ImageIcon size={14} />
                            </button>
                            <button 
                              onClick={() => removeSlide(activeSlide)}
                              className={cn(
                                "p-2 rounded-xl transition-all border",
                                isDark ? "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white" : "border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                              )}
                              title="Borrar Slide"
                            >
                              <Minus size={14} />
                            </button>
                            <button 
                              onClick={addSlide}
                              className={cn(
                                "p-2 rounded-xl transition-all border",
                                isDark ? "border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500 hover:text-white" : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                              )}
                              title="Añadir Slide"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {slides[activeSlide]?.userImageUrl && (
                          <div className={cn(
                            "relative group aspect-video rounded-xl border overflow-hidden",
                            isDark ? "border-white/10" : "border-slate-200"
                          )}>
                            <img src={slides[activeSlide].userImageUrl} className="w-full h-full object-cover" alt="Referencia" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => handleUpdateSlide(activeSlide, 'userImageUrl', null)}
                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] text-white font-black uppercase tracking-widest">
                              Imagen de Referencia
                            </div>
                          </div>
                        )}

                        <textarea 
                          value={slides[activeSlide]?.subtitle}
                          onChange={(e) => handleUpdateSlide(activeSlide, 'subtitle', e.target.value)}
                          className={cn(
                            "w-full text-sm font-medium outline-none resize-none h-20 placeholder:text-slate-500 placeholder:opacity-60 bg-transparent",
                            isDark ? "text-slate-300 placeholder:text-white/40" : "text-slate-600"
                          )}
                          placeholder="Contexto o subtÃ­tulo..."
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
                              <option value="none">Sin GrÃ¡fica</option>
                              <option value="bar">Barras</option>
                              <option value="bar_horizontal">Barras Horizontales</option>
                              <option value="bar_grouped">Barras Agrupadas</option>
                              <option value="line">LÃ­neas</option>
                              <option value="area">Ãrea</option>
                              <option value="pie">Circular (Pie)</option>
                              <option value="donut">Dona (Donut)</option>
                              <option value="radar">Radar</option>
                              <option value="scatter">DispersiÃ³n</option>
                              <option value="bubble">Burbuja</option>
                              <option value="waterfall">Cascada</option>
                              <option value="pyramid">PirÃ¡mide</option>
                            </select>
                          </div>
                          <textarea 
                            value={slides[activeSlide]?.tableData}
                            onChange={(e) => handleUpdateSlide(activeSlide, 'tableData', e.target.value)}
                            placeholder="Pega aquÃ­ tus datos de Excel (Celdas, Columnas...)"
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
                          "w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all mt-6 active:scale-95 shadow-2xl group",
                          isDark
                            ? "bg-[#0f172a] text-white border border-white/10 hover:bg-[#1e293b]"
                            : "bg-[#0f172a] text-white hover:bg-black"
                        )}
                      >
                        <RefreshCw size={14} className={isGenerating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        Regenerar GrÃ¡ficos
                      </button>

                      <button 
                        onClick={() => generateProImage(activeSlide)}
                        disabled={isGenerating}
                        className={cn(
                          "w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all mt-3 active:scale-95 shadow-2xl relative overflow-hidden group",
                          isDark
                            ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white border border-white/20"
                            : "bg-slate-950 text-white hover:bg-black"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles size={16} className="text-blue-200 group-hover:scale-125 transition-transform" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sintetizar InfografÃ­a Maestra</span>
                        </div>
                        <span className="text-[8px] font-black text-blue-200/60 uppercase tracking-widest">IA Neural â€¢ IntegraciÃ³n de GrÃ¡ficos y Datos</span>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      {/* Finalize & Export Section */}
                      <div className="pt-8 space-y-4">
                        <div className="h-px bg-slate-400/10" />
                        <div className="flex gap-2">
                          <button 
                            onClick={exportToPDF}
                            disabled={isGenerating}
                            className="flex-1 py-4 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
                          >
                            <Download size={14} /> PDF
                          </button>
                          <button 
                            onClick={exportToPPT}
                            disabled={isGenerating}
                            className="flex-1 py-4 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                          >
                            <FileText size={14} /> PowerPoint
                          </button>
                          <button 
                            onClick={() => window.print()}
                            className="flex-1 py-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all"
                          >
                            <ImageIcon size={14} /> PNG Image
                          </button>
                        </div>
                        <p className={cn("text-[9px] font-black text-center opacity-30 uppercase tracking-[0.2em]")}>
                          Engine: {selectedStyle} // Vector Synthesis
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PrevisualizaciÃ³n de DiseÃ±o */}
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
                        <div className={cn(
                          "w-full h-full flex flex-col relative transition-all duration-700 overflow-hidden",
                          slides[activeSlide]?.generatedImageUrl ? "" : "p-12",
                          slides[activeSlide]?.generatedImageUrl ? "bg-black" :
                          selectedStyle === 'scientific' ? "bg-slate-950 text-cyan-50 font-mono" :
                          selectedStyle === 'bricks' ? "bg-[#1e40af] text-white" :
                          selectedStyle === 'kawaii' ? "bg-pink-50 text-pink-900" :
                          selectedStyle === 'sketch' ? "bg-white text-slate-800" :
                          selectedStyle === 'bento' ? "bg-slate-100 dark:bg-corporate-900 text-corporate-900 dark:text-white" :
                          "bg-slate-950 text-white"
                        )}>
                          {slides[activeSlide]?.generatedImageUrl ? (
                            <img src={slides[activeSlide].generatedImageUrl} className="w-full h-full object-cover" alt="Slide PRO" />
                          ) : (
                            <>
                              {/* Background Decorative Elements based on Style */}
                          {selectedStyle === 'scientific' && (
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
                              <div className="absolute inset-0 border-[0.5px] border-cyan-500/20 m-8" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-cyan-500/10 rounded-full" />
                              {/* Grid lines */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                            </div>
                          )}
                          {selectedStyle === 'bento' && (
                            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                              <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
                              <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
                            </div>
                          )}
                          {selectedStyle === 'bricks' && (
                            <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
                              <div className="grid grid-cols-12 gap-1 w-full h-full">
                                {Array.from({ length: 48 }).map((_, i) => (
                                  <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-sm" />
                                ))}
                              </div>
                              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400 rounded-lg rotate-12 shadow-2xl" />
                              <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500 rounded-lg -rotate-12 shadow-2xl" />
                            </div>
                          )}

                          <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.3em] italic",
                                  selectedStyle === 'auto' ? "text-purple-400 animate-pulse" :
                                  selectedStyle === 'scientific' ? "text-cyan-400" : "text-blue-500"
                                )}>
                                  {selectedStyle === 'auto' ? "Neural Auto-Select // Contextual Intelligence" : `${selectedStyle} // L0${activeSlide+1} // INFOGRAPHIC_CORE`}
                                </span>
                              </div>
                              {logoUrl ? (
                                <img src={logoUrl} className="h-8 object-contain" alt="Branding" />
                              ) : (
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  selectedStyle === 'scientific' ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-white/40"
                                )}>
                                  <BarChart3 size={16} />
                                </div>
                              )}
                            </div>

                            <h3 className={cn(
                              "font-black mb-4 tracking-tighter uppercase italic transition-all duration-500",
                              selectedStyle === 'scientific' ? "text-5xl text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" :
                              selectedStyle === 'bricks' ? "text-6xl text-white drop-shadow-lg" :
                              selectedStyle === 'kawaii' ? "text-5xl text-pink-600 italic-none tracking-normal font-bold" :
                              "text-4xl text-white"
                            )}>
                              {slides[activeSlide].title}
                            </h3>
                            
                            <p className={cn(
                              "text-lg font-medium mb-12 max-w-2xl transition-all",
                              selectedStyle === 'scientific' ? "text-cyan-200/60 uppercase tracking-widest text-xs" :
                              selectedStyle === 'bricks' ? "text-yellow-300 uppercase font-black" :
                              "text-white/40"
                            )}>
                              {slides[activeSlide].subtitle}
                            </p>

                            <div className={cn(
                              "flex-1 transition-all duration-500",
                              selectedStyle === 'bento' ? "grid grid-cols-3 gap-4" :
                              selectedStyle === 'scientific' ? "grid grid-cols-2 gap-8" :
                              "grid grid-cols-2 gap-4"
                            )}>
                              {slides[activeSlide].content.map((p, i) => (
                                <div key={i} className={cn(
                                  "p-6 transition-all relative overflow-hidden",
                                  selectedStyle === 'scientific' ? "bg-cyan-950/20 border-l-2 border-cyan-500/50" :
                                  selectedStyle === 'bricks' ? "bg-white text-blue-900 rounded-xl border-b-4 border-slate-300 shadow-lg font-black uppercase text-[11px]" :
                                  selectedStyle === 'kawaii' ? "bg-white text-pink-600 rounded-3xl border-2 border-pink-100 shadow-sm font-bold" :
                                  selectedStyle === 'bento' ? "bg-white/10 border border-white/5 rounded-2xl backdrop-blur-md" :
                                  "bg-white/5 border border-white/10 rounded-xl"
                                )}>
                                  {selectedStyle === 'scientific' && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                                  )}
                                  <p className={cn(
                                    "leading-relaxed",
                                    selectedStyle === 'scientific' ? "text-xs font-mono" :
                                    "text-xs font-bold"
                                  )}>{p}</p>
                                </div>
                              ))}

                              {(slides[activeSlide] as any).chartType !== 'none' && (
                                <div className={cn(
                                  "col-span-full mt-4 p-8 rounded-2xl flex items-center justify-center min-h-[300px] relative overflow-hidden",
                                  selectedStyle === 'scientific' ? "bg-cyan-950/30 border border-cyan-500/20" :
                                  selectedStyle === 'bricks' ? "bg-slate-100 border-4 border-slate-300" :
                                  "bg-black/5 border border-white/5"
                                )}>
                                  {selectedStyle === 'scientific' && (
                                    <div className="absolute inset-0 pointer-events-none opacity-10">
                                       <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22d3ee 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                    </div>
                                  )}
                                  {(slides[activeSlide] as any).tableData ? (
                                    <NeuralChart 
                                      type={(slides[activeSlide] as any).chartType} 
                                      data={(slides[activeSlide] as any).tableData} 
                                      style={selectedStyle}
                                    />
                                  ) : (
                                    <div className="text-center opacity-50">
                                      <BarChart3 size={32} className="mx-auto mb-2" />
                                      <p className="text-[10px] font-black uppercase tracking-widest">{(slides[activeSlide] as any).chartType} Chart Area</p>
                                      <p className="text-[8px] mt-1">{(slides[activeSlide] as any).visualInstruction || 'Render details pending...'}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="absolute bottom-10 right-10 flex items-center gap-4 opacity-30">
                               <div className="text-right">
                                  <p className="text-[8px] font-black uppercase tracking-[0.3em]">Neural Studio</p>
                                  <p className="text-[8px] font-black uppercase tracking-[0.3em]">Catalizia V2.5</p>
                               </div>
                               <BrainCircuit size={28} className={selectedStyle === 'scientific' ? "text-cyan-500" : "text-white"} />
                            </div>
                          </div>
                        </>
                      )}
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
