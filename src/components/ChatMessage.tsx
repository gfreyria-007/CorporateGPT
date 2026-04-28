import React from 'react';
import { motion } from 'motion/react';
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
        isUser ? 'bg-white border border-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-500/30'
      }`}>
        {isUser ? 'USR' : 'AI'}
      </div>
      
      <div className={`flex-1 p-8 rounded-[2.5rem] rounded-tl-none shadow-sm border transition-all relative overflow-hidden backdrop-blur-sm ${
        isUser 
          ? 'bg-white dark:bg-corporate-900 border-corporate-200 dark:border-white/10 text-corporate-900 dark:text-white' 
          : 'bg-blue-600 border-blue-700 text-white shadow-2xl shadow-blue-500/20'
      }`}>
        {!isUser && <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={48} /></div>}
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-50 ${isUser ? 'text-blue-600' : 'text-white'}`}>
          {isUser ? t.user : t.assistant} &bull; {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className={`text-[16px] leading-relaxed prose prose-sm max-w-none ${isUser ? 'prose-slate dark:prose-invert font-medium' : 'prose-invert font-bold'}`}>
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </motion.div>
  );
};
