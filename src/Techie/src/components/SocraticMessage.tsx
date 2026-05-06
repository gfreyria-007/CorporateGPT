import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SocraticContent } from '../types';

interface SocraticMessageProps {
  content: SocraticContent;
  onAnswer: (question: string, option: { text: string; isCorrect: boolean; hint: string; explanation: string }) => void;
  onNextQuestion?: () => void;
}

const SocraticMessage: React.FC<SocraticMessageProps> = ({ content, onAnswer, onNextQuestion }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(content.isAnswered || false);

  const handleOptionClick = (option: { text: string; isCorrect: boolean; hint: string; explanation: string }) => {
    if (isAnswered) return;
    
    setSelectedOption(option.text);
    setIsAnswered(true);
    setShowExplanation(true);
    
    onAnswer(content.question, option);
  };

  const getOptionClass = (option: { text: string; isCorrect: boolean; hint: string; explanation: string }) => {
    if (!isAnswered) {
      return 'bg-white hover:bg-indigo-50 border-gray-300 text-gray-700 hover:border-indigo-400 hover:shadow-md cursor-pointer transform hover:scale-[1.02] transition-all';
    }
    
    if (selectedOption === option.text && option.isCorrect) {
      return 'bg-green-100 border-green-500 text-green-800 shadow-lg';
    }
    
    if (selectedOption === option.text && !option.isCorrect) {
      return 'bg-red-100 border-red-500 text-red-800 shadow-lg line-through';
    }
    
    if (option.isCorrect && !selectedOption) {
      return 'bg-green-50 border-green-300 text-green-700';
    }
    
    return 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Topic Tag */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-full">
          🎯 Tutor Socrático
        </span>
        <span className="ml-2 text-xs text-indigo-400 font-medium">
          Tema: {content.topic}
        </span>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-100 shadow-lg mb-6">
        <h3 className="text-lg md:text-xl font-black text-indigo-900 leading-relaxed">
          {content.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {content.options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleOptionClick(option)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-sm md:text-base transition-all ${getOptionClass(option)}`}
          >
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option.text}</span>
              {isAnswered && selectedOption === option.text && option.isCorrect && (
                <span className="text-green-600 text-xl">✅</span>
              )}
              {isAnswered && selectedOption === option.text && !option.isCorrect && (
                <span className="text-red-600 text-xl">❌</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Hint (shown when wrong answer selected) */}
      {isAnswered && selectedOption && !content.options.find(o => o.text === selectedOption)?.isCorrect && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">Pista:</p>
              <p className="text-sm text-amber-800">{content.options.find(o => o.text === selectedOption)?.hint}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Explanation (shown after answering) */}
      {isAnswered && showExplanation && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-xs font-black text-green-700 uppercase tracking-wider mb-1">¡Explicación:</p>
              <p className="text-sm text-green-800">{content.options.find(o => o.isCorrect)?.explanation}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Question Button */}
      {isAnswered && (
        <div className="text-center">
          <button 
            onClick={onNextQuestion}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all"
          >
            ➡️ Siguiente Pregunta
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SocraticMessage;