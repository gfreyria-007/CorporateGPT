
import React from 'react';
import { ReviewContent } from '../types';

interface ReviewMessageProps {
  content: ReviewContent;
}

const ReviewMessage: React.FC<ReviewMessageProps> = ({ content }) => {
  const getStyles = () => {
    switch (content.status) {
      case 'correct':
        return {
          container: 'bg-green-50 border-green-200',
          header: 'text-green-800 border-green-200',
          icon: 'bg-green-100 text-green-600',
          title: '¡Tarea Aprobada!',
          iconSvg: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'incorrect':
        return {
          container: 'bg-orange-50 border-orange-200',
          header: 'text-orange-800 border-orange-200',
          icon: 'bg-orange-100 text-orange-600',
          title: 'Revisión Necesaria',
          iconSvg: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'missing':
      case 'unanswered':
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          header: 'text-blue-800 border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          title: content.status === 'missing' ? 'Falta Información' : 'Tarea Pendiente',
          iconSvg: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${styles.container}`}>
      <div className={`px-4 py-3 border-b flex items-center gap-3 ${styles.header}`}>
        <div className={`p-1.5 rounded-full ${styles.icon}`}>
          {styles.iconSvg}
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wide">Nota del Asesor Techie</h3>
          <p className="text-xs opacity-90 font-medium">{styles.title}</p>
        </div>
      </div>
      <div className="p-4 text-gray-800 text-sm md:text-base leading-relaxed">
        {content.message}
      </div>
      {content.status === 'correct' && (
        <div className="bg-white/50 p-2 text-center text-xs text-green-700 font-semibold">
          ¡Sigue así! 🌟
        </div>
      )}
    </div>
  );
};

export default ReviewMessage;
