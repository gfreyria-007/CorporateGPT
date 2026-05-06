import React, { useState, useRef } from 'react';
import { 
  BrainCircuit, X, Plus, Minus, Trash2, RefreshCw, 
  ChevronRight, ChevronLeft, ChevronDown, Sparkles, Layout, Type, Palette, 
  Zap, Database, BarChart3, Presentation, Image as ImageIcon, Download,
  FileText, Upload, Eye, EyeOff, Check, ArrowRight, FileSpreadsheet, FileImage,
  Palette as Paint, Layers, Settings, Move, Target, Zap as Lightning
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../lib/translations';

type Stage = 1 | 2 | 3 | 4 | 5;

interface SlideContent {
  title: string;
  bullets: string[];
  imagePrompt?: string;
  chartData?: { label: string; value: number }[];
  chartType?: 'bar' | 'pie' | 'line';
  style?: string;
}

interface PPTcreatorProps {
  onClose: () => void;
  theme: string;
  lang: string;
  user: any;
  isMobile?: boolean;
}

const VISUAL_THEMES = [
  { id: 'bricks', name: 'Bricks', icon: '🧱', color: '#facc15' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', color: '#6366f1' },
  { id: 'whiteboard', name: 'White Board', icon: '🖊️', color: '#2563eb' },
  { id: 'blackboard', name: 'Black Board', icon: '🎨', color: '#1e293b' },
  { id: 'blueprint', name: 'Blue Print', icon: '📐', color: '#1e3a8a' },
  { id: 'scientific', name: 'Scientific', icon: '🔬', color: '#10b981' },
];

export const PPTcreator: React.FC<PPTcreatorProps> = ({ 
  onClose, 
  theme, 
  lang = 'es',
  user,
  isMobile = false 
}) => {
  const t = translations[lang || 'es'];
  const isDark = theme === 'dark';

  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Stage 1: Scope & Content
  const [slideCount, setSlideCount] = useState(5);
  const [contentSource, setContentSource] = useState<'text' | 'upload' | 'ai'>('text');
  const [contentInput, setContentInput] = useState('');

  // Stage 2: Engagement
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('professional');
  const [keyTakeaway, setKeyTakeaway] = useState('');

  // Stage 3: Narrative Arc
  const [narrative, setNarrative] = useState<SlideContent[]>([]);

  // Stage 4: Design Iterations
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('bricks');
  const [renderedSlides, setRenderedSlides] = useState<string[]>([]);
  const [renderedSlide, setRenderedSlide] = useState<string | null>(null);

  // Stage 5: Final
  const [isFinalized, setIsFinalized] = useState(false);

  const processContent = async () => {
    if (!contentInput.trim() && contentSource !== 'ai') return;
    setIsLoading(true);
    
    try {
      const systemPrompt = `You are a presentation expert. Create a slide-by-slide outline for a presentation.
Rules:
- Start with a compelling title slide
- Use the 0-100 narrative arc (hook, problem, solution, value, CTA)
- Each slide should have: title and 3-5 bullet points
- Return as JSON array with: title (string), bullets (array of strings)`;

      // In real implementation, this would call the AI
      // For now, generate mock narrative
      const mockNarrative: SlideContent[] = Array.from({ length: slideCount }, (_, i) => ({
        title: i === 0 ? 'Title Slide' : `Slide ${i}: Key Point ${i}`,
        bullets: [
          `Bullet point 1 for slide ${i}`,
          `Bullet point 2 for slide ${i}`,
          `Bullet point 3 for slide ${i}`,
        ]
      }));
      
      setNarrative(mockNarrative);
      setCurrentStage(2);
    } catch (error) {
      console.error('Error processing content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = () => {
    if (!audience.trim() || !keyTakeaway.trim()) return;
    setCurrentStage(3);
  };

  const confirmNarrative = () => {
    setCurrentSlideIndex(0);
    setRenderedSlide(null);
    setCurrentStage(4);
  };

  const renderSlide = async (index: number) => {
    if (index >= narrative.length || isFinalized) return;
    setIsLoading(true);
    
    // Mock rendering - in real implementation this calls the image generator
    const mockRendered = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect fill="${VISUAL_THEMES.find(t => t.id === selectedTheme)?.color || '#2563eb'}" width="1920" height="1080"/><text x="960" y="540" text-anchor="middle" fill="white" font-size="48">${narrative[index]?.title}</text></svg>`;
    
    setRenderedSlide(mockRendered);
    setRenderedSlides(prev => {
      const updated = [...prev];
      updated[index] = mockRendered;
      return updated;
    });
    setIsLoading(false);
  };

  const nextSlide = () => {
    if (currentSlideIndex < narrative.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setRenderedSlide(renderedSlides[currentSlideIndex + 1] || null);
    } else {
      setIsFinalized(true);
      setCurrentStage(5);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setRenderedSlide(renderedSlides[currentSlideIndex - 1] || null);
    }
  };

  const deleteSlide = (index: number) => {
    setNarrative(prev => prev.filter((_, i) => i !== index));
    setRenderedSlides(prev => prev.filter((_, i) => i !== index));
  };

  const exportAsPNG = () => {
    renderedSlides.forEach((slide, i) => {
      if (slide) {
        const link = document.createElement('a');
        link.href = slide;
        link.download = `slide-${i + 1}.png`;
        link.click();
      }
    });
  };

  const exportAsPDF = () => {
    alert('PDF export would be generated here');
  };

  const exportAsPPTX = () => {
    alert('PPTX export would be generated here');
  };

  // Stage 1: Scope & Content Intake
  const renderStage1 = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-auto">
      <div className="text-center space-y-3 sm:space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 1: Alcance' : 'Stage 1: Scope'}
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          {lang === 'es' ? '¿Cuántas diapositivas necesitas?' : 'How many slides do you need?'}
        </p>
      </div>

      <div className="w-full max-w-xs sm:max-w-md space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
            {lang === 'es' ? 'Número de diapositivas' : 'Number of slides'}
          </label>
          <input 
            type="range" 
            min="3" 
            max="20" 
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="text-center text-xl sm:text-2xl font-black text-blue-600">{slideCount}</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
            {lang === 'es' ? 'Fuente de contenido' : 'Content source'}
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { id: 'text', label: lang === 'es' ? 'Texto' : 'Text Input', icon: <Type size={18} /> },
              { id: 'upload', label: lang === 'es' ? 'Subir PDF' : 'Upload PDF', icon: <Upload size={18} /> },
              { id: 'ai', label: lang === 'es' ? 'Generar IA' : 'AI Generate', icon: <Sparkles size={18} /> },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setContentSource(option.id as any)}
                className={cn(
                  "p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1 sm:gap-2 transition-all",
                  contentSource === option.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-200 dark:border-white/10 hover:border-blue-600"
                )}
              >
                {option.icon}
                <span className="text-[10px] sm:text-xs font-black uppercase">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {contentSource === 'text' && (
          <textarea
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder={lang === 'es' ? 'Describe tu tema, objetivo y contenido principal...' : 'Describe your topic, objective, and main content...'}
            className="w-full h-32 sm:h-40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent resize-none text-sm sm:text-base"
          />
        )}

        <button
          onClick={processContent}
          disabled={isLoading || (!contentInput.trim() && contentSource !== 'ai')}
          className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? <RefreshCw className="animate-spin" /> : <ChevronRight />}
          {lang === 'es' ? 'Procesar Contenido' : 'Process Content'}
        </button>
      </div>
    </div>
  );

  // Stage 2: Engagement Calibration
  const renderStage2 = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-auto">
      <div className="text-center space-y-3 sm:space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 2: Calibración' : 'Stage 2: Calibration'}
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          {lang === 'es' 
            ? 'Responde estas 3 preguntas para personalizar tu presentación' 
            : 'Answer these 3 questions to customize your presentation'}
        </p>
      </div>

      <div className="w-full max-w-xs sm:max-w-md space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
            1. {lang === 'es' ? '¿Quién es tu audiencia?' : 'Who is your audience?'}
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={lang === 'es' ? 'Ej: Ejecutivos, Estudiantes...' : 'Ex: Executives, Students...'}
            className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-slate-400">
            2. {lang === 'es' ? '¿Qué tono prefieres?' : 'What tone do you prefer?'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['professional', 'casual', 'academic'].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "py-3 rounded-xl font-black text-xs uppercase transition-all",
                  tone === t 
                    ? "bg-blue-600 text-white" 
                    : "border border-slate-200 dark:border-white/10"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-slate-400">
            3. {lang === 'es' ? '¿Cuál es el mensaje clave?' : 'What is the key takeaway?'}
          </label>
          <textarea
            value={keyTakeaway}
            onChange={(e) => setKeyTakeaway(e.target.value)}
            placeholder={lang === 'es' 
              ? 'Una frase que quieres que recuerden...' 
              : 'One phrase you want them to remember...'}
            className="w-full h-24 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent resize-none"
          />
        </div>

        <button
          onClick={generateQuestions}
          disabled={isLoading || !audience.trim() || !keyTakeaway.trim()}
          className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? <RefreshCw className="animate-spin" /> : <ChevronRight />}
          {lang === 'es' ? 'Siguiente: Construir Narrativa' : 'Next: Build Narrative'}
        </button>
      </div>
    </div>
  );

  // Stage 3: Narrative Arc (Text Only)
  const renderStage3 = () => (
    <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 3: Narrativa' : 'Stage 3: Narrative Arc'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {lang === 'es' 
            ? 'Revisa el flujo de texto. Solo texto, sin imágenes aún.' 
            : 'Review the text flow. Text only, no images yet.'}
        </p>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4 overflow-auto">
        {narrative.map((slide, i) => (
          <div key={i} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs sm:text-sm font-black">
                {i + 1}
              </span>
              <h3 className="font-black uppercase text-sm sm:text-base">{slide.title}</h3>
            </div>
            <ul className="space-y-1 ml-8 sm:ml-10">
              {slide.bullets.map((bullet, j) => (
                <li key={j} className="text-xs sm:text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        onClick={confirmNarrative}
        className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px]"
      >
        <ChevronRight />
        {lang === 'es' ? 'Siguiente: Diseñar' : 'Next: Design & Enhance'}
      </button>
    </div>
  );

  // Stage 4: Slide-by-Slide Design
  const renderStage4 = () => (
    <div className="flex-1 flex flex-col p-3 sm:p-4 lg:p-8 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-xl font-black uppercase tracking-widest">
            {lang === 'es' ? 'Etapa 4: Diseño' : 'Stage 4: Design'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {currentSlideIndex + 1} / {narrative.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-xl border disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
            disabled={currentSlideIndex >= narrative.length - 1}
            className="p-2 rounded-xl border disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
          {lang === 'es' ? 'Seleccionar Tema' : 'Select Theme'}
        </label>
        <div className="flex flex-wrap gap-2">
          {VISUAL_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2",
                selectedTheme === theme.id
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 dark:border-white/10"
              )}
            >
              <span>{theme.icon}</span> <span className="hidden sm:inline">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide Preview / Render Area */}
      <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[300px]">
        {renderedSlide ? (
          <img src={renderedSlide} alt={`Slide ${currentSlideIndex + 1}`} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center p-4 sm:p-8">
            <Paint size={32} sm:size={48} className="mx-auto mb-2 sm:mb-4 text-slate-400" />
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === 'es' 
                ? 'Vista previa no disponible aún' 
                : 'Preview not available yet'}
            </p>
          </div>
        )}
      </div>

      {/* Slide Content */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900">
        <h3 className="font-black uppercase text-sm sm:text-base mb-1 sm:mb-2">{narrative[currentSlideIndex]?.title}</h3>
        <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
          {narrative[currentSlideIndex]?.bullets.map((bullet, j) => (
            <li key={j}>• {bullet}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 sm:gap-4">
        <button
          onClick={() => renderSlide(currentSlideIndex)}
          disabled={isLoading}
          className="flex-1 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? <RefreshCw className="animate-spin" /> : <Palette />}
          {lang === 'es' ? 'Renderizar' : 'Render'}
        </button>
        
        {currentSlideIndex < narrative.length - 1 ? (
          <button
            onClick={nextSlide}
            className="flex-1 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px]"
          >
            <ChevronRight />
            {lang === 'es' ? 'Siguiente' : 'Next'}
          </button>
        ) : (
          <button
            onClick={() => {
              setIsFinalized(true);
              setCurrentStage(5);
            }}
            className="flex-1 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Check />
            {lang === 'es' ? 'Finalizar' : 'Finalize'}
          </button>
        )}
      </div>
    </div>
  );

  // Stage 5: Final Management & Export
  const renderStage5 = () => (
    <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 5: Exportar' : 'Stage 5: Export'}
        </h2>
        <p className="text-sm text-slate-400">
          {lang === 'es' 
            ? 'Tu presentación está lista' 
            : 'Your presentation is ready'}
        </p>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto">
        {renderedSlides.map((slide, i) => (
          <div key={i} className="relative group">
            {slide ? (
              <img 
                src={slide} 
                alt={`Slide ${i + 1}`} 
                className="w-full aspect-video object-contain rounded-xl border" 
              />
            ) : (
              <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <span className="text-slate-400">{i + 1}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <button 
                onClick={() => deleteSlide(i)}
                className="p-2 bg-red-500 text-white rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setCurrentStage(4);
          setCurrentSlideIndex(0);
        }}
        className="py-3 border border-slate-200 dark:border-white/10 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <Plus size={16} />
        {lang === 'es' ? 'Agregar Diapositiva' : 'Add Slide'}
      </button>

      {/* Export Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button
          onClick={exportAsPNG}
          className="py-3 sm:py-4 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm flex flex-col items-center gap-1 sm:gap-2"
        >
          <FileImage size={20} />
          <span className="hidden sm:inline">PNG</span>
        </button>
        <button
          onClick={exportAsPDF}
          className="py-3 sm:py-4 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm flex flex-col items-center gap-1 sm:gap-2"
        >
          <FileText size={20} />
          <span className="hidden sm:inline">PDF</span>
        </button>
        <button
          onClick={exportAsPPTX}
          className="py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm flex flex-col items-center gap-1 sm:gap-2"
        >
          <Presentation size={20} />
          <span className="hidden sm:inline">PPTX</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden transition-colors duration-300",
      isDark ? "bg-corporate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Header */}
      <div className={cn(
        "h-14 sm:h-16 border-b flex items-center justify-between px-3 sm:px-6 lg:px-10 backdrop-blur-xl z-50 pt-safe",
        isDark ? "border-white/5 bg-corporate-950/80" : "border-slate-200 bg-white/80"
      )}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white">
            <BrainCircuit size={16} sm:size={18} />
          </div>
          <div className="hidden sm:block">
            <h1 className={cn(
              "text-sm font-black uppercase tracking-widest italic",
              isDark ? "text-white" : "text-slate-900"
            )}>PPT Creator</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {lang === 'es' ? `Etapa ${currentStage}` : `Stage ${currentStage}`} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Stage Indicator */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((stage) => (
            <div 
              key={stage}
              className={cn(
                "w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all",
                currentStage === stage 
                  ? "bg-blue-600 w-4 sm:w-6" 
                  : currentStage > stage 
                    ? "bg-emerald-500" 
                    : "bg-slate-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>

        <button 
          onClick={onClose} 
          className="p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X size={18} sm:size={20} />
        </button>
      </div>

      {/* Stage Content */}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentStage === stage 
                  ? "bg-blue-600 w-6" 
                  : currentStage > stage 
                    ? "bg-emerald-500" 
                    : "bg-slate-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>

        <button 
          onClick={onClose} 
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Stage Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {currentStage === 1 && renderStage1()}
          {currentStage === 2 && renderStage2()}
          {currentStage === 3 && renderStage3()}
          {currentStage === 4 && renderStage4()}
          {currentStage === 5 && renderStage5()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PPTcreator;