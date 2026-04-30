
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage, Role, QuizOption, QuizResultContent, Grade } from '../types';
import QuizMessage from './QuizMessage';
import ReviewMessage from './ReviewMessage';
import ReviewAllMessage from './ReviewAllMessage';
import SelectionMessage from './SelectionMessage';
import SearchMessage from './SearchMessage';
import FullQuizMessage from './FullQuizMessage';
import QuizReportMessage from './QuizReportMessage';
import MathMessage from './MathMessage';
import DeepResearchMessage from './DeepResearchMessage';

interface MessageProps {
  message: ChatMessage;
  onQuizAnswer: (question: string, option: QuizOption) => void;
  onSelection: (text: string) => void;
  onImageClick?: (url: string, prompt?: string) => void;
  onCreateFlashcards?: (text: string) => void;
  onEditImage?: (url: string) => void;
  onQuizFinished?: (result: QuizResultContent) => void;
  onAwardBadge?: (id: string, name: string, desc: string, icon: string) => void;
  onSaveProject?: (type: 'image' | 'report' | 'certificate', title: string, url?: string, content?: string) => void;
  grade?: Grade;
  userName?: string | null;
  customKey?: string;
}

const Message: React.FC<MessageProps> = ({ 
    message, onQuizAnswer, onSelection, onImageClick, 
    onCreateFlashcards, onEditImage, onQuizFinished, onAwardBadge, onSaveProject,
    grade, userName, customKey
}) => {
  const isUser = message.role === Role.USER;
  const isModel = message.role === 'model';
  const isSystem = message.role === Role.SYSTEM;

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
        const formatted = line.split('**').map((part, index) =>
            index % 2 === 1 ? <strong key={index} className="text-[#1e3a8a] font-bold">{part}</strong> : part
        );
        if (line.startsWith('###')) return <h3 key={i} className="text-lg font-black text-[#1e3a8a] mt-4 mb-2 uppercase tracking-tight">{formatted}</h3>;
        if (line.startsWith('##')) return <h2 key={i} className="text-xl font-black text-[#1e3a8a] mt-6 mb-3 uppercase tracking-tighter border-b border-gray-100 pb-2">{formatted}</h2>;
        
        return <p key={i} className="mb-2 leading-relaxed">{formatted}</p>;
    });
  };

  if (isSystem) {
    return (
        <div className="flex justify-center my-8 animate-fade-in">
            <div className="bg-white border border-gray-100 px-6 py-2 rounded-full shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.3em] whitespace-nowrap">
                    {typeof message.content === 'string' ? message.content : 'Notificación de Sistema'}
                </span>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    const { content, sources } = message;
    
    let mainContent: React.ReactNode;

    if (typeof content === 'string') {
      mainContent = <div className="text-sm md:text-base whitespace-pre-wrap">{renderMarkdown(content)}</div>;
    } else if (content.type === 'image') {
      mainContent = (
        <div className="mt-2 group cursor-pointer relative inline-block" onClick={() => onImageClick?.(content.url, content.prompt)}>
          <img src={content.url} alt="IA Content" className="max-w-[250px] rounded-lg border border-gray-200" referrerPolicy="no-referrer" />
        </div>
      );
    } else if (content.type === 'deep-research') {
        mainContent = (
            <DeepResearchMessage 
                content={content} 
                grade={grade} 
                userName={userName} 
                customKey={customKey}
                onImageClick={onImageClick}
                onSaveProject={onSaveProject}
            />
        );
    } else if (content.type === 'quiz') {
        mainContent = <QuizMessage content={content} onAnswer={onQuizAnswer} />;
    } else if (content.type === 'review') {
        mainContent = <ReviewMessage content={content} />;
    } else if (content.type === 'review-all') {
        mainContent = <ReviewAllMessage content={content} />;
    } else if (content.type === 'selection') {
        mainContent = <SelectionMessage content={content} onSelect={onSelection} />;
    } else if (content.type === 'search') {
        mainContent = <SearchMessage content={content} onCreateFlashcards={onCreateFlashcards} />;
    } else if (content.type === 'full-quiz') {
        mainContent = <FullQuizMessage content={content} onFinish={onQuizFinished!} />;
    } else if (content.type === 'quiz-result') {
        mainContent = <QuizReportMessage content={content} onAwardBadge={onAwardBadge} />;
    } else if (content.type === 'math') {
        mainContent = <MathMessage content={content} />;
    } else {
        mainContent = null;
    }

    return (
        <div className="space-y-3 w-full">
            {mainContent}
            {isModel && sources && sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fuentes Consultadas:</p>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((s, idx) => (
                            <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-gray-50 text-[#1e3a8a] px-2 py-1 rounded border border-gray-200 hover:bg-white transition-colors truncate max-w-[200px]">
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`flex items-start gap-3 my-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="shrink-0 group">
            <img 
                src="https://catalizia.com/images/catalizia-techie.png" 
                alt="Techie" 
                className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-lg group-hover:scale-125 transition-transform duration-300" 
                referrerPolicy="no-referrer" 
            />
        </div>
      )}
      <div className={`max-w-[85%] md:max-w-[75%] p-5 md:p-6 rounded-[2.5rem] shadow-2xl border border-white transition-all hover:scale-[1.01] ${
          isUser 
            ? 'bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-br-none premium-shadow-lg' 
            : 'bg-white/70 backdrop-blur-xl text-slate-800 rounded-bl-none premium-shadow-lg'
        } ${typeof message.content !== 'string' && message.content.type === 'deep-research' ? 'w-full !p-0 overflow-hidden' : ''}`}>
        {renderContent()}
        
        {isModel && typeof message.content !== 'string' && (message.content.type === 'image' || message.content.type === 'deep-research') && onSaveProject && (
            <div className="absolute top-2 right-2 flex gap-1">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof message.content !== 'string' && message.content.type === 'image') {
                            onSaveProject('image', message.content.prompt || 'Mi Dibujo', message.content.url);
                        } else if (typeof message.content !== 'string' && message.content.type === 'deep-research') {
                            onSaveProject('report', message.content.topic, undefined, message.content.markdownReport);
                        }
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-[#1e3a8a] rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 active:scale-90 flex items-center gap-2 group/save"
                    title="Guardar en Mochila"
                >
                    <span className="text-sm">💾</span>
                    <span className="text-[8px] font-black uppercase tracking-widest max-w-0 overflow-hidden group-hover/save:max-w-[100px] transition-all">Guardar</span>
                </button>
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;
