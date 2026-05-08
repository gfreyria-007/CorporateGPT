
import React from 'react';
import { Grade } from '../types';
import { GRADES, ToolDefinition } from '../constants';

interface GradeSelectorProps {
  selectedGrade: Grade | null;
  activeTool?: ToolDefinition;
  onGradeChange: (grade: Grade | null) => void;
}

const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, activeTool, onGradeChange }) => {
  if (selectedGrade) {
    return (
      <div className="py-2.5 px-6 bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center gap-4 animate-fade-in-down shadow-xl premium-shadow-lg rounded-full max-w-fit mx-auto mb-4 mt-2">
         <style>{`
          @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Grade Badge */}
        <button
          onClick={() => onGradeChange(null)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 ${selectedGrade.color.border}
            ${selectedGrade.color.text} hover:brightness-95 transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-1 ${selectedGrade.color.ring}
          `}
          title="Cambiar Grado"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d={selectedGrade.icon} />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest truncate">{selectedGrade.name}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-gray-200"></div>

        {/* Active Tool Badge */}
        {activeTool && (
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 ${activeTool.iconBg.replace('bg-', 'border-')} shadow-sm`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${activeTool.iconBg.replace('bg-', 'text-')} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeTool.iconPath} />
                </svg>
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest truncate">{activeTool.title}</span>
             </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border-b border-gray-100 animate-fade-in">
       <label className="block text-center text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Nivel Escolar</label>
       <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
        {GRADES.map((grade) => (
          <button
            key={grade.id}
            onClick={() => onGradeChange(grade)}
            className={`
              flex flex-col items-center justify-center 
              w-28 h-28 p-4 rounded-[2.5rem] border-2 transition-all duration-500 
              shadow-lg hover:shadow-2xl hover:-translate-y-2
              bg-white/80 backdrop-blur-md border-gray-100 ${grade.color.text} hover:${grade.color.border} group
            `}
          >
             <div className="mb-2 transform scale-125 transition-transform group-hover:scale-150">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d={grade.icon} />
                </svg>
             </div>
            <span className="text-[9px] font-black text-center leading-tight uppercase tracking-widest">{grade.name}</span>
          </button>
        ))}
       </div>
    </div>
  );
};

export default GradeSelector;
