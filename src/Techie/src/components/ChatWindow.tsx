
import React, { useRef, useEffect } from 'react';
import { ChatMessage, QuizOption, QuizResultContent, Grade } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingText?: string;
  onQuizAnswer: (question: string, option: QuizOption) => void;
  onSelection: (text: string) => void;
  onImageClick: (url: string, prompt?: string) => void;
  onCreateFlashcards: (text: string) => void;
  onEditImage: (url: string) => void;
  onQuizFinished: (result: QuizResultContent) => void;
  onAwardBadge?: (id: string, name: string, desc: string, icon: string) => void;
  onSaveProject?: (type: 'image' | 'report' | 'certificate', title: string, url?: string, content?: string) => void;
  grade?: Grade;
  userName?: string | null;
  customKey?: string;
}

const TypingIndicator: React.FC<{ text?: string }> = ({ text }) => {
    const isThinking = text?.toLowerCase().includes("razonando") || text?.toLowerCase().includes("pensando");
    
    return (
        <div className="flex items-start gap-3 my-4 flex-row animate-fade-in">
            <img src="https://catalizia.com/images/catalizia-techie.png" alt="Techie" className="w-10 h-10 rounded-full border border-blue-600/10" referrerPolicy="no-referrer" />
            <div className={`max-w-xl p-4 rounded-2xl shadow-sm border transition-colors ${isThinking ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'} text-gray-800 rounded-bl-none flex items-center gap-3`}>
                <div className="flex space-x-1">
                    <span className={`w-2 h-2 ${isThinking ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-pulse delay-0`}></span>
                    <span className={`w-2 h-2 ${isThinking ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-pulse delay-200`}></span>
                    <span className={`w-2 h-2 ${isThinking ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-pulse delay-400`}></span>
                </div>
                {text && (
                    <span className={`text-xs sm:text-sm font-medium animate-pulse ${isThinking ? 'text-blue-700 italic' : 'text-gray-500'}`}>
                        {text}
                    </span>
                )}
            </div>
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    messages, isLoading, loadingText, onQuizAnswer, 
    onSelection, onImageClick, onCreateFlashcards, onEditImage, 
    onQuizFinished, onAwardBadge, onSaveProject,
    grade, userName, customKey
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-2 md:p-6 bg-transparent">
        <div className="max-w-4xl mx-auto pb-32">
            {messages.map((msg) => (
                <Message 
                    key={msg.timestamp} 
                    message={msg} 
                    onQuizAnswer={onQuizAnswer} 
                    onSelection={onSelection} 
                    onImageClick={onImageClick}
                    onCreateFlashcards={onCreateFlashcards}
                    onEditImage={onEditImage}
                    onQuizFinished={onQuizFinished}
                    onAwardBadge={onAwardBadge}
                    onSaveProject={onSaveProject}
                    grade={grade}
                    userName={userName}
                    customKey={customKey}
                />
            ))}
            {isLoading && <TypingIndicator text={loadingText} />}
            <div ref={messagesEndRef} />
        </div>
    </div>
  );
};

export default ChatWindow;
