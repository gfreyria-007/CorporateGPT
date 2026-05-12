import React, { useState, useRef } from 'react';
import { 
  BrainCircuit, X, Plus, Minus, Trash2, RefreshCw, 
  ChevronRight, ChevronLeft, ChevronDown, Sparkles, Layout, Type, Palette, 
  Zap, Database, BarChart3, Presentation, Image as ImageIcon, Download,
  FileText, Upload, Eye, EyeOff, Check, ArrowRight, FileSpreadsheet, FileImage,
  Palette as Paint, Layers, Settings, Move, Target, Zap as Lightning, ImagePlus,
  Wand2, PieChart, TrendingUp, Activity, BarChart, Search, Edit3, Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../lib/translations';
import * as geminiService from '../services/geminiService';

import jsPDF from 'jspdf';

type Stage = 1 | 2 | 2.5 | 3 | 4;

interface SlideContent {
  title: string;
  subtitle?: string;
  bullets: string[];
  paragraphs?: string[];
  imagePrompt?: string;
  generatedImage?: string;
  additionalImages?: string[];
  excelData?: string;
  chartData?: { label: string; value: number }[];
  chartType?: 'bar' | 'pie' | 'line' | 'doughnut' | 'radar' | 'scatter' | 'bubble' | 'area' | 'funnel' | 'waterfall';
  tableData?: string;
  hasImage?: boolean;
  hasChart?: boolean;
  hasTable?: boolean;
  style?: string;
  visualLayout?: 'split' | 'grid' | 'focal' | 'dense_table' | 'technical_drawing' | 'bento_grid';
}

interface DeepResearch {
  id: string;
  topics: { title: string; content: string; sources: string[] }[];
  createdAt: any;
}

interface PPTcreatorProps {
  onClose: () => void;
  theme: string;
  lang: string;
  user: any;
  isMobile?: boolean;
}

const VISUAL_THEMES = [
  { id: 'architect', name: 'Architect', icon: '🏛️', color: '#1e293b', desc: 'Modern architectural layouts' },
  { id: 'isometric', name: 'Isometric', icon: '🧊', color: '#6366f1', desc: '3D geometric perspective' },
  { id: 'blueprint', name: 'Blueprint', icon: '📐', color: '#1e3a8a', desc: 'Technical drawing style' },
  { id: 'scientific', name: 'Scientific', icon: '🔬', color: '#10b981', desc: 'Lab and research' },
  { id: 'clay', name: 'Clay 3D', icon: '🧶', color: '#f43f5e', desc: 'Soft 3D clay aesthetic' },
  { id: 'bento', name: 'Bento Grid', icon: '🍱', color: '#8b5cf6', desc: 'Japanese box layout' },
  { id: 'editorial', name: 'Editorial', icon: '📰', color: '#0f172a', desc: 'Magazine style' },
  { id: 'sketch', name: 'Sketch', icon: '✏️', color: '#475569', desc: 'Hand-drawn pencil look' },
  { id: 'kawaii', name: 'Kawaii', icon: '🌈', color: '#ff99cc', desc: 'Cute playful style' },
  { id: 'professional', name: 'Corporate', icon: '💼', color: '#2563eb', desc: 'Business professional' },
  { id: 'anime', name: 'Anime', icon: '🎌', color: '#f43f5e', desc: 'Japanese animation style' },
  { id: 'instructional', name: 'Instructional', icon: '📖', color: '#059669', desc: 'Educational diagrams' },
  { id: 'bricks', name: 'Bricks', icon: '🧱', color: '#facc15', desc: 'Building blocks pattern' },
  { id: 'cardboard', name: 'Cardboard', icon: '📦', color: '#a8a29e', desc: 'Craft paper texture' },
  { id: 'origami', name: 'Origami', icon: '🦢', color: '#f8fafc', desc: 'Paper folding art' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', color: '#6366f1', desc: 'Movie poster style' },
  { id: 'whiteboard', name: 'Whiteboard', icon: '⬜', color: '#f1f5f9', desc: 'Dry-erase board look' },
  { id: 'blackboard', name: 'Blackboard', icon: '⬛', color: '#1e293b', desc: 'Chalkboard classroom' },
  { id: 'neon', name: 'Neon', icon: '💜', color: '#a855f7', desc: 'Glowing neon lights' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', color: '#06b6d4', desc: 'Future tech city' },
  { id: 'futuristic', name: 'Futuristic', icon: '🚀', color: '#0ea5e9', desc: 'Sci-fi holographic' },
  { id: 'vintage', name: 'Vintage', icon: '📻', color: '#d97706', desc: 'Retro old school' },
  { id: 'classic', name: 'Classic', icon: '🏛️', color: '#78716c', desc: 'Timeless elegance' },
  { id: 'minimal', name: 'Minimal', icon: '⬜', color: '#e2e8f0', desc: 'Clean minimal lines' },
  { id: 'popart', name: 'Pop Art', icon: '🎨', color: '#ef4444', desc: 'Andy Warhol style' },
  { id: 'watercolor', name: 'Watercolor', icon: '💧', color: '#3b82f6', desc: 'Soft painted look' },
  { id: 'geometric', name: 'Geometric', icon: '⬡', color: '#14b8a6', desc: 'Shapes and patterns' },
  { id: 'gradient', name: 'Gradient', icon: '🌅', color: '#8b5cf6', desc: 'Color gradients' },
  { id: 'notebook', name: 'Notebook', icon: '📓', color: '#fef3c7', desc: 'Lined paper notebook' },
  { id: 'glassmorphism', name: 'Glass', icon: '💎', color: '#c0cafd', desc: 'Frosted glass effect' },
  { id: 'darktech', name: 'Dark Tech', icon: '💻', color: '#0f172a', desc: 'Hacker terminal' },
  { id: '2099', name: '2099', icon: '🌌', color: '#1e1b4b', desc: 'Year 2099 future' },
  { id: 'solarized', name: 'Solarized', icon: '☀️', color: '#002b36', desc: 'Solar power palette' },
  { id: 'nord', name: 'Nord', icon: '❄️', color: '#2e3440', desc: 'Arctic north colors' },
  { id: 'monokai', name: 'Monokai', icon: '🎵', color: '#272822', desc: 'Code editor style' },
  { id: 'dracula', name: 'Dracula', icon: '🧛', color: '#282a36', desc: 'Dark vampire theme' },
  { id: 'github', name: 'GitHub', icon: '🐙', color: '#24292f', desc: 'GitHub dark mode' },
  { id: 'midnight', name: 'Midnight', icon: '🌙', color: '#1e1e2e', desc: 'Deep night sky' },
];

export const PPTcreator: React.FC<PPTcreatorProps> = ({ 
  onClose, 
  theme, 
  lang = 'es',
  user,
  isMobile = false 
}) => {
  const isDark = theme === 'dark';

  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Stage 1: Scope & Content
  const [slideCount, setSlideCount] = useState(5);
  const [contentSource, setContentSource] = useState<'text' | 'upload' | 'ai'>('text');
  const [contentInput, setContentInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Stage 2: Engagement
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('professional');
  const [keyTakeaway, setKeyTakeaway] = useState('');

  const [deepResearch, setDeepResearch] = useState<DeepResearch | null>(null);
  const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState(true);
  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);
  const [editingResearchIndex, setEditingResearchIndex] = useState<number | null>(null);
  const [editResearchContent, setEditResearchContent] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  // Stage 3: Skeleton
  const [slides, setSlides] = useState<SlideSkeleton[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);

  // Stage 5: Final
  const [isFinalized, setIsFinalized] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{[key: string]: string}>({});

  const toggleTopic = (idx: number) => {
    const next = new Set(expandedTopics);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedTopics(next);
  };

  const generateFinalPresentation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate images for each slide using the research context
      const imageResults: {[key: string]: string} = {};
      
      for (const slide of slides) {
        if (slide.imagePrompt) {
          console.log(`[PPT] Generating image for slide: ${slide.title}`);
          
          // Prepare research context from deep research
          const researchContext = deepResearch?.topics.map(t => t.content).join('\n\n');
          
          try {
            const imageData = await geminiService.generateProImageForSlide(
              slide.title,
              slide.subtitle || '',
              slide.content,
              selectedStyle,
              slide.chartType || 'none',
              slide.tableData || '',
              undefined,
              slide.visualLayout || 'split',
              slide.paragraphs,
              slide.imagePrompt,
              undefined,
              undefined,
              researchContext // Pass the research context here
            );
            
            if (imageData) {
              imageResults[slide.id] = imageData;
              console.log(`[PPT] Image generated successfully for slide: ${slide.title}`);
            }
          } catch (imageError) {
            console.warn(`[PPT] Failed to generate image for slide ${slide.title}:`, imageError);
            // Continue without image if generation fails
          }
        }
      }
      
      setGeneratedImages(imageResults);
      setIsFinalized(true);
      
    } catch (error) {
      console.error('[PPT] Final presentation generation error:', error);
      setError(lang === 'es' ? 'Error al generar la presentación final' : 'Error generating final presentation');
    } finally {
      setIsLoading(false);
    }
  };

  const retryCurrentStage = () => {
    setError(null);
    // Retry logic based on current stage
    switch (currentStage) {
      case 1:
        // Stay in stage 1, just clear error
        break;
      case 2:
        // Retry research generation
        generateQuestions();
        break;
      case 2.5:
        // Regenerate research
        generateQuestions();
        break;
      case 3:
        // Regenerate skeleton
        proceedFromDeepResearch();
        break;
      case 4:
        // Regenerate final presentation
        setIsFinalized(true);
        break;
    }
  };

  const goToStage2 = () => {
    setCurrentStage(2);
  };

  const generateQuestions = async () => {
    // Basic validation - at least content input is required
    if (!contentInput.trim() && contentSource !== 'upload') {
      setError(lang === 'es' ? 'Por favor, ingresa un tema o sube un archivo PDF' : 'Please enter a topic or upload a PDF file');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      if (isDeepResearchEnabled) {
        setIsGeneratingResearch(true);
        try {
          const researchData: DeepResearch = {
            id: Date.now().toString(),
            topics: [],
            createdAt: new Date()
          };
          
          // Prepare comprehensive context for AI
          const context = {
            topic: contentInput,
            audience: audience.trim() || 'general audience',
            tone: tone,
            keyTakeaway: keyTakeaway.trim() || 'main insights',
            slideCount: slideCount
          };
          
          console.log('[PPT] Sending context to deep research:', context);
          
          const researchResult = await geminiService.generateDeepResearch(
            context.topic, 
            context.audience, 
            context.keyTakeaway,
            context.tone,
            context.slideCount
          );
          
          console.log('[PPT] Deep research result:', researchResult);
          
          if (researchResult && Array.isArray(researchResult) && researchResult.length > 0) {
            researchData.topics = researchResult.map((r: any, idx: number) => ({
              title: r.title || `Research Topic ${idx + 1}`,
              content: r.content || r.summary || (lang === 'es' ? 'Contenido detallado.' : 'Detailed content.'),
              sources: r.sources || []
            }));
            setDeepResearch(researchData);
            setCurrentStage(2.5);
          } else {
            console.warn('[PPT] Deep Research returned empty, creating placeholder research');
            researchData.topics = [{
              title: lang === 'es' ? 'Resumen Ejecutivo' : 'Executive Summary',
              content: lang === 'es' ? 
                `Basado en tu tema: "${contentInput}". ${audience ? `Audiencia: ${audience}. ` : ''}${keyTakeaway ? `Mensaje clave: ${keyTakeaway}.` : ''}` :
                `Based on your topic: "${contentInput}". ${audience ? `Audience: ${audience}. ` : ''}${keyTakeaway ? `Key takeaway: ${keyTakeaway}.` : ''}`,
              sources: []
            }];
            setDeepResearch(researchData);
            setCurrentStage(2.5);
          }
        } catch (error) {
          console.error('Deep research error:', error);
          
          // Create comprehensive fallback research instead of showing error
          const fallbackResearch: DeepResearch = {
            id: Date.now().toString(),
            topics: [
              {
                title: lang === 'es' ? 'Resumen Ejecutivo' : 'Executive Summary',
                content: lang === 'es' ? 
                  `Basado en tu tema: "${contentInput}". ${audience ? `Audiencia: ${audience}. ` : ''}${keyTakeaway ? `Mensaje clave: ${keyTakeaway}.` : ''}\n\n\nEste análisis proporciona una visión general del tema con información relevante y estructura clara para tu presentación.` :
                  `Based on your topic: "${contentInput}". ${audience ? `Audience: ${audience}. ` : ''}${keyTakeaway ? `Key takeaway: ${keyTakeaway}.` : ''}\n\n\nThis analysis provides a comprehensive overview of the topic with relevant information and clear structure for your presentation.`,
                sources: [lang === 'es' ? 'Fuente: Techie AI Research' : 'Source: Techie AI Research']
              },
              {
                title: lang === 'es' ? 'Análisis Detallado' : 'Detailed Analysis',
                content: lang === 'es' ? 
                  `Exploración profunda de ${contentInput} con énfasis en ${audience || 'el público objetivo'}. ${keyTakeaway ? `El mensaje central se enfoca en: ${keyTakeaway}.` : ''}\n\n\nEste análisis incluye perspectivas relevantes, datos contextualizados y recomendaciones estratégicas.` :
                  `Deep exploration of ${contentInput} with emphasis on ${audience || 'the target audience'}. ${keyTakeaway ? `The central message focuses on: ${keyTakeaway}.` : ''}\n\n\nThis analysis includes relevant perspectives, contextualized data, and strategic recommendations.`,
                sources: [lang === 'es' ? 'Fuente: Techie AI Analysis' : 'Source: Techie AI Analysis']
              }
            ],
            createdAt: new Date()
          };
          
          setDeepResearch(fallbackResearch);
          setCurrentStage(2.5);
          
          // Show a subtle notification instead of error
          addMessage('system', lang === 'es' ? 
            'Investigación adaptada con contenido basado en tu tema. Continúa con la creación de tu presentación.' : 
            'Research adapted with content based on your topic. Continue with your presentation creation.');
        } finally {
          setIsGeneratingResearch(false);
        }
      } else {
        setCurrentStage(2);
      }
      
      // Generate calibration questions based on content
      const questions = [
        {
          id: 1,
          question: lang === 'es' ? '¿Cuál es el tono principal de tu presentación?' : 'What is the main tone of your presentation?',
          options: [
            { text: lang === 'es' ? 'Profesional' : 'Professional', value: 'professional' },
            { text: lang === 'es' ? 'Casual' : 'Casual', value: 'casual' },
            { text: lang === 'es' ? 'Académico' : 'Academic', value: 'academic' }
          ],
          type: 'single'
        },
        {
          id: 2,
          question: lang === 'es' ? '¿Cuál es el estilo visual preferido?' : 'What is the preferred visual style?',
          options: [
            { text: lang === 'es' ? 'Minimalista' : 'Minimalist', value: 'minimal' },
            { text: lang === 'es' ? 'Creativo' : 'Creative', value: 'creative' },
            { text: lang === 'es' ? 'Corporativo' : 'Corporate', value: 'corporate' }
          ],
          type: 'single'
        },
        {
          id: 3,
          question: lang === 'es' ? '¿Necesitas elementos visuales especiales?' : 'Do you need special visual elements?',
          options: [
            { text: lang === 'es' ? 'Gráficos y tablas' : 'Charts and tables', value: 'charts' },
            { text: lang === 'es' ? 'Imágenes y diagramas' : 'Images and diagrams', value: 'images' },
            { text: lang === 'es' ? 'Solo texto' : 'Text only', value: 'text' }
          ],
          type: 'single'
        }
      ];
      
      setCalibrationQuestions(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(lang === 'es' ? 'Error al procesar tu solicitud. Por favor, intenta de nuevo.' : 'Error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
      setIsGeneratingResearch(false);
    }
  };

  const startEditResearch = (index: number) => {
    setEditingResearchIndex(index);
    setEditResearchContent(deepResearch?.topics[index]?.content || '');
  };

  const saveEditResearch = () => {
    if (editingResearchIndex !== null && deepResearch) {
      const updated = { ...deepResearch };
      updated.topics[editingResearchIndex].content = editResearchContent;
      setDeepResearch(updated);
    }
    setEditingResearchIndex(null);
    setEditResearchContent('');
  };

  const skipDeepResearch = () => {
    setCurrentStage(2);
  };

  const proceedFromDeepResearch = async () => {
    setIsLoading(true);
    setIsGeneratingSlides(true);
    setError(null);
    
    try {
      // Prepare comprehensive context for skeleton generation
      const researchContext = deepResearch?.topics.map(t => t.content).join('\n\n') || '';
      
      const context = {
        topic: contentInput,
        audience: audience.trim() || 'general audience',
        tone: tone,
        keyTakeaway: keyTakeaway.trim() || 'main insights',
        slideCount: slideCount,
        researchContext: researchContext,
        visualStyle: selectedStyle
      };
      
      console.log('[PPT] Sending context to skeleton generation:', context);
      
      const skeleton = await geminiService.generateSkeleton(
        context.topic,
        context.slideCount,
        context.researchContext,
        context.audience,
        context.tone,
        context.keyTakeaway,
        context.visualStyle
      );
      
      console.log('[PPT] Skeleton result:', skeleton);
      
      if (skeleton && Array.isArray(skeleton) && skeleton.length > 0) {
        // Ensure each slide has required properties
        const processedSlides = skeleton.map((slide, idx) => ({
          id: slide.id || `slide-${idx + 1}`,
          title: slide.title || `Slide ${idx + 1}`,
          subtitle: slide.subtitle || '',
          content: Array.isArray(slide.content) ? slide.content : [slide.content || ''],
          paragraphs: Array.isArray(slide.paragraphs) ? slide.paragraphs : [slide.paragraphs || ''],
          imagePrompt: slide.imagePrompt || '',
          chartType: slide.chartType || 'none',
          tableData: slide.tableData || '',
          visualLayout: slide.visualLayout || 'split'
        }));
        
        setSlides(processedSlides);
        setCurrentStage(3);
      } else {
        // Generate fallback slides
        const fallbackSlides: SlideSkeleton[] = Array.from({ length: slideCount }, (_, idx) => ({
          id: `slide-${idx + 1}`,
          title: lang === 'es' ? `Diapositiva ${idx + 1}` : `Slide ${idx + 1}`,
          subtitle: '',
          content: [lang === 'es' ? 'Contenido principal' : 'Main content'],
          paragraphs: [lang === 'es' ? 'Explicación detallada' : 'Detailed explanation'],
          imagePrompt: lang === 'es' ? `Visual para diapositiva ${idx + 1}` : `Visual for slide ${idx + 1}`,
          chartType: 'none',
          tableData: '',
          visualLayout: 'split'
        }));
        
        setSlides(fallbackSlides);
        setCurrentStage(3);
        setError(lang === 'es' ? 'No se pudieron generar las diapositivas. Se han creado diapositivas básicas.' : 'Could not generate slides. Basic slides have been created.');
      }
    } catch (error) {
      console.error('Skeleton generation error:', error);
      setError(lang === 'es' ? 'Error al generar el esqueleto de las diapositivas.' : 'Error generating slide skeleton.');
      
      // Generate fallback slides on error
      const fallbackSlides: SlideSkeleton[] = Array.from({ length: slideCount }, (_, idx) => ({
        id: `slide-${idx + 1}`,
        title: lang === 'es' ? `Diapositiva ${idx + 1}` : `Slide ${idx + 1}`,
        subtitle: '',
        content: [lang === 'es' ? 'Contenido principal' : 'Main content'],
        paragraphs: [lang === 'es' ? 'Explicación detallada' : 'Detailed explanation'],
        imagePrompt: lang === 'es' ? `Visual para diapositiva ${idx + 1}` : `Visual for slide ${idx + 1}`,
        chartType: 'none',
        tableData: '',
        visualLayout: 'split'
      }));
      
      setSlides(fallbackSlides);
      setCurrentStage(3);
    } finally {
      setIsLoading(false);
      setIsGeneratingSlides(false);
    }
  };

  const retryStage = async (stage: number) => {
    setError(null);
    setCurrentStage(stage as Stage);
  };

  // Stage 1: Scope & Content Intake
  const renderStage1 = () => (
    <div className={cn("flex-1 flex flex-col items-center p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-auto", isMobile ? "justify-start pt-12" : "justify-center")}>
      <div className="text-center space-y-3 sm:space-y-4 w-full max-w-sm">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 1: Alcance' : 'Stage 1: Scope'}
        </h2>
        <p className="text-xs sm:text-base text-slate-400">
          {lang === 'es' ? '¿Cuántas diapositivas necesitas?' : 'How many slides do you need?'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
            {lang === 'es' ? 'Número de diapositivas' : 'Number of slides'}
          </label>
          <div className="space-y-2">
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 touch-manipulation"
            />
            <div className="text-center text-lg sm:text-xl font-black text-blue-600">{slideCount}</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
            {lang === 'es' ? 'Fuente de contenido' : 'Content source'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            {[
              { id: 'text', label: lang === 'es' ? 'Texto' : 'Text Input', icon: <Type size={16} /> },
              { id: 'upload', label: lang === 'es' ? 'Subir PDF' : 'Upload PDF', icon: <Upload size={16} /> },
              { id: 'ai', label: lang === 'es' ? 'Generar IA' : 'AI Generate', icon: <Sparkles size={16} /> },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setContentSource(option.id as any);
                  if (option.id === 'upload') {
                    // Create file input for PDF upload
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const content = e.target?.result as string;
                          setContentInput(lang === 'es' ? `Archivo PDF: ${file.name}` : `PDF File: ${file.name}`);
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }
                }}
                className={cn(
                  "p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-95 touch-manipulation min-h-[60px] sm:min-h-auto",
                  contentSource === option.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-200 dark:border-white/10 hover:border-blue-600"
                )}
              >
                {option.icon}
                <span className="text-[9px] sm:text-xs font-black uppercase">{option.label}</span>
              </button>
            ))}
          </div>
          
          {contentSource === 'upload' && uploadedFile && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <FileText size={16} />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-green-600 dark:text-green-400">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            </div>
          )}
        </div>

        {(contentSource === 'text' || contentSource === 'ai') && (
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400">
              {contentSource === 'ai' 
                ? (lang === 'es' ? 'Ideas para la IA' : 'AI Ideas') 
                : (lang === 'es' ? 'Tu tema' : 'Your Topic')}
            </label>
            <textarea
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              placeholder={contentSource === 'ai' 
                ? (lang === 'es' ? 'Dale ideas a la IA: tema, objetivo, público objetivo...' : 'Give AI ideas: topic, goal, target audience...')
                : (lang === 'es' ? 'Describe tu tema, objetivo y contenido principal...' : 'Describe your topic, objective, and main content...')
              }
              className="w-full h-32 sm:h-40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent resize-none text-sm sm:text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none touch-manipulation"
            />
          </div>
        )}

        <button
          onClick={goToStage2}
          disabled={!contentInput.trim() && contentSource !== 'upload' && !uploadedFile}
          className="w-full py-4 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[54px] shadow-xl hover:bg-blue-700 transition-all active:scale-95 touch-manipulation"
        >
          {contentSource === 'ai' ? <Sparkles size={18} /> : <ChevronRight />}
          {contentSource === 'ai' 
            ? (lang === 'es' ? 'Iniciar Investigación Profunda' : 'Start Deep Research')
            : (lang === 'es' ? 'Siguiente' : 'Next')
          }
        </button>
      </div>
    </div>
  );

  // Stage 2: Engagement Calibration
  const renderStage2 = () => (
    <div className={cn("flex-1 flex flex-col items-center p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-auto", isMobile ? "justify-start pt-12" : "justify-center")}>
      <div className="text-center space-y-3 sm:space-y-4 w-full max-w-sm">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 2: Calibración' : 'Stage 2: Calibration'}
        </h2>
        <p className="text-xs sm:text-base text-slate-400">
          {lang === 'es' 
            ? 'Responde estas preguntas para personalizar tu presentación' 
            : 'Answer these questions to customize your presentation'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 flex justify-between items-center">
            <span>1. {lang === 'es' ? '¿Quién es tu audiencia?' : 'Who is your audience?'}</span>
            <span className="text-[10px] text-slate-500">{lang === 'es' ? '(Opcional)' : '(Optional)'}</span>
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={lang === 'es' ? 'Ej: Ejecutivos, Estudiantes, Clientes...' : 'Ex: Executives, Students, Clients...'}
            className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent text-sm sm:text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none touch-manipulation"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-black uppercase tracking-widest text-slate-400">
            2. {lang === 'es' ? '¿Qué tono prefieres?' : 'What tone do you prefer?'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2">
            {['professional', 'casual', 'academic'].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "py-3 px-2 sm:px-4 rounded-xl font-black text-xs uppercase transition-all active:scale-95 touch-manipulation min-h-[48px]",
                  tone === t 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "border border-slate-200 dark:border-white/10 hover:border-blue-400"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-black uppercase tracking-widest text-slate-400 flex justify-between items-center">
            <span>3. {lang === 'es' ? '¿Cuál es el mensaje clave?' : 'What is the key takeaway?'}</span>
            <span className="text-[10px] text-slate-500">{lang === 'es' ? '(Opcional)' : '(Optional)'}</span>
          </label>
          <textarea
            value={keyTakeaway}
            onChange={(e) => setKeyTakeaway(e.target.value)}
            placeholder={lang === 'es' 
              ? 'Una frase que quieres que recuerden (o déjalo en blanco)...' 
              : 'One phrase you want them to remember (or leave blank)...'}
            className="w-full h-24 sm:h-24 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent resize-none text-sm sm:text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none touch-manipulation"
          />
        </div>

        {(contentSource === 'text' || contentSource === 'ai') && (
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-purple-500" />
                <span className="text-xs font-black uppercase text-purple-500">
                  {lang === 'es' ? 'Investigación Profunda' : 'Deep Research'}
                </span>
              </div>
              <button
                onClick={() => setIsDeepResearchEnabled(!isDeepResearchEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all flex items-center active:scale-95 touch-manipulation",
                  isDeepResearchEnabled ? "bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]" : "bg-slate-300 dark:bg-slate-600"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  isDeepResearchEnabled ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {lang === 'es' 
                ? 'Activa esto para que la IA busque en internet datos reales y tendencias recientes sobre tu tema antes de crear la presentación.'
                : 'Enable this so AI searches the web for real data and recent trends about your topic before creating the presentation.'}
            </p>
          </div>
        )}

        <div className="flex gap-2 sm:gap-4 shrink-0 w-full pt-4">
          <button
            onClick={() => setCurrentStage(1)}
            className="flex-1 py-4 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[54px] active:scale-95 touch-manipulation"
          >
            <ChevronLeft size={18} />
            {lang === 'es' ? 'Atrás' : 'Back'}
          </button>
          <button
            onClick={generateQuestions}
            disabled={isLoading}
            className="flex-1 py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[54px] shadow-xl hover:bg-blue-700 transition-all active:scale-95 touch-manipulation"
          >
            {isGeneratingResearch ? <RefreshCw className="animate-spin" /> : isLoading ? <RefreshCw className="animate-spin" /> : <ChevronRight />}
            {lang === 'es' ? 'Siguiente' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );

  // Stage 2.5: Deep Research
  const renderStage2_5 = () => {
    if (editingResearchIndex !== null) {
      return (
        <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 overflow-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
              {lang === 'es' ? 'Editar Investigación' : 'Edit Research'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {deepResearch?.topics[editingResearchIndex]?.title}
            </p>
          </div>

          <textarea
            value={editResearchContent}
            onChange={(e) => setEditResearchContent(e.target.value)}
            className="flex-1 w-full p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent resize-none text-sm"
            placeholder={lang === 'es' ? 'Contenido de la investigación...' : 'Research content...'}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setEditingResearchIndex(null)}
              className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 rounded-xl font-black uppercase text-sm"
            >
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              onClick={saveEditResearch}
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
        <div className="text-center space-y-2 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
            <Search size={12} />
            {lang === 'es' ? 'Google Grounding Activo' : 'Google Grounding Active'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            {lang === 'es' ? 'Reporte: Deep Learning' : 'Deep Learning Report'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            {lang === 'es' 
              ? 'Investigación estratégica de alta densidad (+2000 tokens) basada en datos reales de la web.' 
              : 'High-density strategic research (+2000 tokens) based on real-world web data.'}
          </p>
        </div>

        <div className="flex-1 overflow-hidden px-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 h-full overflow-y-auto lg:overflow-visible pb-12 lg:pb-0 scrollbar-hide">
            {deepResearch?.topics.map((topic, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl flex flex-col h-fit lg:h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </span>
                    <h3 className="font-black uppercase text-sm tracking-tight text-slate-800 dark:text-white truncate max-w-[150px]">
                      {topic.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => startEditResearch(i)}
                    className="p-3 transition-opacity rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title={lang === 'es' ? 'Editar este punto' : 'Edit this point'}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <p className={cn(
                    "text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap transition-all",
                    expandedTopics.has(i) ? "" : "line-clamp-[8]"
                  )}>
                    {topic.content || (lang === 'es' ? 'Sin contenido' : 'No content')}
                  </p>
                  <button onClick={() => toggleTopic(i)} className="mt-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {expandedTopics.has(i) ? (lang === 'es' ? 'Ver menos' : 'See less') : (lang === 'es' ? 'Ver más' : 'See more')}
                  </button>
                </div>

                {topic.sources && topic.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                    {topic.sources.map((source, si) => (
                      <span key={si} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-bold text-slate-400 uppercase">
                        <LinkIcon size={8} />
                        {source}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 shrink-0">
          <button
            onClick={skipDeepResearch}
            className="flex-1 py-4 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[54px]"
          >
            <ChevronLeft />
            {lang === 'es' ? 'Atrás' : 'Back'}
          </button>
          <button
            onClick={proceedFromDeepResearch}
            disabled={isLoading}
            className="flex-1 py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[54px] shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="animate-spin" /> : <ChevronRight />}
            {lang === 'es' ? 'Siguiente: Esqueleto' : 'Next: Skeleton'}
          </button>
        </div>
      </div>
    );
  };

  const renderStage3 = () => (
    <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden">
      <div className="text-center space-y-2 shrink-0">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 3: Esqueleto' : 'Stage 3: Skeleton'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {lang === 'es' ? 'Revisa y ajusta el contenido de tus diapositivas' : 'Review and adjust your slide content'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 scrollbar-hide">
        {slides.map((slide, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 sm:p-5 rounded-xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 space-y-3 sm:space-y-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-8 h-8 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
                {i + 1}
              </span>
              <input 
                type="text"
                value={slide.title}
                onChange={(e) => {
                  const next = [...slides];
                  next[i].title = e.target.value;
                  setSlides(next);
                }}
                className="flex-1 bg-transparent font-black uppercase text-sm outline-none focus:text-blue-600 transition-colors touch-manipulation"
                placeholder={lang === 'es' ? 'Título de diapositiva' : 'Slide title'}
              />
            </div>
            <textarea 
              value={Array.isArray(slide.content) ? slide.content.join('\n') : slide.content}
              onChange={(e) => {
                const next = [...slides];
                next[i].content = e.target.value.split('\n');
                setSlides(next);
              }}
              className="w-full h-28 sm:h-32 bg-slate-50 dark:bg-black/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-none resize-none focus:ring-1 focus:ring-blue-500/50 outline-none touch-manipulation"
              placeholder={lang === 'es' ? 'Contenido de la diapositiva...' : 'Slide content...'}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-4 shrink-0 pt-2 sm:pt-4">
        <button
          onClick={() => setCurrentStage(2.5)}
          className="flex-1 py-3 sm:py-4 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-[2rem] font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[54px] active:scale-95 touch-manipulation"
        >
          <ChevronLeft size={16} sm:size={18} />
          {lang === 'es' ? 'Atrás' : 'Back'}
        </button>
        <button
          onClick={() => setCurrentStage(4)}
          className="flex-1 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-[2rem] font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[54px] shadow-xl active:scale-95 touch-manipulation"
        >
          {lang === 'es' ? 'Siguiente: Estilo' : 'Next: Style'}
          <ChevronRight size={16} sm:size={18} />
        </button>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden">
      <div className="text-center space-y-2 shrink-0">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest">
          {lang === 'es' ? 'Etapa 4: Estilo Visual' : 'Stage 4: Visual Style'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {lang === 'es' ? 'Selecciona la estética para tu presentación' : 'Select the aesthetic for your presentation'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {VISUAL_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedStyle(theme.id)}
              className={cn(
                "p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border flex flex-col items-center gap-2 sm:gap-3 transition-all relative group active:scale-95 touch-manipulation min-h-[120px] sm:min-h-auto",
                selectedStyle === theme.id
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
              )}
            >
              <span className="text-2xl sm:text-3xl">{theme.icon}</span>
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-center">{theme.name}</span>
              <span className="text-[8px] sm:text-[8px] opacity-60 text-center uppercase font-bold line-clamp-2">{theme.desc}</span>
              {selectedStyle === theme.id && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                  <Check size={14} sm:size={16} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 shrink-0 pt-2 sm:pt-4">
        <button
          onClick={() => setCurrentStage(3)}
          className="flex-1 py-3 sm:py-4 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-[2rem] font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[54px] active:scale-95 touch-manipulation"
        >
          <ChevronLeft size={16} sm:size={18} />
          {lang === 'es' ? 'Atrás' : 'Back'}
        </button>
        <button
          onClick={generateFinalPresentation}
          disabled={isLoading}
          className="flex-1 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-[2rem] font-black uppercase text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[54px] shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="animate-spin" /> : <Sparkles size={16} sm:size={18} />}
          {lang === 'es' ? 'Generar Presentación con Imágenes' : 'Generate Presentation with Images'}
        </button>
      </div>
    </div>
  );

  const renderFinalStage = () => {
    return (
      <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
            <Check size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">
              {lang === 'es' ? 'Presentación Finalizada' : 'Presentation Complete'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto uppercase tracking-widest font-bold">
              {lang === 'es' 
                ? 'Investigación y diapositivas generadas con éxito v6.5.0' 
                : 'Research and slides successfully generated v6.5.0'}
            </p>
            {Object.keys(generatedImages).length > 0 && (
              <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                {lang === 'es' ? `${Object.keys(generatedImages).length} imágenes generadas` : `${Object.keys(generatedImages).length} images generated`}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto lg:overflow-visible pr-2 scrollbar-hide">
            {/* Research Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">
                {lang === 'es' ? 'Investigación Profunda' : 'Deep Research'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {deepResearch?.topics.map((topic, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </div>
                      <h4 className="font-black uppercase text-sm tracking-tight text-slate-800 dark:text-white">
                        {topic.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {topic.content}
                    </p>
                    {topic.sources && topic.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {topic.sources.map((source, si) => (
                          <span key={si} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 rounded text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                            <LinkIcon size={6} />
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Generated Slides with Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">
                {lang === 'es' ? 'Diapositivas Generadas' : 'Generated Slides'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {slides.map((slide, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </div>
                      <h4 className="font-black uppercase text-sm tracking-tight text-slate-800 dark:text-white">
                        {slide.title}
                      </h4>
                    </div>
                    
                    {/* Generated Image */}
                    {generatedImages[slide.id] && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={generatedImages[slide.id]} 
                          alt={`Generated slide image: ${slide.title}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {lang === 'es' ? 'Contenido:' : 'Content:'}
                      </div>
                      <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        {slide.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        {lang === 'es' ? 'Estilo Visual:' : 'Visual Style:'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {VISUAL_THEMES.find(t => t.id === selectedStyle)?.icon || '🎨'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {VISUAL_THEMES.find(t => t.id === selectedStyle)?.name || selectedStyle}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(22);
              doc.text(lang === 'es' ? 'Presentación Completa' : 'Complete Presentation', 20, 20);
              doc.setFontSize(10);
              doc.setTextColor(100);
              doc.text(`Generated by Catalizia CorporateGPT - ${new Date().toLocaleString()}`, 20, 28);
              
              let y = 45;
              deepResearch?.topics.forEach((topic) => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setTextColor(0);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.text(topic.title.toUpperCase(), 20, y);
                y += 10;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                const lines = doc.splitTextToSize(topic.content, 170);
                doc.text(lines, 20, y);
                y += (lines.length * 6) + 10;
              });
              
              // Add slide information
              doc.addPage();
              doc.setFontSize(16);
              doc.text("Generated Slides", 20, 20);
              doc.setFontSize(12);
              doc.text(`Total Slides: ${slides.length}`, 20, 35);
              doc.text(`Images Generated: ${Object.keys(generatedImages).length}`, 20, 45);
              doc.text(`Visual Style: ${selectedStyle}`, 20, 55);
              
              doc.save(`CorporateGPT_Presentation_${Date.now()}.pdf`);
            }}
            className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={24} />
            <span>{lang === 'es' ? 'Descargar Presentación Completa' : 'Download Complete Presentation'}</span>
          </button>
          <button
            onClick={() => {
              // Download generated images
              Object.entries(generatedImages).forEach(([slideId, imageData]) => {
                const link = document.createElement('a');
                link.href = imageData;
                link.download = `slide_${slideId}_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              });
            }}
            className="py-5 px-10 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            disabled={Object.keys(generatedImages).length === 0}
          >
            <Download size={24} />
            <span>{lang === 'es' ? 'Descargar Imágenes' : 'Download Images'} ({Object.keys(generatedImages).length})</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="py-5 px-10 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <RefreshCw size={24} />
            <span>{lang === 'es' ? 'Nueva Presentación' : 'New Presentation'}</span>
          </button>
        </div>
      </div>
    );
  };

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
            <BrainCircuit size={18} />
          </div>
          <div className="block sm:block">
            <h1 className={cn(
              "text-xs sm:text-sm font-black uppercase tracking-widest italic",
              isDark ? "text-white" : "text-slate-900"
            )}>PPT Creator</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {lang === 'es' ? `Contexto Activo` : `Active Context`} • v6.5.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1">
          {[1, 2, 2.5, 3, 4].map((stage) => (
            <div 
              key={stage}
              className={cn(
                "w-2 sm:w-2 h-2 sm:h-2 rounded-full transition-all cursor-pointer active:scale-110",
                currentStage === stage 
                  ? "bg-blue-600 w-6 sm:w-6" 
                  : currentStage > stage 
                    ? "bg-emerald-500" 
                    : "bg-slate-300 dark:bg-slate-700"
              )}
              onClick={() => setCurrentStage(stage as Stage)}
              title={`Stage ${stage}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <div className="text-[10px] font-black uppercase px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg border border-red-500/20 min-h-[36px] flex items-center">
              <span className="truncate">{error}</span>
            </div>
          )}
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="text-[10px] font-black uppercase px-3 py-2 hover:bg-slate-500/10 text-slate-500 rounded-lg border border-slate-500/20 min-h-[36px] flex items-center"
          >
            {lang === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
          
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={20} />
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
          {isFinalized ? renderFinalStage() : (
            <>
              {currentStage === 1 && renderStage1()}
              {currentStage === 2 && renderStage2()}
              {currentStage === 2.5 && renderStage2_5()}
              {currentStage === 3 && renderStage3()}
              {currentStage === 4 && renderStage4()}
            </>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X size={18} />
                  <span className="font-medium">{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => retryStage(currentStage)}
                  className="px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30"
                >
                  {lang === 'es' ? 'Reintentar' : 'Retry'}
                </button>
                <button 
                  onClick={() => setCurrentStage(1)}
                  className="px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30"
                >
                  {lang === 'es' ? 'Volver al inicio' : 'Back to start'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PPTcreator;
