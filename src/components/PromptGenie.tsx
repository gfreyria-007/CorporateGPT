import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Wand2, ArrowRight, Lightbulb, Zap, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { AuthContext } from '../Techie/src/core/AuthContext';

interface PromptGenieProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (improvedPrompt: string) => void;
  theme: 'light' | 'dark';
  initialPrompt?: string;
  mode?: 'text' | 'image';
}

export function PromptGenie({ isOpen, onClose, onApply, theme, initialPrompt = '', mode = 'text' }: PromptGenieProps) {
  const { user } = useContext(AuthContext) || {};
  const [input, setInput] = useState(initialPrompt);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) setInput(initialPrompt);
  }, [isOpen, initialPrompt]);

  const improvePrompt = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    
    try {
      const isImage = mode === 'image';
      const prompt = isImage 
        ? `You are a visionary Art Director with SEARCH POWERS. Seed: "${input}".
           1. Use your search tool to verify canonical details (e.g. Spiderman Noir wears a trench coat/fedora).
           2. Generate 3 distinct, breathtaking prompts based RIGOROUSLY on these facts.
           3. Include master-level details: cinematic lighting (chiaroscuro, volumetric), camera (35mm, low-angle), and textures.
           Format: Return exactly 3 options separated by "---". No numbering or chat.`
        : `You are a Prompt Engineering Expert with REAL-TIME WEB ACCESS. The user provided this simple prompt: "${input}". 
           Use your search tool to ground your response in the latest available data to prevent hallucinations.
           Generate 3 distinct, high-quality, professional versions of this prompt that are more descriptive, contextual, and structured. 
           Format: Only return the 3 options separated by "---". No preamble.`;

      const payload = {
        model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        config: { responseMimeType: "text/plain" }
      };

      const token = user ? await user.getIdToken() : null;
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ action: 'generateContent', payload })
      });
      const result = await res.json();
      
      const text = result.text || '';
      const options = text.split('---').map((s: string) => s.trim()).filter(Boolean);
      
      if (options.length > 0) {
        setSuggestions(options);
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Genie error:", error);
      // Fallback
      setSuggestions([
        `Expert version: ${input} focusing on efficiency and corporate standards.`,
        `Advanced prompt: ${input} with step-by-step reasoning and data-driven insights.`,
        `Creative take: ${input} using a narrative structure and visual descriptions.`
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border",
              theme === 'dark' 
                ? "bg-slate-900 border-white/10 text-white" 
                : "bg-white border-slate-200 text-slate-900"
            )}
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">PROMPT GENIE</h2>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">AI Prompt Enhancement</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your simple prompt here (e.g., 'Write an email about a delay')..."
                    className={cn(
                      "w-full rounded-3xl p-6 text-sm font-medium outline-none transition-all resize-none min-h-[120px] focus:ring-4 focus:ring-indigo-500/10",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                    )}
                  />
                  <button 
                    onClick={improvePrompt}
                    disabled={isGenerating || !input.trim()}
                    className="absolute right-4 bottom-4 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:hover:scale-100"
                  >
                    {isGenerating ? <Zap size={20} className="animate-spin" /> : <Wand2 size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Lightbulb size={12} className="text-amber-500" /> Suggestions
                </h3>
                
                <div className="space-y-3">
                  {suggestions.map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => {
                        onApply(suggestion);
                        onClose();
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left text-sm font-medium transition-all group flex items-center justify-between border",
                        theme === 'dark' 
                          ? "bg-white/2 border-white/5 hover:border-indigo-500/50 hover:bg-white/5" 
                          : "bg-slate-50 border-slate-100 hover:border-indigo-300 hover:bg-white"
                      )}
                    >
                      <span className="line-clamp-2 flex-1">{suggestion}</span>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all ml-4 shrink-0" />
                    </motion.button>
                  ))}
                  {suggestions.length === 0 && !isGenerating && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-500/10 rounded-3xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enter a prompt to see magic</p>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="space-y-3">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="h-20 w-full bg-slate-500/5 rounded-2xl animate-pulse flex items-center px-4 gap-4">
                           <div className="w-10 h-10 bg-slate-500/10 rounded-xl" />
                           <div className="flex-1 space-y-2">
                             <div className="h-3 bg-slate-500/10 rounded w-3/4" />
                             <div className="h-2 bg-slate-500/10 rounded w-1/2" />
                           </div>
                         </div>
                       ))}
                       <div className="text-center">
                         <p className="text-[10px] font-black text-indigo-500 animate-pulse uppercase tracking-[0.2em]">Consulting Intelligence Pipeline & Web Sources...</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-4 text-center text-[10px] font-bold uppercase tracking-[0.3em]",
              theme === 'dark' ? "bg-white/2 text-slate-600" : "bg-slate-50 text-slate-400"
            )}>
              Powered by Corporate Intelligence Pipeline 2.0
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
