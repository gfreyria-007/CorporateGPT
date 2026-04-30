
import React from 'react';

interface ImagePopupProps {
  isOpen: boolean;
  imageUrl: string | null;
  prompt?: string;
  onClose: () => void;
  onEdit?: (imageUrl: string) => void;
}

const ImagePopup: React.FC<ImagePopupProps> = ({ isOpen, imageUrl, prompt, onClose, onEdit }) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    const safePrompt = prompt 
        ? prompt.toLowerCase().substring(0, 20).replace(/[^a-z0-9]/g, '_') 
        : 'imagen_generada';
    link.download = `techie_${safePrompt}_${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
         <button 
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>

         <div className="relative group">
            <img 
                src={imageUrl} 
                alt={prompt || "Imagen generada"} 
                className="max-h-[70vh] md:max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain border border-white/10"
                referrerPolicy="no-referrer"
            />
         </div>
         
         <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95 shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
            </button>
            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(imageUrl); }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-500 transition-transform hover:scale-105 active:scale-95 shadow-lg border border-purple-400/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar en Estudio
                </button>
            )}
         </div>
         {prompt && (
             <p className="mt-4 text-white/80 text-sm text-center max-w-2xl font-light italic bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm">
                 "{prompt}"
             </p>
         )}
      </div>
    </div>
  );
};

export default ImagePopup;
