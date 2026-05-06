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
import * as geminiService from '../services/geminiService';

type Stage = 1 | 2 | 3 | 4 | 5;

interface SlideContent {
  title: string;
  subtitle?: string;
  bullets: string[];
  imagePrompt?: string;
  generatedImage?: string;
  chartData?: { label: string; value: number }[];
  chartType?: 'bar' | 'pie' | 'line' | 'doughnut' | 'radar' | 'scatter' | 'bubble';
  tableData?: string;
  hasImage?: boolean;
  hasChart?: boolean;
  style?: string;
  visualLayout?: 'split' | 'grid' | 'focal' | 'dense_table' | 'technical_drawing' | 'bento_grid';
}

interface PPTcreatorProps {
  onClose: () => void;
  theme: string;
  lang: string;
  user: any;
  isMobile?: boolean;
}

const VISUAL_THEMES = [
  { id: 'architect', name: 'Architect', icon: '🏛️', color: '#1e293b' },
  { id: 'isometric', name: 'Isometric', icon: '🧊', color: '#6366f1' },
  { id: 'blueprint', name: 'Blue Print', icon: '📐', color: '#1e3a8a' },
  { id: 'scientific', name: 'Scientific', icon: '🔬', color: '#10b981' },
  { id: 'clay', name: 'Clay 3D', icon: '🧶', color: '#f43f5e' },
  { id: 'bento', name: 'Bento Grid', icon: '🍱', color: '#8b5cf6' },
  { id: 'editorial', name: 'Editorial', icon: '📰', color: '#0f172a' },
  { id: 'sketch', name: 'Sketch', icon: '✏️', color: '#475569' },
  { id: 'kawaii', name: 'Kawaii', icon: '🌈', color: '#ff99cc' },
  { id: 'professional', name: 'Professional', icon: '💼', color: '#2563eb' },
  { id: 'anime', name: 'Anime', icon: '🎌', color: '#f43f5e' },
  { id: 'instructional', name: 'Instructional', icon: '📖', color: '#059669' },
  { id: 'bricks', name: 'Bricks', icon: '🧱', color: '#facc15' },
  { id: 'cardboard', name: 'Cardboard', icon: '📦', color: '#a8a29e' },
  { id: 'origami', name: 'Origami', icon: '🦢', color: '#f8fafc' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', color: '#6366f1' },
];

const CHART_TYPES = [
  { id: 'bar', name: 'Barras', icon: '📊' },
  { id: 'line', name: 'Líneas', icon: '📈' },
  { id: 'pie', name: 'Circular', icon: '🥧' },
  { id: 'doughnut', name: 'Donut', icon: '🍩' },
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

  // Stage 3: Narrative Arc - Editable
  const [isEditingNarrative, setIsEditingNarrative] = useState(false);
  const [editingSlideIdx, setEditingSlideIdx] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editBullets, setEditBullets] = useState('');
  const [narrative, setNarrative] = useState<SlideContent[]>([]);

  // Stage 4: Design with Chart/Image
  const [selectedLayout, setSelectedLayout] = useState<'split' | 'grid' | 'focal' | 'dense_table' | 'technical_drawing' | 'bento_grid'>('split');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'pie' | 'line' | 'doughnut' | null>(null);
  const [chartInput, setChartInput] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('bricks');
  const [renderedSlides, setRenderedSlides] = useState<string[]>([]);
  const [renderedSlide, setRenderedSlide] = useState<string | null>(null);
  
  // Image generation states
  const [imageSource, setImageSource] = useState<'upload' | 'ai' | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Stage 5: Final
  const [isFinalized, setIsFinalized] = useState(false);

  // Helper to update narrative
  const updateSlideContent = (index: number, updates: Partial<SlideContent>) => {
    setNarrative(prev => prev.map((slide, i) => 
      i === index ? { ...slide, ...updates } : slide
    ));
  };

  // Start editing a slide in Stage 3
  const startEditSlide = (index: number) => {
    setEditingSlideIdx(index);
    setEditTitle(narrative[index].title);
    setEditSubtitle(narrative[index].subtitle || '');
    setEditBullets(narrative[index].bullets.join('\n'));
    setIsEditingNarrative(true);
  };

  // Save edited slide
  const saveEditSlide = () => {
    if (editingSlideIdx !== null) {
      const bullets = editBullets.split('\n').filter(b => b.trim());
      updateSlideContent(editingSlideIdx, { 
        title: editTitle, 
        subtitle: editSubtitle,
        bullets 
      });
    }
    setIsEditingNarrative(false);
    setEditingSlideIdx(null);
  };

  // Add chart data to current slide
  const addChartToSlide = () => {
    if (!chartInput.trim() || !selectedChartType) return;
    
    // Parse "label,value" pairs
    const dataPairs = chartInput.split('\n').map(line => {
      const [label, value] = line.split(',').map(s => s.trim());
      return { label, value: parseFloat(value) || 0 };
    }).filter(p => p.label && p.value > 0);

    if (dataPairs.length > 0) {
      updateSlideContent(currentSlideIndex, {
        chartType: selectedChartType as any,
        chartData: dataPairs,
        hasChart: true
      });
    }
  };

  // Toggle image for current slide
  const toggleImageForSlide = () => {
    updateSlideContent(currentSlideIndex, {
      hasImage: !narrative[currentSlideIndex]?.hasImage
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateSlideContent(currentSlideIndex, {
        generatedImage: base64,
        hasImage: true
      });
    };
    reader.readAsDataURL(file);
  };

  // Generate image with AI
  const generateSlideImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const prompt = `${imagePrompt} - Professional presentation slide visual, 16:9 aspect ratio, clean corporate design, infographic style`;
      
      // Call the API directly
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateImage',
          model: 'imagen-4.0-fast-generate-001',
          prompt: prompt,
          aspectRatio: '16:9'
        })
      });
      
      const imgRes = await res.json();
      
      if (imgRes.error) throw new Error(imgRes.error);
      
      const imageBase64 = imgRes.imageBase64 || 
                         imgRes.predictions?.[0]?.bytesBase64Encoded || 
                         imgRes.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
      
      if (imageBase64) {
        const base64Image = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
        updateSlideContent(currentSlideIndex, {
          generatedImage: base64Image,
          imagePrompt: imagePrompt,
          hasImage: true
        });
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }
    setIsGeneratingImage(false);
  };

  // Reset image state for current slide
  const resetImageForSlide = () => {
    updateSlideContent(currentSlideIndex, {
      generatedImage: undefined,
      imagePrompt: undefined,
      hasImage: false
    });
    setImagePrompt('');
    setImageSource(null);
  };

  const processContent = async () => {
    const validSlides = Math.max(1, slideCount);
    setIsLoading(true);
    
    try {
      const userContent = contentInput.trim() || 'Professional Presentation';
      console.log('[PPT] Processing content for:', userContent, 'Slides:', validSlides);
      
      let skeleton: any[] = [];
      try {
        skeleton = await geminiService.generateSkeleton(userContent, validSlides);
      } catch (err) {
        console.error('[PPT] AI Skeleton generation failed:', err);
      }
      
      if (skeleton && Array.isArray(skeleton) && skeleton.length > 0) {
        const mappedContent: SlideContent[] = skeleton.map((s, idx) => ({
          title: s.title || `Slide ${idx + 1}`,
          subtitle: s.subtitle || '',
          bullets: Array.isArray(s.content) ? s.content : [s.content || '...'],
          chartType: s.chartType === 'none' ? undefined : s.chartType as any,
          tableData: s.tableData,
          hasChart: s.chartType !== 'none' && !!s.tableData,
          visualLayout: 'split'
        }));
        setNarrative(mappedContent);
      } else {
        console.warn('[PPT] Using fallback narrative');
        const fallback: SlideContent[] = [];
        for (let i = 0; i < validSlides; i++) {
          fallback.push({
            title: i === 0 ? userContent : `${userContent} - Part ${i + 1}`,
            subtitle: 'Strategic Overview',
            bullets: ['Analysis of key drivers', 'Performance metrics', 'Strategic recommendations'],
            visualLayout: 'split'
          });
        }
        setNarrative(fallback);
      }
      
      setCurrentStage(2);
    } catch (error) {
      console.error('CRITICAL: Error processing content:', error);
      alert(lang === 'es' 
        ? 'Error al procesar el contenido. Intentando con modo básico...' 
        : 'Error processing content. Attempting basic mode...');
      
      setNarrative([{
        title: contentInput || 'Presentation',
        bullets: ['Overview', 'Details', 'Conclusion'],
        visualLayout: 'split'
      }]);
      setCurrentStage(2);
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
    
    try {
      const slide = narrative[index];
      const style = selectedTheme;
      
      const rendered = await geminiService.generateProImageForSlide(
        slide.title,
        slide.subtitle || '',
        slide.bullets,
        style,
        slide.chartType || 'none',
        slide.tableData || '',
        slide.generatedImage,
        selectedLayout
      );
      
      setRenderedSlide(rendered);
      setRenderedSlides(prev => {
        const updated = [...prev];
        updated[index] = rendered;
        return updated;
      });
    } catch (error) {
      console.error('Render error:', error);
      // Fallback to simple SVG
      const fallback = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect fill="${VISUAL_THEMES.find(t => t.id === selectedTheme)?.color || '#2563eb'}" width="1920" height="1080"/><text x="960" y="540" text-anchor="middle" fill="white" font-size="48">${narrative[index]?.title}</text></svg>`;
      setRenderedSlide(fallback);
    } finally {
      setIsLoading(false);
    }
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
            min="1" 
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

        {(contentSource === 'text' || contentSource === 'ai') && (
          <textarea
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder={contentSource === 'ai' 
              ? (lang === 'es' ? 'Dale ideas a la IA: tema, objetivo, público objetivo...' : 'Give AI ideas: topic, goal, target audience...')
              : (lang === 'es' ? 'Describe tu tema, objetivo y contenido principal...' : 'Describe your topic, objective, and main content...')
            }
            className="w-full h-32 sm:h-40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent resize-none text-sm sm:text-base"
          />
        )}

        <button
          onClick={processContent}
          disabled={isLoading}
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

  // Stage 3: Narrative Arc - Editable
  const renderStage3 = () => {
    const currentSlide = narrative[editingSlideIdx || 0];
    
    if (isEditingNarrative && editingSlideIdx !== null) {
      return (
        <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 overflow-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
              {lang === 'es' ? 'Editar Diapositiva' : 'Edit Slide'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === 'es' 
                ? 'Edita el título y puntos de esta diapositiva' 
                : 'Edit title and bullets for this slide'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                {lang === 'es' ? 'Título' : 'Title'}
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-black uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                {lang === 'es' ? 'Subtítulo' : 'Subtitle'}
              </label>
              <input
                type="text"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                {lang === 'es' ? 'Puntos (uno por línea)' : 'Bullets (one per line)'}
              </label>
              <textarea
                value={editBullets}
                onChange={(e) => setEditBullets(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent resize-none text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditingNarrative(false); setEditingSlideIdx(null); }}
              className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 rounded-xl font-black uppercase text-sm"
            >
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              onClick={saveEditSlide}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-sm"
            >
              <Check size={18} />
              {lang === 'es' ? 'Guardar' : 'Save'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
            {lang === 'es' ? 'Etapa 3: Narrativa' : 'Stage 3: Narrative Arc'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'es' 
              ? 'Revisa y edita cada diapositiva. Haz clic en editar para modificar.' 
              : 'Review and edit each slide. Click edit to modify.'}
          </p>
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4 overflow-auto">
          {narrative.map((slide, i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs sm:text-sm font-black">
                    {i + 1}
                  </span>
                  <h3 className="font-black uppercase text-sm sm:text-base">{slide.title}</h3>
                </div>
                <button
                  onClick={() => startEditSlide(i)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase"
                >
                  {lang === 'es' ? 'Editar' : 'Edit'}
                </button>
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
  };

// Stage 4: Slide-by-Slide Design with Image & Chart
  const renderStage4 = () => {
    const currentSlide = narrative[currentSlideIndex];
    
    return (
      <div className="flex-1 flex flex-col p-3 sm:p-4 lg:p-8 space-y-3 sm:space-y-4 overflow-auto">
        <div className="flex items-center justify-between shrink-0">
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

        {/* Image Controls */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black uppercase text-slate-400">
              {lang === 'es' ? 'Imagen' : 'Image'}
            </label>
            {currentSlide?.hasImage && (
              <button onClick={resetImageForSlide} className="text-xs text-red-500 font-black uppercase">
                {lang === 'es' ? 'Eliminar' : 'Remove'}
              </button>
            )}
          </div>
          
          {currentSlide?.hasImage && currentSlide?.generatedImage ? (
            <div className="relative rounded-xl overflow-hidden border">
              <img src={currentSlide.generatedImage} alt="Slide" className="w-full aspect-video object-cover" />
            </div>
          ) : currentSlide?.hasImage ? (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 text-center">
              <p className="text-xs text-purple-500">{lang === 'es' ? 'Imagen configurada' : 'Image configured'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Image Source Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setImageSource('upload')}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2",
                    imageSource === 'upload'
                      ? "bg-purple-600 text-white"
                      : "border border-slate-200 dark:border-white/10"
                  )}
                >
                  <Upload size={14} />
                  {lang === 'es' ? 'Subir' : 'Upload'}
                </button>
                <button
                  onClick={() => setImageSource('ai')}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2",
                    imageSource === 'ai'
                      ? "bg-purple-600 text-white"
                      : "border border-slate-200 dark:border-white/10"
                  )}
                >
                  <Sparkles size={14} />
                  {lang === 'es' ? 'Generar IA' : 'AI Generate'}
                </button>
              </div>
              
              {/* Upload Option */}
              {imageSource === 'upload' && (
                <div className="p-3 border border-dashed border-slate-300 dark:border-white/20 rounded-xl text-center">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full py-2 text-xs font-black uppercase text-slate-400"
                  >
                    {lang === 'es' ? 'Seleccionar imagen' : 'Select image'}
                  </button>
                </div>
              )}
              
              {/* AI Generate Option */}
              {imageSource === 'ai' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={lang === 'es' ? 'Describe la imagen...' : 'Describe the image...'}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-xs"
                  />
                  <button
                    onClick={generateSlideImage}
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                    className="w-full py-2 bg-purple-600 text-white rounded-xl font-black text-xs uppercase disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingImage ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {lang === 'es' ? 'Generar' : 'Generate'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chart Type & Data Selection */}
        {selectedChartType && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 space-y-3 shrink-0">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                {lang === 'es' ? 'Tipo de gráfico' : 'Chart type'}
              </label>
              <div className="flex gap-2">
                {CHART_TYPES.map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => setSelectedChartType(chart.id as any)}
                    className={cn(
                      "px-3 py-2 rounded-lg font-black text-xs uppercase flex items-center gap-1",
                      selectedChartType === chart.id
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800"
                    )}
                  >
                    {chart.icon} {chart.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                {lang === 'es' ? 'Datos (etiqueta,valor - uno por línea)' : 'Data (label,value - one per line)'}
              </label>
              <textarea
                value={chartInput}
                onChange={(e) => setChartInput(e.target.value)}
                placeholder={lang === 'es' ? 'Ej:\nVentas, 100\nGastos, 75\nBeneficio, 25' : 'Example:\nSales, 100\nExpenses, 75\nProfit, 25'}
                rows={3}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-xs"
              />
              <button
                onClick={addChartToSlide}
                disabled={!chartInput.trim()}
                className="w-full py-2 bg-emerald-600 text-white rounded-lg font-black text-xs uppercase disabled:opacity-50"
              >
                {lang === 'es' ? 'Agregar Gráfico' : 'Add Chart'}
              </button>
            </div>
          </div>
        )}

        {/* Layout Selector */}
        <div className="space-y-2 shrink-0">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
            {lang === 'es' ? 'Estrategia Visual' : 'Visual Strategy'}
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'split', name: 'Split', icon: <Layers size={14} /> },
              { id: 'focal', name: 'Focal', icon: <Target size={14} /> },
              { id: 'bento_grid', name: 'Bento', icon: <Layout size={14} /> },
              { id: 'technical_drawing', name: 'Technical', icon: <Settings size={14} /> },
              { id: 'dense_table', name: 'Data Dense', icon: <Database size={14} /> },
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id as any)}
                className={cn(
                  "px-3 py-2 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2",
                  selectedLayout === layout.id
                    ? "bg-purple-600 text-white"
                    : "border border-slate-200 dark:border-white/10"
                )}
              >
                {layout.icon} <span>{layout.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selector */}
        <div className="space-y-2 shrink-0">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
            {lang === 'es' ? 'Seleccionar Estilo' : 'Select Style'}
          </label>
          <div className="flex flex-wrap gap-2">
            {VISUAL_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2",
                  selectedTheme === theme.id
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 dark:border-white/10"
                )}
              >
                <span>{theme.icon}</span> <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slide Preview / Render Area */}
        <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden min-h-[150px] sm:min-h-[200px]">
          {renderedSlide ? (
            <img src={renderedSlide} alt={`Slide ${currentSlideIndex + 1}`} className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-center p-4 sm:p-8">
              <Paint size={32} sm:size={48} className="mx-auto mb-2 sm:mb-4 text-slate-400" />
              <p className="text-xs sm:text-sm text-slate-400">
                {lang === 'es' ? 'Vista previa no disponible aún' : 'Preview not available yet'}
              </p>
            </div>
          )}
        </div>

        {/* Slide Content */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black uppercase text-sm sm:text-base">{currentSlide?.title}</h3>
            {currentSlide?.hasImage && <ImageIcon size={14} className="text-purple-500" />}
            {currentSlide?.hasChart && <BarChart3 size={14} className="text-emerald-500" />}
          </div>
          {currentSlide?.subtitle && (
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold mb-2 italic">{currentSlide.subtitle}</p>
          )}
          <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
            {currentSlide?.bullets.map((bullet, j) => (
              <li key={j}>• {bullet}</li>
            ))}
          </ul>
          {currentSlide?.chartData && (
            <div className="mt-2 p-2 bg-emerald-500/10 rounded-lg">
              <p className="text-xs font-black text-emerald-500 uppercase">{currentSlide.chartData.length} {lang === 'es' ? 'datos' : 'data points'}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 sm:gap-4 shrink-0">
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
  };

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
                {lang === 'es' ? `Etapa ${currentStage}` : `Stage ${currentStage}`} / 5 • v2.0.1
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

        <div className="flex items-center gap-2">
          {isLoading && (
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] font-black uppercase px-2 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20"
            >
              Reset
            </button>
          )}
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={18} sm:size={20} />
          </button>
        </div>
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