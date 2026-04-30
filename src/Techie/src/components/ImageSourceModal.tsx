
import React from 'react';

interface ImageSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFromGallery: () => void;
  onTakePhoto: () => void;
}

const ImageSourceModal: React.FC<ImageSourceModalProps> = ({ isOpen, onClose, onSelectFromGallery, onTakePhoto }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.2s ease-out forwards' }}
      >
        <style>{`
          @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <h3 className="text-lg font-semibold text-gray-800 mb-5">Adjuntar imagen</h3>
        <div className="space-y-3">
          <button
            onClick={onSelectFromGallery}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
            Galería
          </button>
          <button
            onClick={onTakePhoto}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-4.586A1 1 0 019 4.414l-.414-.414A1 1 0 008 4H6a2 2 0 00-2 1v1zm10 4a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            Tomar Foto
          </button>
        </div>
        <button onClick={onClose} className="mt-6 text-sm text-gray-500 hover:text-blue-600 font-medium">Cancelar</button>
      </div>
    </div>
  );
};

export default ImageSourceModal;
