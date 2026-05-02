import React, { useState } from 'react';
import { Check, ChevronDown, Search, Zap, Cpu, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelMetadata } from '../types';

import { translations } from '../lib/translations';

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (id: string) => void;
  models: ModelMetadata[];
  isLoading: boolean;
  lang: 'en' | 'es';
  dataProtected: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelect,
  models,
  isLoading,
  lang,
  dataProtected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const t = translations[lang || 'es'];

  const currentModel = models.find(m => m.id === selectedModel) || {
    id: 'openrouter/auto',
    name: t.autoRouter,
    description: t.optimizedSwitching,
    pricing: { prompt: '0', completion: '0' },
    context_length: 0
  };

const FILTERED_MODELS = [
  'google/gemini-1.5-flash',
  'google/gemini-1.5-flash-8b', 
  'google/gemini-2.0-flash',
  'google/gemini-2.0-flash-lite',
  'google/gemini-2.5-flash',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
];

const isDataProtected = (id: string) => {
  const lowerId = id.toLowerCase();
  return FILTERED_MODELS.some(m => lowerId.includes(m.toLowerCase())) ||
         lowerId.includes('gemini') ||
         lowerId.includes('claude') ||
         lowerId.includes('gpt-4o');
};

const isModelZdr = (id: string) => {
  const lowerId = id.toLowerCase();
  return lowerId.includes('gpt-4o') || 
         lowerId.includes('gpt-4-turbo') ||
         lowerId.includes('o1-') ||
         lowerId.includes('claude-3') || 
         lowerId.includes('gemini-1.5') ||
         lowerId.includes('nvidia/') ||
         lowerId.includes('meta-llama/llama-3.1') ||
         lowerId === 'openrouter/auto';
};

const filteredModels = models
  .filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                         m.id.toLowerCase().includes(search.toLowerCase());
    const matchesProtection = dataProtected ? isDataProtected(m.id) : true;
    return matchesSearch && matchesProtection;
  })
  .slice(0, 100);

  const getModelTags = (model: ModelMetadata) => {
    const tags = [];
    const id = model.id.toLowerCase();
    
    if (model.pricing.prompt === '0') tags.push({ label: 'Free', color: 'bg-green-100 text-green-700' });
    if (id.includes('think') || id.includes('reason')) tags.push({ label: 'Deep Think', color: 'bg-purple-100 text-purple-700' });
    if (id.includes('flash') || id.includes('turbo') || id.includes('mini')) tags.push({ label: 'Fast', color: 'bg-blue-100 text-blue-700' });
    if (model.context_length > 128000) tags.push({ label: 'Elite', color: 'bg-amber-100 text-amber-700' });
    if (isDataProtected(model.id)) tags.push({ label: 'NDA Proof', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' });
    
    return tags.slice(0, 2);
  };

  const displayModels = search === '' 
    ? [{ id: 'openrouter/auto', name: t.autoRouter, description: t.optimizedSwitching, pricing: { prompt: '0', completion: '0' }, context_length: 128000 } as any, ...models.filter(m => m.id !== 'openrouter/auto')]
        .filter(m => dataProtected ? isDataProtected(m.id) : true)
        .slice(0, 101)
    : filteredModels;

  return (
    <div className="relative w-full" id="model-selector-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
        id="model-selector-trigger"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-lg">
            {selectedModel === 'openrouter/auto' ? <Zap size={14} /> : <Cpu size={14} />}
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">{t.selectedIntelligence}</div>
            <div className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{currentModel.name}</div>
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              id="selector-overlay"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 w-full left-0 mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl"
              id="model-list-dropdown"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <div className="relative group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={t.searchModels}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  />
                </div>
              </div>
 
              <div className="max-h-[600px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {isLoading ? (
                  <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Syncing Models...
                  </div>
                ) : (
                  displayModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelect(model.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex flex-col p-4 rounded-2xl transition-all text-left relative group ${
                        selectedModel === model.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold tracking-tight">
                          {model.name}
                        </span>
                        {selectedModel === model.id && <Check size={16} className="text-white" />}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className={`text-[9px] font-mono font-bold uppercase ${selectedModel === model.id ? 'text-white/60' : 'text-slate-400'}`}>
                          {model.id === 'openrouter/auto' ? t.appName : (model.id.split('/')[0] === 'openrouter' ? 'OpenRouter' : model.id.split('/')[0])}
                        </span>
                        
                        <div className="flex gap-1">
                          {model.id === 'openrouter/auto' ? (
                            <span className="text-[9px] bg-blue-500/20 text-blue-100 px-1.5 py-0.5 rounded font-bold uppercase">{t.optimal}</span>
                          ) : (
                            getModelTags(model).map(tag => (
                              <span key={tag.label} className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                selectedModel === model.id ? 'bg-white/20 text-white' : tag.color
                              }`}>
                                {tag.label}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
 
                      <div className={`flex items-center gap-3 mt-3 text-[10px] ${selectedModel === model.id ? 'text-white/60' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1 font-bold italic opacity-70">
                          <Coins size={10} />
                          {model.pricing.prompt === '0' ? 'FREE' : `$${(parseFloat(model.pricing.prompt) * 1000000).toFixed(1)}/1M`}
                        </span>
                        {model.context_length > 0 && (
                          <span className="font-bold opacity-70">{Math.round(model.context_length / 1000)}k {t.context.toUpperCase()}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
