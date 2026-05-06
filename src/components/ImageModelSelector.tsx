import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Zap, Sparkles, Loader2 } from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';

interface ImageModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  speed: 'fast' | 'balanced' | 'quality';
}

const IMAGE_MODELS: ImageModel[] = [
  { 
    id: 'imagen-4.0-fast-generate-001', 
    name: 'Imagen 4 Fast', 
    description: 'Quick generation for rapid prototyping',
    icon: '⚡',
    speed: 'fast'
  },
  { 
    id: 'imagen-4.0-generate-001', 
    name: 'Imagen 4 Quality', 
    description: 'Highest quality image generation',
    icon: '🎨',
    speed: 'quality'
  },
  { 
    id: 'gemini-2.0-flash', 
    name: 'Gemini 2.0 Flash', 
    description: 'Multimodal generation with text & images',
    icon: '🔮',
    speed: 'balanced'
  },
];

interface ImageModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelId: string, prompt: string) => void;
  pendingPrompt: string;
  theme: 'light' | 'dark';
  lang: 'en' | 'es';
  isGenerating?: boolean;
}

export const ImageModelSelector: React.FC<ImageModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelectModel,
  pendingPrompt,
  theme,
  lang,
  isGenerating = false
}) => {
  const t = translations[lang || 'es'];

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'quality': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getSpeedLabel = (speed: string) => {
    switch (speed) {
      case 'fast': return lang === 'es' ? 'Rápido' : 'Fast';
      case 'quality': return lang === 'es' ? 'Calidad' : 'Quality';
      default: return lang === 'es' ? 'Equilibrado' : 'Balanced';
    }
  };

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId, pendingPrompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            theme === 'dark' ? "bg-corporate-950/90 backdrop-blur-xl" : "bg-white/90 backdrop-blur-xl"
          )}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={cn(
              "w-full max-w-2xl rounded-[2rem] border shadow-2xl overflow-hidden",
              theme === 'dark' 
                ? "bg-corporate-900 border-white/10" 
                : "bg-white border-slate-200 shadow-slate-200/50"
            )}
          >
            {/* Header */}
            <div className={cn(
              "px-8 py-6 border-b flex items-center justify-between",
              theme === 'dark' ? "border-white/10" : "border-slate-200"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Image size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wide">
                    {lang === 'es' ? 'Seleccionar Modelo de Imagen' : 'Select Image Model'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {lang === 'es' ? 'Elige el motor de síntesis' : 'Choose your synthesis engine'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  theme === 'dark' 
                    ? "hover:bg-white/5 text-slate-400 hover:text-white" 
                    : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                )}
                disabled={isGenerating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Pending Prompt Preview */}
            {pendingPrompt && (
              <div className={cn(
                "px-8 py-4 border-b",
                theme === 'dark' ? "border-white/5 bg-purple-500/5" : "bg-purple-50 border-purple-100"
              )}>
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">
                  {lang === 'es' ? 'Tu solicitud' : 'Your request'}
                </p>
                <p className={cn(
                  "text-sm font-medium line-clamp-2",
                  theme === 'dark' ? "text-slate-200" : "text-slate-700"
                )}>
                  "{pendingPrompt}"
                </p>
              </div>
            )}

            {/* Model Options */}
            <div className="p-8 space-y-4">
              {IMAGE_MODELS.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(model.id)}
                  disabled={isGenerating}
                  className={cn(
                    "w-full p-6 rounded-[1.5rem] border-2 transition-all text-left flex items-center gap-6",
                    theme === 'dark'
                      ? "border-white/5 hover:border-purple-500/50 bg-white/5 hover:bg-purple-500/10"
                      : "border-slate-100 hover:border-purple-300 bg-slate-50 hover:bg-purple-50",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="text-3xl">{model.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={cn(
                        "text-base font-black uppercase tracking-wide",
                        theme === 'dark' ? "text-white" : "text-slate-900"
                      )}>
                        {model.name}
                      </h3>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        getSpeedColor(model.speed)
                      )}>
                        {getSpeedLabel(model.speed)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm font-medium",
                      theme === 'dark' ? "text-slate-400" : "text-slate-500"
                    )}>
                      {model.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === 'dark' ? "bg-white/10" : "bg-slate-200"
                  )}>
                    {isGenerating ? (
                      <Loader2 size={20} className="animate-spin text-purple-500" />
                    ) : (
                      <Sparkles size={20} className="text-purple-500" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className={cn(
              "px-8 py-4 border-t flex items-center justify-between",
              theme === 'dark' ? "border-white/5" : "border-slate-200"
            )}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                💡 {lang === 'es' ? 'Todos los modelos incluyen tecnología de privacidad' : 'All models include privacy technology'}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  {lang === 'es' ? 'Sistema Activo' : 'System Active'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};