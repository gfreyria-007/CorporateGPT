
import React from 'react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col border-4 border-blue-900/10">
        <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Manual del Explorador</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter mt-1">Preguntas Frecuentes</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <section className="space-y-3">
            <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="text-lg">🛡️</span> Privacidad y Seguridad
            </h3>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <p className="text-sm font-bold text-blue-800 mb-2">¿Dónde se guardan mis datos?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tus logros (medallas) y configuraciones se guardan de forma segura en nuestro sistema central. 
                Próximamente, podrás conectar tu cuenta de <strong>Google Drive</strong> para guardar tus imágenes y diplomas directamente en tu propia "nube".
              </p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <p className="text-sm font-bold text-blue-800 mb-2">Seguridad y Guardrails</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Techie está diseñado para ser un espacio seguro. Hemos implementado filtros especiales para jóvenes (guardrails) en la generación de texto e imágenes. 
                Al ser tecnología en evolución, siempre es genial explorar en compañía de un adulto para aprender juntos.
              </p>
            </div>
            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
              <p className="text-sm font-bold text-orange-800 mb-2">Uso de Datos y Privacidad Escolar</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Techie es una herramienta escolar. Al usar el nivel gratuito de Google Gemini, el manejo de datos es igual al de <strong>gemini.google.com</strong>. 
                Tus interacciones ayudan a que la IA aprenda (sin grado NDA). Para uso profesional con privacidad total, puedes conectar una cuenta de Google Cloud con facturación activa.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="text-lg">🎒</span> Mochila del Explorador
            </h3>
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
              <p className="text-sm font-bold text-amber-800 mb-2">¿Cómo gano medallas?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                ¡Aprendiendo! Techie te premia cuando completas misiones de estudio con éxito 
                o cuando sacas 100% en tus desafíos de conocimiento (Quizzes).
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="text-lg">🎨</span> Estudio de Arte
            </h3>
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p className="text-sm font-bold text-purple-800 mb-2">¿Quién es el dueño de mis dibujos?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                ¡Tú! Todo lo que generas con ayuda de la IA es tuyo. Techie es solo tu asistente creativo.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="text-lg">📧</span> Contacto y Gmail
            </h3>
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
              <p className="text-sm font-bold text-red-800 mb-2">¿Puedo recibir mis diplomas por correo?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Estamos trabajando para que puedas enviar tus reportes de estudio y logros directamente a tu Gmail 
                para que tus papás y maestros vean cuánto has progresado.
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-center">
          <button onClick={onClose} className="px-8 py-3 bg-blue-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-black transition-all">
            Entendido, ¡A Explorar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
