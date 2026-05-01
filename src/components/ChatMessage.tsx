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
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex gap-6 mb-8 max-w-4xl mx-auto w-full group relative`}
      id={`message-${message.id}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-[11px] font-black shadow-lg transition-transform group-hover:rotate-6 ${
        isUser ? 'bg-white border border-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-600/10'
      }`}>
        {isUser ? 'USR' : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Sparkles size={18} />
          </div>
        )}
      </div>
      
      <div className={`flex-1 p-8 rounded-[2.5rem] rounded-tl-none border transition-all relative overflow-hidden ${
        isUser 
          ? 'bg-white dark:bg-corporate-900 border-corporate-200 dark:border-white/10 text-corporate-900 dark:text-white shadow-sm' 
          : 'bg-white dark:bg-corporate-900 border-blue-500/20 dark:border-blue-500/30 text-corporate-900 dark:text-white shadow-xl shadow-blue-500/5'
      }`}>
        {!isUser && (
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Sparkles size={120} />
          </div>
        )}
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${isUser ? 'text-blue-600' : 'text-blue-500'}`}>
          {isUser ? t.user : t.assistant} 
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="opacity-50">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </p>
        <div 
          className={`leading-relaxed prose max-w-none ${isUser ? 'prose-slate dark:prose-invert font-medium' : 'prose-blue dark:prose-invert font-medium'}`}
          style={{ fontSize: 'inherit' }}
        >
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </motion.div>
  );
};
