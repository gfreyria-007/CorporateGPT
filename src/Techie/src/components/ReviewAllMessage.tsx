import React from 'react';
import { ReviewAllContent, ProblemReview } from '../types';

interface ReviewAllMessageProps {
  content: ReviewAllContent;
}

const ReviewAllMessage: React.FC<ReviewAllMessageProps> = ({ content }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <h3 className="font-bold text-indigo-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Boleta de Calificaciones
        </h3>
        <p className="text-indigo-600 text-xs mt-1 font-medium">{content.generalComment}</p>
      </div>
      
      <div className="p-3 bg-gray-50/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {content.reviews.map((review, index) => (
            <div key={index} className={`relative p-3 rounded-lg border flex flex-col items-center text-center bg-white transition-all duration-200 hover:shadow-md ${
                review.status === 'correct' ? 'border-green-200 shadow-sm' : 
                review.status === 'incorrect' ? 'border-red-200 shadow-sm' : 
                review.status === 'missing' ? 'border-gray-300 border-dashed opacity-80' : 'border-orange-200'
            }`}>
                {/* Status Dot */}
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                     review.status === 'correct' ? 'bg-green-500' : 
                     review.status === 'incorrect' ? 'bg-red-500' : 
                     review.status === 'missing' ? 'bg-gray-400' : 'bg-orange-500'
                }`}></div>

                <span className={`text-xl font-bold mb-1 ${review.status === 'missing' ? 'text-gray-400' : 'text-gray-800'}`}>{review.problem}</span>
                
                <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-2 ${
                     review.status === 'correct' ? 'bg-green-100 text-green-700' : 
                     review.status === 'incorrect' ? 'bg-red-100 text-red-700' : 
                     review.status === 'missing' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'
                }`}>
                    {review.status === 'correct' ? 'Correcto' : 
                     review.status === 'incorrect' ? 'Incorrecto' : 
                     review.status === 'missing' ? 'Sin Resolver' : 'Revisar'}
                </div>
                
                <p className="text-xs text-gray-500 leading-tight line-clamp-3">
                    {review.text}
                </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewAllMessage;