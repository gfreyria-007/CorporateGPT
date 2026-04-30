import React, { useState } from 'react';
import { 
  BrainCircuit, X, Plus, Trash2, RefreshCw, 
  ChevronRight, Sparkles, Layout, Type, Palette, 
  Zap, Database, BarChart3, Presentation, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateSkeleton, regenerateSlideSkeleton, renderSlideVisual, SlideSkeleton 
} from '@/services/geminiService';

interface PPTStudioProps {
  onClose: () => void;
  isOpen: boolean;
}

type StudioStep = 'config' | 'skeleton';

const studioStyles = [
  { id: 'cyber', name: 'Cyberpunk', icon: <Zap size={14} />, color: 'bg-blue-600' },
  { id: 'minimal', name: 'Executive', icon: <ChevronRight size={14} />, color: 'bg-slate-800' },
  { id: 'brutalist', name: 'Brutalist', icon: <Layout size={14} />, color: 'bg-orange-600' },
  { id: 'glass', name: 'Glass', icon: <Palette size={14} />, color: 'bg-purple-600' }
];

const PPTStudio: React.FC<PPTStudioProps> = ({ onClose, isOpen }) => {
  const [step, setStep] = useState<StudioStep>('config');
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [slides, setSlides] = useState<(SlideSkeleton & { rendered?: boolean, visualLayout?: string })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('minimal');

  if (!isOpen) return null;

  const startGeneration = async () => {
    setIsGenerating(true);
    try {
      const skeleton = await generateSkeleton(prompt, slideCount);
      setSlides(skeleton.map(s => ({ ...s, rendered: false, visualLayout: 'split' })));
      setStep('skeleton');
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGraphicsForSlide = async (index: number) => {
    setIsGenerating(true);
    try {
      const slide = slides[index];
      const design = await renderSlideVisual(slide.title, slide.subtitle, slide.content, selectedStyle);
      
      const newSlides = [...slides];
      newSlides[index] = { 
        ...newSlides[index], 
        rendered: true, 
        visualLayout: design.visualLayout || 'split',
        badge: design.badge || 'PHASE',
        narrativePhase: design.narrativePhase || 'ANALYSIS'
      };
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

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col text-slate-900 font-sans overflow-hidden">
      {/* Header Light */}
      <div className="h-20 border-b border-slate-200 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Neural Studio 6.2</h1>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", isGenerating ? "bg-yellow-500 animate-pulse" : "bg-green-500")} />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                {step === 'config' ? 'Setup' : 'Skeleton Editor'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {step === 'skeleton' && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {studioStyles.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    selectedStyle === s.id ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center p-20"
            >
              <div className="max-w-2xl w-full space-y-12">
                <div className="text-center space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">NUEVA ARQUITECTURA</span>
                  </div>
                  <h2 className="text-7xl font-black tracking-tighter leading-none text-slate-900 italic">Estructura primero. Diseño después.</h2>
                </div>

                <div className="bg-white p-2 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-200">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe tu presentación..."
                    className="w-full h-48 bg-slate-50 border-none rounded-[2.5rem] p-10 text-2xl font-medium focus:ring-0 outline-none resize-none placeholder:opacity-30 text-slate-800"
                  />
                  <div className="p-6 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">DIAPOSITIVAS</span>
                      <input 
                        type="number" value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))}
                        className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold w-16 text-center outline-none border border-slate-200"
                      />
                    </div>
                    <button 
                      onClick={startGeneration}
                      disabled={!prompt || isGenerating}
                      className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                      Generar Esqueleto <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'skeleton' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex">
              {/* Navegador Lateral */}
              <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slides Skeleton</h3>
                  <button onClick={() => {}} className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100">
                    <Plus size={14} className="text-slate-400" />
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
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2" 
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

              {/* Editor + Render Previa */}
              <div className="flex-1 bg-slate-50 p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto grid grid-cols-12 gap-10">
                  
                  {/* Panel de Texto */}
                  <div className="col-span-5 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Type size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Contenido de Texto</span>
                      </div>
                      <div className="space-y-4">
                        <input 
                          type="text" value={slides[activeSlide]?.title}
                          onChange={(e) => handleUpdateSlide(activeSlide, 'title', e.target.value)}
                          className="w-full text-2xl font-black tracking-tight outline-none border-b border-slate-100 focus:border-blue-600 transition-all py-2 text-slate-900 italic"
                          placeholder="Título de la slide"
                        />
                        <textarea 
                          value={slides[activeSlide]?.subtitle}
                          onChange={(e) => handleUpdateSlide(activeSlide, 'subtitle', e.target.value)}
                          className="w-full text-sm font-medium text-slate-500 outline-none resize-none h-20 placeholder:opacity-20"
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
                                className="bg-transparent text-lg font-medium text-slate-800 outline-none border-b border-transparent focus:border-slate-200 flex-1 py-1"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Excel Data Box */}
                        <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Excel / Table Data</p>
                            <select 
                              value={slides[activeSlide]?.chartType || 'none'}
                              onChange={(e) => handleUpdateSlide(activeSlide, 'chartType', e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-600/20"
                            >
                              <option value="none">Sin Gráfica</option>
                              <option value="bar_2d">Barras 2D</option>
                              <option value="bar_3d">Barras 3D</option>
                              <option value="pie_2d">Circular 2D</option>
                              <option value="pie_3d">Circular 3D</option>
                              <option value="line">Líneas</option>
                              <option value="area">Área</option>
                            </select>
                          </div>
                          <textarea 
                            value={slides[activeSlide]?.tableData}
                            onChange={(e) => handleUpdateSlide(activeSlide, 'tableData', e.target.value)}
                            placeholder="Pega aquí tus datos de Excel (Celdas, Columnas...)"
                            className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-600/20 resize-none placeholder:opacity-30"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => renderGraphicsForSlide(activeSlide)}
                        disabled={isGenerating}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all mt-6 active:scale-95 shadow-lg shadow-slate-200"
                      >
                        {slides[activeSlide]?.rendered ? <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} /> : <ImageIcon size={14} />}
                        {slides[activeSlide]?.rendered ? 'Regenerar Gráficos' : 'Generar Visual'}
                      </button>
                    </div>
                  </div>

                  {/* Previsualización de Diseño */}
                  <div className="col-span-7">
                    <div className="aspect-video bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden relative group">
                      {!slides[activeSlide]?.rendered ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 space-y-4">
                          <ImageIcon size={64} className="opacity-10" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Vista previa no generada</p>
                        </div>
                      ) : (
                        <div className="w-full h-full p-12 flex flex-col bg-slate-950 text-white">
                          <div className="mb-8 flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">{selectedStyle} // L0{activeSlide+1}</span>
                            <BarChart3 size={20} className="text-white/20" />
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
                          {/* Marca de agua Neural */}
                          <div className="absolute bottom-8 right-8 opacity-20">
                             <BrainCircuit size={32} />
                          </div>
                        </div>
                      )}
                      
                      {isGenerating && activeSlide === activeSlide && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mb-4">
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

      <div className="h-10 bg-white border-t border-slate-200 flex items-center px-10 justify-between">
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span>Engine 6.2</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>Workflow: Incremental Synthesis</span>
        </div>
        <div className="flex items-center gap-2">
          <Presentation size={14} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Catalizia Neural Core</span>
        </div>
      </div>
    </div>
  );
};

export default PPTStudio;
