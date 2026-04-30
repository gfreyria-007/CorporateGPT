
import React, { useState } from 'react';
import { SelectionContent, SelectionOption } from '../types';

interface SelectionMessageProps {
  content: SelectionContent;
  onSelect: (text: string) => void;
}

const SelectionMessage: React.FC<SelectionMessageProps> = ({ content, onSelect }) => {
  const [clickedIndices, setClickedIndices] = useState<Set<number>>(new Set());
  const [hasSolved, setHasSolved] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handleSelect = (option: SelectionOption, index: number) => {
    if (hasSolved) return;
    
    const nextClicked = new Set(clickedIndices);
    nextClicked.add(index);
    setClickedIndices(nextClicked);
    setFeedbackText(option.feedback || (option.isCorrect ? "¡Correcto!" : "Intenta de nuevo..."));

    if (option.isCorrect) {
      setHasSolved(true);
      // Wait for the green animation before advancing
      setTimeout(() => {
        onSelect(option.originalText || option.text);
      }, 800);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Socratic Hint */}
      {content.text && (
          <div className="text-gray-800 text-sm md:text-base leading-relaxed mb-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 italic">
              " {content.text} "
          </div>
      )}
      
      {/* Question */}
      <p className="font-black text-blue-900 border-l-4 border-blue-900 pl-4 py-1 uppercase tracking-tight text-sm">
          {content.question}
      </p>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {content.options.map((option, index) => {
          const isClicked = clickedIndices.has(index);
          const isCorrect = option.isCorrect;
          
          let btnStyle = "bg-white border-gray-100 text-gray-700 hover:border-blue-900 hover:bg-blue-50 shadow-sm";
          let iconStyle = "bg-gray-100 text-gray-500 group-hover:bg-blue-900 group-hover:text-white";

          if (isClicked) {
            if (isCorrect) {
              btnStyle = "bg-green-50 border-green-500 text-green-800 shadow-md ring-2 ring-green-200 animate-bounce-short";
              iconStyle = "bg-green-500 text-white";
            } else {
              btnStyle = "bg-red-50 border-red-500 text-red-800 opacity-90 animate-shake";
              iconStyle = "bg-red-500 text-white";
            }
          } else if (hasSolved) {
              btnStyle = "bg-white border-gray-100 text-gray-400 opacity-50 cursor-not-allowed";
              iconStyle = "bg-gray-50 text-gray-300";
          }

          return (
            <button
              key={`${content.id}-${index}`}
              onClick={() => handleSelect(option, index)}
              disabled={hasSolved}
              className={`
                w-full text-left p-4 rounded-2xl border-2 
                transition-all duration-300 flex items-center gap-4 group
                ${btnStyle}
              `}
            >
              <div className={`
                flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-colors
                ${iconStyle}
              `}>
                  {String.fromCharCode(65 + index)}
              </div>
              <span className="font-bold text-sm md:text-base leading-tight">{option.text}</span>
            </button>
          );
        })}
      </div>
      
      {/* Feedback Area */}
      {feedbackText && (
          <div className={`text-center py-2 px-4 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse ${hasSolved ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
              {feedbackText}
          </div>
      )}

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-bounce-short { animation: bounce-short 0.4s ease-in-out; }
        .animate-shake { animation: shake 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default SelectionMessage;
