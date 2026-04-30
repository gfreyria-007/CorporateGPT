import React, { useState, useRef, useEffect } from 'react';
import { FullQuizContent, QuizResultContent } from '../types';

interface FullQuizMessageProps {
  content: FullQuizContent;
  onFinish: (result: QuizResultContent) => void;
}

const FullQuizMessage: React.FC<FullQuizMessageProps> = ({ content, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>(new Array(content.questions.length).fill(-1));
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Guard for double clicking during transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Fixed: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace error
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, []);

  // Safety check: ensure content.questions is defined and valid
  const questions = content.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
      return (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 text-center">
              <p className="text-red-500 font-bold">Error: No se pudo cargar la pregunta.</p>
          </div>
      );
  }

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted || isTransitioning) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);

    // Automatically advance to next question if it's not the last one
    if (currentQuestionIndex < questions.length - 1) {
        setIsTransitioning(true);
        // Wait 600ms for user to see their selection, then advance
        timerRef.current = setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsTransitioning(false);
            timerRef.current = null;
        }, 600);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Calculate score
    let correctCount = 0;
    userAnswers.forEach((ans, idx) => {
        if (questions[idx] && ans === questions[idx].correctIndex) {
            correctCount++;
        }
    });
    
    // Create Result Content
    const result: QuizResultContent = {
        type: 'quiz-result',
        topic: content.topic,
        score: correctCount,
        total: questions.length,
        questions: questions,
        userAnswers: userAnswers
    };
    
    onFinish(result);
  };

  const isAllAnswered = userAnswers.every(a => a !== -1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-pink-50 border-b border-pink-100 p-4 flex justify-between items-center">
        <div>
            <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Simulador de Examen</span>
            <h3 className="font-bold text-gray-800 text-lg">{content.topic}</h3>
        </div>
        <div className="bg-white px-3 py-1 rounded-full text-xs font-mono font-bold text-pink-600 border border-pink-200">
            {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Question Area */}
      <div className="p-6">
         <p className="text-lg text-gray-800 font-medium mb-6">{currentQuestion.question}</p>
         
         <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[currentQuestionIndex] === idx;
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isSubmitted || isTransitioning}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 group ${
                            isSelected 
                            ? 'border-pink-500 bg-pink-50 text-pink-800' 
                            : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50 text-gray-600'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-pink-500 bg-pink-500 text-white' : 'border-gray-300 group-hover:border-pink-300'
                        }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-sm md:text-base">{option}</span>
                    </button>
                );
            })}
         </div>
      </div>

      {/* Footer / Controls */}
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
         <button 
            onClick={handlePrev} 
            disabled={currentQuestionIndex === 0 || isTransitioning}
            className="px-4 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm transition-colors"
         >
            Anterior
         </button>
         
         {currentQuestionIndex === questions.length - 1 ? (
             <button 
                onClick={handleSubmit}
                disabled={!isAllAnswered || isSubmitted}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold shadow-md hover:bg-pink-700 disabled:bg-gray-300 disabled:shadow-none transition-all transform hover:-translate-y-0.5"
             >
                {isSubmitted ? "Enviado" : "Finalizar Examen"}
             </button>
         ) : (
             <button 
                onClick={handleNext}
                disabled={isTransitioning}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-400 transition-all text-sm shadow-sm disabled:opacity-50"
             >
                Siguiente
             </button>
         )}
      </div>
    </div>
  );
};

export default FullQuizMessage;