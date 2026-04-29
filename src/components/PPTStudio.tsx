import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Presentation, 
  FileDown, 
  FileText, 
  Sparkles, 
  Layout, 
  Palette, 
  Type, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Cpu,
  ShieldCheck,
  Languages,
  Wand2,
  Check,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../lib/translations';
import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  imageUrl?: string;
  type: 'title' | 'content' | 'comparison' | 'process';
}

export const PPTStudio: React.FC<{ 
  theme: 'light' | 'dark', 
  lang: 'en' | 'es', 
  user: any,
  onClose: () => void 
}> = ({ theme, lang, user, onClose }) => {
  const [showConfig, setShowConfig] = useState(true);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  
  // Configuration States (matching user screenshot)
  const [deckFormat, setDeckFormat] = useState<'detailed' | 'presenter'>('detailed');
  const [deckLanguage, setDeckLanguage] = useState(lang === 'es' ? 'español' : 'english');
  const [deckLength, setDeckLength] = useState<'short' | 'default'>('default');

  const t = translations[lang];

  const generateSlides = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setShowConfig(false);
    
    try {
      // Logic for high-end generation
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const mockSlides: Slide[] = [
        {
          id: '1',
          type: 'title',
          title: topic.length > 30 ? topic.substring(0, 30) + '...' : topic,
          subtitle: lang === 'en' ? 'Enterprise Intelligence & Strategic Scaling' : 'Inteligencia Empresarial y Escalamiento Estratégico',
          content: [],
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: '2',
          type: 'content',
          title: lang === 'en' ? 'Strategic Pillars' : 'Pilares Estratégicos',
          content: [
            lang === 'en' ? 'Data Sovereignty & ZDR Protocol' : 'Soberanía de Datos y Protocolo ZDR',
            lang === 'en' ? 'Neural Network Optimization' : 'Optimización de Redes Neuronales',
            lang === 'en' ? 'Cost-Efficient Pipeline Scaling' : 'Escalamiento de Pipeline con Eficiencia de Costos'
          ]
        },
        {
          id: '3',
          type: 'process',
          title: lang === 'en' ? 'The Intelligence Loop' : 'El Ciclo de Inteligencia',
          content: [
            lang === 'en' ? 'Ingestion -> Analysis -> Synthesis -> Deployment' : 'Ingesta -> Análisis -> Síntesis -> Despliegue'
          ]
        }
      ];
      
      setSlides(mockSlides);
      setSelectedSlide(0);
    } catch (error) {
      console.error('Failed to generate slides:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPPT = () => {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    slides.forEach(slide => {
      const pptSlide = pptx.addSlide();
      
      // Branding Footer
      pptSlide.addText('CorporateGPT • Confidential', { 
        x: 0.5, y: 5.2, w: '90%', h: 0.3, 
        fontSize: 10, color: 'A0A0A0', fontFace: 'Arial' 
      });

      if (slide.type === 'title') {
        pptSlide.addText(slide.title.toUpperCase(), { 
          x: 0.5, y: 2.0, w: '90%', h: 1.5, 
          fontSize: 48, bold: true, color: '1A1A1A', fontFace: 'Georgia' 
        });
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, { 
            x: 0.5, y: 3.5, w: '90%', h: 0.5, 
            fontSize: 22, color: '666666', fontFace: 'Arial' 
          });
        }
      } else {
        pptSlide.addText(slide.title, { 
          x: 0.5, y: 0.5, w: '90%', h: 0.8, 
          fontSize: 34, bold: true, color: '2563eb', fontFace: 'Georgia' 
        });
        
        slide.content.forEach((text, idx) => {
          pptSlide.addText(text, { 
            x: 0.8, y: 1.6 + (idx * 0.7), w: '80%', h: 0.5, 
            fontSize: 20, bullet: true, color: '333333', fontFace: 'Arial' 
          });
        });
      }
    });

    pptx.writeFile({ fileName: `Corporate_Presentation_${Date.now()}.pptx` });
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [10, 5.625] });
    slides.forEach((slide, index) => {
      if (index > 0) doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(40);
      doc.text(slide.title, 0.5, 1.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      slide.content.forEach((text, i) => {
        doc.text(`• ${text}`, 0.7, 2.5 + (i * 0.5));
      });
    });
    doc.save(`Corporate_Deck_${Date.now()}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-corporate-950 overflow-hidden relative">
      {/* "Customize Slide Deck" Modal (User Screenshot Implementation) */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#1e2128] rounded-2xl shadow-2xl border border-white/5 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Presentation size={20} className="text-white/60" />
                  <h3 className="text-white font-medium text-lg">Customize Slide Deck</h3>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                {/* Format Selection */}
                <div className="space-y-4">
                  <label className="text-white/60 text-sm font-medium">Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDeckFormat('detailed')}
                      className={cn(
                        "p-6 rounded-xl border transition-all text-left relative",
                        deckFormat === 'detailed' 
                          ? "bg-white/5 border-white/20 ring-1 ring-white/20" 
                          : "bg-transparent border-white/5 hover:border-white/10"
                      )}
                    >
                      <h4 className="text-white font-bold mb-2">Detailed Deck</h4>
                      <p className="text-white/40 text-xs leading-relaxed">
                        A comprehensive deck with full text and details, perfect for emailing or reading on its own.
                      </p>
                      {deckFormat === 'detailed' && (
                        <div className="absolute top-4 right-4 text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </button>

                    <button 
                      onClick={() => setDeckFormat('presenter')}
                      className={cn(
                        "p-6 rounded-xl border transition-all text-left relative",
                        deckFormat === 'presenter' 
                          ? "bg-white/5 border-white/20 ring-1 ring-white/20" 
                          : "bg-transparent border-white/5 hover:border-white/10"
                      )}
                    >
                      <h4 className="text-white font-bold mb-2">Presenter Slides</h4>
                      <p className="text-white/40 text-xs leading-relaxed">
                        Clean, visual slides with key talking points to support you while you speak.
                      </p>
                      {deckFormat === 'presenter' && (
                        <div className="absolute top-4 right-4 text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   {/* Language */}
                   <div className="space-y-4">
                      <label className="text-white/60 text-sm font-medium">Choose language</label>
                      <div className="relative group">
                         <button className="w-full bg-[#2d3139] border border-white/10 p-4 rounded-xl text-white text-left flex items-center justify-between hover:bg-[#343842] transition-colors">
                            <span>{deckLanguage}</span>
                            <ChevronDown size={16} className="text-white/40" />
                         </button>
                         {/* Dropdown would go here */}
                      </div>
                   </div>

                   {/* Length */}
                   <div className="space-y-4">
                      <label className="text-white/60 text-sm font-medium">Length</label>
                      <div className="flex bg-[#2d3139] p-1 rounded-full border border-white/10 w-fit">
                         <button 
                           onClick={() => setDeckLength('short')}
                           className={cn("px-6 py-2 rounded-full text-xs font-bold transition-all", 
                             deckLength === 'short' ? "bg-white/10 text-white" : "text-white/40"
                           )}
                         >
                           Short
                         </button>
                         <button 
                           onClick={() => setDeckLength('default')}
                           className={cn("px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2", 
                             deckLength === 'default' ? "bg-white/10 text-white" : "text-white/40"
                           )}
                         >
                           {deckLength === 'default' && <Check size={14} />}
                           Default
                         </button>
                      </div>
                   </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                   <label className="text-white/60 text-sm font-medium">Describe the slide deck you want to create</label>
                   <textarea 
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder="Add a high-level outline, or guide the audience, style, and focus: 'Create a deck for beginners using a bold and playful style with a focus on step-by-step instructions.'"
                     className="w-full h-32 bg-transparent border border-white/10 p-5 rounded-xl text-white text-sm outline-none focus:border-white/20 transition-all resize-none placeholder:text-white/20"
                   />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-black/20 flex justify-end">
                 <button 
                   disabled={!topic || isGenerating}
                   onClick={generateSlides}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20"
                 >
                   {isGenerating ? 'Generating...' : 'Generate'}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio View (Behind Modal or After Generation) */}
      <header className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-10 shrink-0 z-20 bg-white/80 dark:bg-corporate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 cursor-pointer" onClick={() => setShowConfig(true)}>
            <Presentation size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black tracking-tight uppercase leading-none">{t.pptStudio}</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-60">Professional Output Deck</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            disabled={slides.length === 0}
            onClick={exportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <FileText size={16} /> PDF
          </button>
          <button 
            disabled={slides.length === 0}
            onClick={downloadPPT}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30"
          >
            <Download size={16} /> PPTX
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col bg-slate-50 dark:bg-corporate-950 p-12 relative overflow-hidden">
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-white/80 dark:bg-corporate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-8">
             <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
             <div className="text-center">
                <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Neural Synthesis in Progress</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 animate-pulse">Building high-fidelity presentation objects...</p>
             </div>
          </div>
        )}

        {slides.length > 0 ? (
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
            <motion.div 
              key={selectedSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 bg-white dark:bg-corporate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative flex flex-col"
            >
              {/* Slide Content Rendering */}
              <div className="flex-1 p-20 flex flex-col justify-center relative">
                {slides[selectedSlide].type === 'title' ? (
                  <div className="space-y-10">
                     <h1 className="text-7xl font-display font-black tracking-tighter leading-none dark:text-white uppercase">
                       {slides[selectedSlide].title}
                     </h1>
                     <p className="text-2xl font-medium text-slate-400 dark:text-white/40 uppercase tracking-widest max-w-2xl">
                       {slides[selectedSlide].subtitle}
                     </p>
                  </div>
                ) : (
                  <div className="space-y-12">
                     <h2 className="text-4xl font-display font-black tracking-tight uppercase dark:text-white border-l-8 border-blue-600 pl-8">
                       {slides[selectedSlide].title}
                     </h2>
                     <div className="space-y-6">
                        {slides[selectedSlide].content.map((p, i) => (
                          <div key={i} className="flex items-start gap-6">
                             <div className="w-3 h-3 bg-blue-600 rounded-full mt-2.5 shrink-0" />
                             <p className="text-xl font-bold text-slate-600 dark:text-white/70 uppercase tracking-wider">{p}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
              
              {/* Slide Footer */}
              <div className="h-16 bg-slate-50 dark:bg-black/20 px-12 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>CorporateGPT Intelligence Core • Build 2.9.4</span>
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-md">Slide {selectedSlide + 1} / {slides.length}</span>
              </div>
            </motion.div>

            {/* Pagination */}
            <div className="mt-10 flex justify-center items-center gap-8">
               <button 
                 disabled={selectedSlide === 0}
                 onClick={() => setSelectedSlide(s => s - 1)}
                 className="p-4 bg-white dark:bg-white/5 rounded-2xl text-slate-400 hover:text-blue-600 transition-all disabled:opacity-20"
               >
                 <ChevronLeft size={32} />
               </button>
               <button 
                 disabled={selectedSlide === slides.length - 1}
                 onClick={() => setSelectedSlide(s => s + 1)}
                 className="p-4 bg-white dark:bg-white/5 rounded-2xl text-slate-400 hover:text-blue-600 transition-all disabled:opacity-20"
               >
                 <ChevronRight size={32} />
               </button>
            </div>
          </div>
        ) : (
          !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
               <div className="w-40 h-40 bg-slate-100 dark:bg-white/5 rounded-[3rem] flex items-center justify-center text-slate-300 dark:text-white/10 border-4 border-dashed border-slate-200 dark:border-white/10">
                  <Presentation size={80} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tight dark:text-white">Workspace Empty</h3>
                  <button 
                    onClick={() => setShowConfig(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-blue-500/30"
                  >
                    Start New Presentation
                  </button>
               </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};
