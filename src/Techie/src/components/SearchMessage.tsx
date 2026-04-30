import React, { useState } from 'react';
import { SearchContent } from '../types';
import SelectionMessage from './SelectionMessage';

interface SearchMessageProps {
  content: SearchContent;
  onCreateFlashcards?: (text: string) => void;
}

const SearchMessage: React.FC<SearchMessageProps> = ({ content, onCreateFlashcards }) => {
  // 1: Level 1 (5 years old), 2: Level 2 (High school), 3: Level 3 (Expert)
  const [depth, setDepth] = useState<number>(2);

  const getActiveText = () => {
      if (content.layers) {
          if (depth === 1) return content.layers.level1;
          if (depth === 2) return content.layers.level2;
          return content.layers.level3;
      }
      return content.text || '';
  };

  const activeText = getActiveText();

  const formattedContent = activeText.split('**').map((part, index) =>
    index % 2 === 1 ? <strong key={index} className="text-blue-900 font-bold">{part}</strong> : part
  );

  return (
    <div className="space-y-4">
      {content.layers && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nivel de Profundidad</span>
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                     depth === 1 ? 'bg-green-100 text-green-700' : depth === 2 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                 }`}>
                     {depth === 1 ? 'Básico (5 años)' : depth === 2 ? 'Intermedio (Secundaria)' : 'Experto (Universitario)'}
                 </span>
             </div>
             <input 
                type="range" 
                min="1" 
                max="3" 
                step="1" 
                value={depth} 
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between mt-2 px-1 text-[9px] font-bold text-gray-400">
                 <span>Nivel 1</span>
                 <span>Nivel 2</span>
                 <span>Nivel 3</span>
             </div>
          </div>
      )}

      <div className="text-sm md:text-base whitespace-pre-wrap text-gray-900 animate-fade-in">
        {formattedContent}
      </div>
      
      {content.sources && content.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Fuentes verificadas:</p>
              <div className="flex flex-wrap gap-2">
                  {content.sources.map((source, idx) => (
                      <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] bg-gray-50 text-blue-900 px-3 py-1 rounded-full border border-blue-900/10 hover:bg-blue-50 transition-colors font-medium truncate max-w-[250px]"
                      >
                          {source.title}
                      </a>
                  ))}
              </div>
          </div>
      )}

      {/* Socratic Challenge for Explorer Mode */}
      {content.socraticChallenge && (
          <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
              <div className="bg-indigo-900 rounded-[2rem] p-6 shadow-xl border-t-4 border-indigo-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🎓</div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">Reto del Explorador</p>
                    <SelectionMessage 
                        content={{
                            type: 'selection',
                            question: content.socraticChallenge.question,
                            options: content.socraticChallenge.options.map((opt: any) => ({
                                text: opt.text,
                                isCorrect: opt.isCorrect,
                                feedback: opt.explanation || opt.why || (opt.isCorrect ? "¡Exacto! Tienes instinto de investigador." : "Casi... piénsalo de nuevo.")
                            }))
                        }} 
                        onSelect={onCreateFlashcards ? () => onCreateFlashcards(activeText) : () => {}} 
                    />
                </div>
              </div>
          </div>
      )}

      {onCreateFlashcards && !content.socraticChallenge && (
          <div className="pt-2">
             <button
                onClick={() => onCreateFlashcards(activeText)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-semibold shadow-sm"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                ✨ Crear Tarjetas de Estudio
             </button>
          </div>
      )}
    </div>
  );
};

export default SearchMessage;
