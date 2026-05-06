import React, {useRef, useState, FormEvent, ChangeEvent, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageSourceModal from './ImageSourceModal';
import { ExplorerSettings, Grade, ChatMode } from '../types';
import { TOOL_DEFINITIONS } from '../constants';
import { useAuth } from '../core/AuthContext';
import { useLanguage } from '../core/LanguageContext';

interface ChatInputProps {
  onSendMessage: (text: string, file?: File, isReviewMode?: boolean, quizCount?: number) => void;
  onDefaultMode: () => void;
  onModeChange: (mode: ChatMode) => void;
  chatMode: ChatMode;
  isLoading: boolean;
  explorerSettings: ExplorerSettings;
  onUpdateExplorerSettings: (settings: ExplorerSettings) => void;
  selectedGrade: Grade | null;
  onOpenFAQ?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onDefaultMode,
  onModeChange,
  chatMode,
  isLoading, 
  explorerSettings,
  onUpdateExplorerSettings,
  selectedGrade,
  onOpenFAQ
}) => {
  const { logout } = useAuth();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showExplorerConfig, setShowExplorerConfig] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMode === 'review-homework') {
        setIsReviewMode(true);
        setShowImageSourceModal(true);
    } else {
        setIsReviewMode(false);
    }
  }, [chatMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowTools(false);
      }
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowExplorerConfig(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSendMessage = () => {
    if (text.trim() || file) {
      let quizCount = 5;
      if (chatMode === 'quiz-master') {
          const match = text.match(/\d+/);
          if (match) quizCount = Math.min(10, Math.max(1, parseInt(match[0])));
      }

      onSendMessage(text.trim(), file, isReviewMode, quizCount);
      setText('');
      setFile(undefined);
      setIsReviewMode(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
      if(cameraInputRef.current) cameraInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doSendMessage();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleToolAction = (toolId: ChatMode) => {
      setShowTools(false);
      if (toolId === 'review-homework') {
          setIsReviewMode(true); 
          setShowImageSourceModal(true);
          return;
      }
      
      if (toolId === 'default') {
          onDefaultMode();
      } else {
          onModeChange(toolId);
      }
  };

  const handleAttachmentClick = () => {
    setShowImageSourceModal(true);
  }

  const triggerFileSelect = () => {
    setShowImageSourceModal(false);
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    setShowImageSourceModal(false);
    cameraInputRef.current?.click();
  };
  
  const removeFile = () => {
    setFile(undefined);
    if(fileInputRef.current) fileInputRef.current.value = '';
    if(cameraInputRef.current) cameraInputRef.current.value = '';
  }

  const getPlaceholderText = () => {
    if (isReviewMode) return isSpanish ? "Describe tu duda sobre la tarea..." : "Describe your question about the homework...";
    if (chatMode === 'explorer') return isSpanish ? "Pregunta a internet lo que quieras..." : "Ask the internet anything...";
    if (chatMode === 'researcher') return isSpanish ? "Ingresa un tema para investigar..." : "Enter a topic to research...";
    if (chatMode === 'quiz-master') return isSpanish ? "Tema del examen y número de preguntas..." : "Exam topic and number of questions...";
    return isSpanish ? "Escribe tu pregunta..." : "Type your question...";
  };
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doSendMessage();
    }
  };

  return (
    <>
      <ImageSourceModal 
        isOpen={showImageSourceModal}
        onClose={() => setShowImageSourceModal(false)}
        onSelectFromGallery={triggerFileSelect}
        onTakePhoto={triggerCamera}
      />
      
      <div className="p-2 sm:p-6 sticky bottom-0 z-30">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end space-x-1 sm:space-x-3 bg-white/70 backdrop-blur-2xl p-2 sm:p-3 rounded-[2rem] sm:rounded-[2.5rem] border border-white shadow-2xl premium-shadow-lg">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              
              <div className="relative shrink-0 self-end mb-0.5" ref={toolsRef}>
                  <button
                    type="button"
                    onClick={() => setShowTools(!showTools)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-4 py-3 text-blue-900 bg-blue-50 hover:bg-blue-900 hover:text-white rounded-2xl sm:rounded-[1.5rem] focus:outline-none transition-all duration-300 border border-blue-100 shadow-sm active:scale-90"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Cosas Pro ✨</span>
                  </button>
                  
                  {showTools && (
                      <div className="absolute bottom-full left-0 mb-4 w-[calc(100vw-2rem)] sm:w-72 bg-white/80 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white overflow-hidden z-50 animate-fade-in-scale transform origin-bottom-left premium-shadow-lg">
                          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-1 custom-scrollbar">
                              <h4 className="px-3 mb-2 text-[10px] font-black text-blue-900/50 uppercase tracking-[0.2em]">HERRAMIENTAS MÁGICAS</h4>
                              {TOOL_DEFINITIONS.map(tool => (
                                  <button
                                      key={tool.id}
                                      type="button"
                                      onClick={() => handleToolAction(tool.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-xl hover:bg-blue-50/50 transition-colors group"
                                  >
                                      <div className={`p-1 rounded-lg ${tool.iconBg} ${tool.iconText} shrink-0`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.iconPath} />
                                          </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <span className="block text-[11px] font-black text-blue-900 uppercase tracking-wide truncate">{tool.title}</span>
                                          <span className="block text-[9px] text-gray-500 truncate">{tool.desc}</span>
                                      </div>
                                  </button>
                              ))}
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); onOpenFAQ?.(); setShowTools(false); }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-xl hover:bg-blue-50 transition-colors group"
                              >
                                  <div className="p-1 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <span className="block text-[11px] font-black text-blue-600 uppercase tracking-wide truncate">Manual / FAQ</span>
                                      <span className="block text-[9px] text-gray-400 truncate">¿Cómo funciona Techie?</span>
                                  </div>
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                  type="button"
                                  onClick={logout}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-xl hover:bg-red-50 transition-colors group"
                              >
                                  <div className="p-1 rounded-lg bg-red-100 text-red-600 shrink-0">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                      </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <span className="block text-[11px] font-black text-red-600 uppercase tracking-wide truncate">Cerrar Sesión</span>
                                      <span className="block text-[9px] text-gray-400 truncate">Salir de la aplicación</span>
                                  </div>
                              </button>
                          </div>
                      </div>
                  )}
              </div>

              {chatMode === 'explorer' && (
                <div className="relative shrink-0 self-end mb-1" ref={configRef}>
                    <button
                        type="button"
                        onClick={() => setShowExplorerConfig(!showExplorerConfig)}
                        className="p-3 text-gray-400 hover:text-blue-900 transition-colors"
                        title="Configuración de Motor"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                    </button>

                    {showExplorerConfig && (
                        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-50 animate-fade-in-scale transform origin-bottom-left">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2">Configuración IA</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase">Precisión (Temp)</label>
                                        <span className="text-[9px] font-mono text-blue-900">{explorerSettings.temperature}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="1" step="0.1"
                                        value={explorerSettings.temperature}
                                        onChange={(e) => onUpdateExplorerSettings({...explorerSettings, temperature: parseFloat(e.target.value)})}
                                        className="w-full accent-blue-900 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Modificador de Respuesta</label>
                                    <textarea 
                                        value={explorerSettings.customSystemInstruction || ''}
                                        onChange={(e) => onUpdateExplorerSettings({...explorerSettings, customSystemInstruction: e.target.value})}
                                        placeholder="Ej: Solo responde en formato de lista..."
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs h-24 resize-none focus:ring-1 focus:ring-blue-900 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
              )}

              <button
                type="button"
                onClick={handleAttachmentClick}
                className={`p-3 text-gray-400 hover:text-blue-900 transition-colors shrink-0 self-end mb-1 ${isReviewMode ? 'text-blue-900' : ''}`}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              <div className="flex-1 flex flex-col relative">
                  <AnimatePresence>
                    {chatMode !== 'default' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-10 left-0 flex items-center gap-2"
                      >
                        <div className="bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                          <span className="animate-pulse">✨</span>
                          {TOOL_DEFINITIONS.find(t => t.id === chatMode)?.title.split(' ')[0] || chatMode}
                          <button 
                            onClick={(e) => { e.preventDefault(); onDefaultMode(); }}
                            className="ml-1 hover:text-red-400 transition-colors"
                            title="Volver a modo normal"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {file && (
                      <div className="mb-2 bg-blue-50 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-between border border-blue-100">
                          <span className="truncate max-w-[80%]">{file.name}</span>
                          <button type="button" onClick={removeFile} className="ml-2 text-blue-900">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>
                  )}
                  <textarea
                      ref={textareaRef}
                      rows={1}
                      value={text}
                      onChange={handleTextChange}
                      onKeyDown={handleKeyDown}
                      placeholder={getPlaceholderText()}
                      className="w-full p-3.5 border-none rounded-2xl focus:outline-none focus:ring-0 text-base resize-none overflow-y-auto bg-transparent text-slate-900 placeholder:text-slate-400"
                      style={{ maxHeight: '150px' }}
                      disabled={isLoading}
                  />
              </div>
              
              <button
                type="submit"
                className="p-3 bg-blue-900 text-white rounded-full hover:bg-black disabled:bg-gray-200 transition-all shrink-0 self-end mb-1 shadow-lg active:scale-95"
                disabled={isLoading || (!text.trim() && !file)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
          </form>
      </div>
    </>
  );
}

export default ChatInput;
