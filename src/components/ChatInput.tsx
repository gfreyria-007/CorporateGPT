import React, { useRef } from 'react';
import { Send, Loader2, Paperclip, X, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../lib/translations';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  isLoading: boolean;
  lang: 'en' | 'es';
  onAdvancedToggle?: () => void;
  input?: string;
  setInput?: (val: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  isLoading, 
  lang, 
  onAdvancedToggle,
  input: externalInput,
  setInput: setExternalInput
}) => {
  const [localInput, setLocalInput] = React.useState('');
  const input = externalInput !== undefined ? externalInput : localInput;
  const setInput = setExternalInput || setLocalInput;
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Regain focus on text input
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    textInputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSend(input, attachments);
      setInput('');
      setAttachments([]);
      textInputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 space-y-4">
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-3 px-4"
          >
            {attachments.map((file, i) => (
              <motion.div 
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 bg-blue-600/5 dark:bg-white/5 border border-blue-600/10 px-4 py-2 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <Paperclip size={12} className="text-blue-500" />
                <span className="truncate max-w-[120px] uppercase tracking-tighter">{file.name}</span>
                <button 
                  type="button"
                  onClick={() => removeAttachment(i)} 
                  className="ml-1 p-1 hover:bg-red-500 hover:text-white rounded-md transition-all"
                  id={`remove-attachment-${i}`}
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="relative flex gap-4 items-center" 
        id="chat-input-form"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleFileChange}
          id="hidden-file-input"
        />
        
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-600 rounded-xl transition-colors border border-transparent hover:border-blue-600/10"
              id="attach-button"
            >
              <Paperclip size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onAdvancedToggle}
              className="p-3 text-slate-400 hover:text-blue-600 rounded-xl transition-colors border border-transparent hover:border-blue-600/10"
              id="advanced-settings-button"
              title="Advanced Settings"
            >
              <Zap size={20} />
            </motion.button>
          </div>
          
          <input 
            ref={textInputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.askAnything}
            className="w-full bg-white dark:bg-corporate-900 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] py-6 pl-28 pr-8 focus:border-blue-600/50 shadow-sm focus:shadow-2xl focus:shadow-blue-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white font-bold text-lg"
            disabled={isLoading}
            id="chat-input-field"
          />
          
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity z-10">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-corporate-950 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 shadow-sm">{t.enter}</kbd>
          </div>
        </div>
        
        <motion.button
          whileHover={(!isLoading && (input.trim() || attachments.length > 0)) ? { scale: 1.05 } : {}}
          whileTap={(!isLoading && (input.trim() || attachments.length > 0)) ? { scale: 0.95 } : {}}
          type="submit"
          disabled={isLoading || (!input.trim() && attachments.length === 0)}
          className={`h-16 px-10 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
            isLoading || (!input.trim() && attachments.length === 0)
              ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40'
          }`}
          id="send-button"
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
            <>
              <Send size={20} />
              <span className="hidden sm:block">{t.send}</span>
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  );
};
