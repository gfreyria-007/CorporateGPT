
import React, { useState } from 'react';
import { QuizContent, QuizOption } from '../types';

interface QuizMessageProps {
  content: QuizContent;
  onAnswer: (question: string, option: QuizOption) => void;
  onNextQuestion?: () => void;
}

const QuizMessage: React.FC<QuizMessageProps> = ({ content, onAnswer, onNextQuestion }) => {
  const [selections, setSelections] = useState<{[key: string]: 'correct' | 'incorrect'}>({});
  const [lastSelectedHint, setLastSelectedHint] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const handleOptionClick = (option: QuizOption) => {
    // No hacer nada si ya se seleccionó esta opción (a menos que permitamos reintentos de incorrectas) o si el quiz ya está resuelto
    if (isSolved) return; 

    const newSelections = {...selections};
    setLastSelectedHint(option.hint || (option.isCorrect ? "¡Correcto!" : "Intenta pensar un poco más..."));

    if (option.isCorrect) {
      newSelections[option.text] = 'correct';
      setIsSolved(true);
    } else {
      newSelections[option.text] = 'incorrect';
    }
    
    setSelections(newSelections);
    onAnswer(content.question, option);
  };

  const getButtonClass = (option: QuizOption) => {
    const selectionStatus = selections[option.text];

    if (selectionStatus === 'correct') {
      return 'bg-green-500 border-green-500 text-white cursor-default';
    }
    if (selectionStatus === 'incorrect') {
      return 'bg-red-500 border-red-500 text-white cursor-default line-through';
    }
    if (isSolved && !option.isCorrect) {
        return 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed';
    }
    if (isSolved && option.isCorrect) {
        return 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed';
    }
    
    return 'bg-white hover:bg-rose-50 border-gray-300 text-gray-700';
  };

  return (
    <div className="space-y-4">
      {content.text && (
          <div className="text-sm md:text-base text-gray-800 leading-relaxed mb-2">
              {content.text}
          </div>
      )}
      <p className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3 py-1">{content.question}</p>
      
      <div className="flex flex-col space-y-2">
        {content.options.map((option, index) => (
          <button
            key={`${content.id}-${index}`}
            onClick={() => handleOptionClick(option)}
            disabled={isSolved || selections[option.text] === 'incorrect'}
            className={`
              w-full text-left p-3 rounded-xl border-2 
              transition-all duration-200 ease-in-out
              disabled:opacity-50 flex items-center space-x-3
              ${getButtonClass(option)}
            `}
          >
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${selections[option.text] ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm font-medium">{option.text}</span>
          </button>
        ))}
      </div>

      {lastSelectedHint && (
          <div className={`p-4 rounded-xl border-2 animate-fade-in ${isSolved ? 'bg-green-50 border-green-100 text-green-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
              <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              <div className="flex items-start gap-2">
                  <span className="text-xl">{isSolved ? '🌟' : '💡'}</span>
                  <div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{isSolved ? '¡Excelente!' : 'Pista de Techie'}</p>
                      <p className="text-sm leading-relaxed">{lastSelectedHint}</p>
                  </div>
              </div>
          </div>
      )}

      {isSolved && onNextQuestion && (
          <div className="pt-2 flex justify-center">
              <button 
                onClick={onNextQuestion}
                className="px-6 py-2.5 bg-blue-900 text-white rounded-full font-bold shadow-lg hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 text-sm uppercase tracking-widest flex items-center gap-2"
              >
                  Siguiente Pregunta
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
          </div>
      )}
    </div>
  );
};

export default QuizMessage;
