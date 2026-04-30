
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';

interface FlashcardModalProps {
  isOpen: boolean;
  cards: Flashcard[];
  onClose: () => void;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ isOpen, cards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset state when modal opens or cards change to prevent index out of bounds errors
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen, cards]);

  if (!isOpen || !cards || cards.length === 0) return null;

  // Safety Check: Ensure the card exists at the current index
  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      <div className="w-full max-w-lg flex flex-col items-center relative">
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Card Container */}
        <div className="w-full aspect-[4/3] sm:aspect-[16/9] perspective-1000 cursor-pointer group" onClick={handleFlip}>
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front (Question) */}
                <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-2xl backface-hidden flex flex-col items-center justify-center p-6 text-center border border-gray-200">
                    <span className="absolute top-4 left-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">Pregunta</span>
                    <p className="text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed select-none">
                        {currentCard.question}
                    </p>
                    <p className="absolute bottom-4 text-xs text-gray-400">Clic para ver respuesta</p>
                </div>

                {/* Back (Answer) */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center border border-blue-900">
                     <span className="absolute top-4 left-4 text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-md uppercase tracking-wider">Respuesta</span>
                     <p className="text-lg sm:text-xl font-medium text-white leading-relaxed select-none">
                        {currentCard.answer}
                    </p>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between w-full px-4">
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <span className="text-white font-mono font-bold text-lg">
                {currentIndex + 1} / {cards.length}
            </span>

            <button 
                 onClick={(e) => { e.stopPropagation(); handleNext(); }}
                 className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

      </div>
    </div>
  );
};

export default FlashcardModal;
