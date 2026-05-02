import React, { useRef, useState, useEffect } from 'react';
import { QuizResultContent } from '../types';

interface QuizReportMessageProps {
  content: QuizResultContent;
  onAwardBadge?: (id: string, name: string, desc: string, icon: string) => void;
  onSaveProject?: (type: 'image' | 'report' | 'certificate', title: string, url?: string, content?: string) => void;
}

const QuizReportMessage: React.FC<QuizReportMessageProps> = ({ content, onAwardBadge, onSaveProject }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const percentage = Math.round((content.score / content.total) * 100);

  useEffect(() => {
    if (percentage === 100 && onAwardBadge) {
        onAwardBadge(
            `quiz_perfect_${content.topic.replace(/\s+/g, '_').toLowerCase()}`,
            `Maestro: ${content.topic}`,
            `Obtuviste 100% en el examen de ${content.topic}`,
            '👑'
        );
    }
  }, [percentage, content.topic, onAwardBadge]);

  let gradeMessage = "";
  let gradeColor = "";

  if (percentage >= 90) { gradeMessage = "¡Excelente Trabajo!"; gradeColor = "text-green-600"; }
  else if (percentage >= 80) { gradeMessage = "¡Muy Bien!"; gradeColor = "text-blue-600"; }
  else if (percentage >= 60) { gradeMessage = "Bien, sigue practicando."; gradeColor = "text-orange-500"; }
  else { gradeMessage = "Necesitas repasar este tema."; gradeColor = "text-red-500"; }

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    const contentHTML = reportRef.current.innerHTML;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert("Por favor, habilita las ventanas emergentes para descargar el PDF.");
        setIsGeneratingPdf(false);
        return;
    }

    const doc = printWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Examen - ${content.topic}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 0mm; }
                body { 
                    font-family: 'Inter', sans-serif; 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                    margin: 15mm;
                }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body class="bg-white">
            <div class="max-w-[210mm] mx-auto p-8">
                ${contentHTML}
            </div>
            <script>
                window.onload = () => { setTimeout(() => { window.print(); }, 1000); };
            </script>
        </body>
        </html>
    `);
    doc.close();
    setIsGeneratingPdf(false);
  };

  return (
    <div className="w-full">
        <div ref={reportRef} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
            {/* Header */}
            <div className="bg-slate-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-white">CatalizIA</span>
                        <span className="text-[10px] px-1.5 rounded-full bg-blue-500/30 text-blue-200">Techie</span>
                     </div>
                     <div className="h-8 w-px bg-gray-300"></div>
                     <div>
                         <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Reporte de Resultados</h2>
                         <h1 className="text-xl font-bold text-gray-900">{content.topic}</h1>
                     </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-mono">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Score Section */}
            <div className="p-8 flex flex-col items-center justify-center border-b border-gray-100">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="60" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                        <circle 
                            cx="64" cy="64" r="60" stroke={percentage >= 80 ? '#2563eb' : percentage >= 60 ? '#f59e0b' : '#ef4444'} 
                            strokeWidth="8" fill="none" 
                            strokeDasharray={377} 
                            strokeDashoffset={377 - (377 * percentage) / 100} 
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{content.score}/{content.total}</span>
                        <span className="text-xs text-gray-500 font-medium">ACIERTOS</span>
                    </div>
                </div>
                <p className={`mt-4 text-lg font-bold ${gradeColor}`}>{gradeMessage}</p>
            </div>

            {/* Questions Review */}
            <div className="p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Detalle de Respuestas</h3>
                <div className="space-y-6">
                    {content.questions.map((q, idx) => {
                        const userAnswerIdx = content.userAnswers[idx];
                        const isCorrect = userAnswerIdx === q.correctIndex;
                        
                        return (
                            <div key={idx} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}>
                                <div className="flex gap-2 mb-2">
                                    <span className="font-bold text-gray-500 text-sm">#{idx + 1}</span>
                                    <p className="font-semibold text-gray-900 text-sm md:text-base">{q.question}</p>
                                </div>
                                
                                <div className="ml-6 space-y-1 mb-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-xs font-bold text-gray-500 w-20">Tu respuesta:</span>
                                        <span className={`${isCorrect ? 'text-green-700 font-bold' : 'text-red-600 line-through'}`}>
                                            {q.options[userAnswerIdx]}
                                        </span>
                                    </div>
                                    {!isCorrect && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-xs font-bold text-gray-500 w-20">Correcta:</span>
                                            <span className="text-green-700 font-bold">
                                                {q.options[q.correctIndex]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Explanation Feedback */}
                                {!isCorrect && (
                                    <div className="ml-6 p-3 bg-white rounded border border-gray-200 text-sm text-gray-600 italic">
                                        💡 <strong>Retroalimentación:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center text-[10px] text-gray-400 font-mono border-t border-gray-200">
                Generado por Techie Tutor IA - Catalizia.com
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
            <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all shadow-md"
            >
                {isGeneratingPdf ? 'Generando...' : 'Descargar PDF 📄'}
            </button>
            {onSaveProject && (
                <button 
                    onClick={() => onSaveProject('certificate', `Diploma: ${content.topic}`, undefined, `Calificación: ${content.score}/${content.total}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md"
                >
                    Guardar en Mochila 🎒
                </button>
            )}
        </div>
    </div>
  );
};

export default QuizReportMessage;
