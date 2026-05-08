import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { Sparkles, Copy, Check, Image as ImageIcon, Download } from 'lucide-react';
import { Message } from '../types';
import { translations } from '../lib/translations';

interface ChatMessageProps {
  message: Message;
  lang: 'en' | 'es';
  onEditImage?: (imageData: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, lang = 'es' }) => {
  const isUser = message.role === 'user';
  const t = translations[lang || 'es'];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (message.imageData) {
      const link = document.createElement('a');
      link.href = message.imageData;
      link.download = `generated-image-${message.id}.png`;
      link.click();
    }
  };

  // Render image message
  if (message.isImage && message.imageData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 260, 
          damping: 20
        }}
        className="flex gap-6 mb-8 max-w-4xl mx-auto w-full group relative"
        id={`message-${message.id}`}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-[11px] font-black shadow-lg transition-transform group-hover:rotate-6 bg-purple-600 text-white shadow-purple-500/30 ring-4 ring-purple-600/10"
        >
          <ImageIcon size={18} />
        </motion.div>
        
        <div className="flex-1 p-6 rounded-[2rem] border bg-white dark:bg-blue-950/90 backdrop-blur-3xl border-purple-500/40 dark:border-purple-500/40 text-slate-900 dark:text-white shadow-2xl shadow-purple-500/20 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-purple-500 dark:text-purple-400">
              <ImageIcon size={14} />
              {lang === 'es' ? 'Imagen Generada' : 'Generated Image'}
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-white/30 rounded-full" />
              <span className="opacity-70 dark:opacity-60">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            <div className="flex items-center gap-2">
              {onEditImage && (
                <button 
                  onClick={() => onEditImage(message.imageData!)}
                  className="p-2 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-xl transition-all text-blue-600 dark:text-blue-400 flex items-center gap-2 border border-transparent dark:border-blue-500/20 shadow-sm"
                  title={lang === 'es' ? 'Editar en Studio' : 'Edit in Studio'}
                >
                  <Palette size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'es' ? 'Editar' : 'Edit'}</span>
                </button>
              )}
              <button 
                onClick={handleDownloadImage}
                className="p-2 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 rounded-xl transition-all text-purple-600 dark:text-purple-400 group/download flex items-center gap-2 border border-transparent dark:border-purple-500/20 shadow-sm"
                title={lang === 'es' ? 'Descargar imagen' : 'Download image'}
              >
                <Download size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'es' ? 'Descargar' : 'Download'}</span>
              </button>
            </div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-inner bg-slate-900 min-h-[300px] flex items-center justify-center">
            <img 
              src={message.imageData} 
              alt={message.content || 'AI generated image'}
              className="w-full h-auto max-h-[70vh] object-contain transition-opacity duration-500"
              onLoad={(e) => (e.currentTarget.style.opacity = '1')}
              style={{ opacity: 0 }}
            />
          </div>
          
          {message.content && (
            <div className="mt-4 pt-4 border-t border-purple-500/10">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {lang === 'es' ? 'Prompt de Creación:' : 'Creation Prompt:'}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">
                "{message.content}"
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        delay: isUser ? 0 : 0.1
      }}
      whileHover={{ scale: 1.002, transition: { duration: 0.2 } }}
      className={`flex gap-6 mb-8 max-w-4xl mx-auto w-full group relative`}
      id={`message-${message.id}`}
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-[11px] font-black shadow-lg transition-transform group-hover:rotate-6 ${
          isUser ? 'bg-white border border-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-600/10'
        }`}
      >
        {isUser ? 'USR' : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Sparkles size={18} />
          </div>
        )}
      </motion.div>
      
      <div className={`flex-1 p-10 rounded-[3rem] rounded-tl-none border transition-all relative overflow-hidden ${
        isUser 
          ? 'bg-white/95 dark:bg-white/[0.05] backdrop-blur-3xl border-slate-200 dark:border-white/20 text-slate-900 dark:text-white shadow-sm' 
          : 'bg-white dark:bg-blue-950/90 backdrop-blur-3xl border-blue-500/40 dark:border-blue-500/40 text-slate-900 dark:text-white shadow-2xl shadow-blue-500/20'
      }`}>
        {!isUser && (
          <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover:opacity-10 transition-opacity">
            <Sparkles size={160} />
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
           <p className={`text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 ${isUser ? 'text-blue-600' : 'text-blue-500 dark:text-blue-400'}`}>
             {isUser ? t.user : t.assistant} 
             <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-white/30 rounded-full" />
             <span className="opacity-70 dark:opacity-60">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </p>
           {!isUser && (
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified Output</span>
                 </div>
                 <button 
                  onClick={handleCopy}
                  className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-slate-500 dark:text-white/40 hover:text-blue-600 dark:hover:text-white group/copy flex items-center gap-2 border border-transparent dark:border-white/5 shadow-sm"
                  title="Copy response"
                 >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
                 </button>
              </div>
           )}
        </div>
        <div 
          className={`leading-relaxed prose max-w-none ${isUser ? 'prose-slate dark:prose-invert font-semibold' : 'prose-blue dark:prose-invert font-semibold'}`}
          style={{ fontSize: '15px' }}
        >
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </motion.div>
  );
};
