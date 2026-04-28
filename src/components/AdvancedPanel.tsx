import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Search, 
  FileText, 
  BrainCircuit, 
  Thermometer,
  Maximize2,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AdvancedPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    temperature: number;
    maxTokens: number;
    deepThink: boolean;
    webSearch: boolean;
    docsOnly: boolean;
  };
  setSettings: (s: any) => void;
  onPromptGenie: () => void;
  theme: 'light' | 'dark';
}

export const AdvancedPanel: React.FC<AdvancedPanelProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  onPromptGenie,
  theme
}) => {
  if (!isOpen) return null;

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={cn(
        "w-full lg:w-80 border-l h-screen flex flex-col z-50 fixed right-0 top-0 overflow-hidden shadow-2xl",
        theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
      )}
    >
      <div className="p-6 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Advanced</h3>
            <p className="text-xs font-bold">Optimization</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Prompt Genie Integration */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligent Augmentation</label>
          <button
            onClick={onPromptGenie}
            className="w-full p-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[2rem] text-white text-left group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={20} />
              </div>
            </div>
            <h4 className="font-black text-sm uppercase tracking-tight">Prompt Genie</h4>
            <p className="text-[10px] font-bold opacity-60 leading-tight">Augment your instructions with enterprise context.</p>
          </button>
        </div>

        {/* Temperature */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Thermometer size={12} /> Temperature
            </label>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">{settings.temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[8px] font-bold text-slate-500">
            <span>PRECISE</span>
            <span>CREATIVE</span>
          </div>
        </div>

        {/* Max Tokens / Report Size */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Maximize2 size={12} /> Output Capacity
            </label>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {settings.maxTokens >= 1000 ? `${(settings.maxTokens/1000).toFixed(1)}K` : settings.maxTokens}
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={settings.maxTokens}
            onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
            className="w-full accent-blue-600 h-1.5 bg-slate-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[8px] font-bold text-slate-500">
            <span>QUICK CHAT (1K)</span>
            <span>DEEP REPORT (8K)</span>
          </div>
          <p className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-tighter opacity-70">Larger capacities allow for more comprehensive analytical reports.</p>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reasoning & Grounding</label>
          
          <ToggleItem
            icon={<BrainCircuit size={16} />}
            label="Deep Think"
            description="Chain-of-thought architecture."
            active={settings.deepThink}
            onClick={() => updateSetting('deepThink', !settings.deepThink)}
            theme={theme}
          />

          <ToggleItem
            icon={<Search size={16} />}
            label="Web Search"
            description="Real-time web verification."
            active={settings.webSearch}
            onClick={() => {
              updateSetting('webSearch', !settings.webSearch);
              if (!settings.webSearch) updateSetting('docsOnly', false);
            }}
            theme={theme}
          />

          <ToggleItem
            icon={<FileText size={16} />}
            label="Internal Only"
            description="Limit to attached corporate documents."
            active={settings.docsOnly}
            onClick={() => {
              updateSetting('docsOnly', !settings.docsOnly);
              if (!settings.docsOnly) updateSetting('webSearch', false);
            }}
            theme={theme}
          />
        </div>
      </div>

      <div className="p-6 border-t border-inherit">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">Settings persist for current session</p>
      </div>
    </motion.aside>
  );
};

const ToggleItem = ({ icon, label, description, active, onClick, theme }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
      active 
        ? "bg-blue-600/10 border-blue-600/50" 
        : theme === 'dark' ? "bg-white/2 border-white/5 hover:bg-white/5" : "bg-slate-50 border-slate-100 hover:bg-white"
    )}
  >
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-500"
      )}>
        {icon}
      </div>
      <div>
        <p className={cn("text-[10px] font-black uppercase tracking-tight", active ? "text-blue-600" : "text-slate-500")}>{label}</p>
        <p className="text-[9px] font-bold text-slate-400 leading-tight">{description}</p>
      </div>
    </div>
    <div className={cn(
      "w-8 h-4 rounded-full relative transition-all",
      active ? "bg-blue-600" : "bg-slate-300 dark:bg-white/10"
    )}>
      <div className={cn(
        "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
        active ? "right-0.5" : "left-0.5"
      )} />
    </div>
  </button>
);
