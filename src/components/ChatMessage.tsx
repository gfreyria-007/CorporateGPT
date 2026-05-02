import React from 'react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import { Sparkles } from 'lucide-react';
import { Message } from '../types';

import { translations } from '../lib/translations';

interface ChatMessageProps {
  message: Message;
  lang: 'en' | 'es';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, lang }) => {
  const isUser = message.role === 'user';
  const t = translations[lang];

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
          ? 'bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm' 
          : 'bg-white/90 dark:bg-corporate-900/40 backdrop-blur-3xl border-blue-500/30 dark:border-blue-500/20 text-slate-900 dark:text-white shadow-2xl shadow-blue-500/10'
      }`}>
        {!isUser && (
          <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover:opacity-10 transition-opacity">
            <Sparkles size={160} />
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
           <p className={`text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 ${isUser ? 'text-blue-600' : 'text-indigo-500'}`}>
             {isUser ? t.user : t.assistant} 
             <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full" />
             <span className="opacity-40">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </p>
           {!isUser && (
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Verified Output</span>
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
