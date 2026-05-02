import React from 'react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "🛡️ Privacidad y Seguridad",
      items: [
        {
          q: "¿Dónde se guardan mis datos?",
          a: "Tus logros (medallas), configuraciones y progreso se guardan de forma segura en nuestros servidores."
        },
        {
          q: "¿Mis conversaciones son privadas?",
          a: "Sí. Tus conversaciones solo tú puedes verlas. Cuando borras una conversación, se elimina para siempre."
        },
        {
          q: "¿Qué pasa si le doy información personal al robot?",
          a: "No des información personal como tu dirección, teléfono, escuela real o datos de tus papás. El robot es solo para ayudarte con tareas."
        }
      ]
    },
    {
      title: "🧠 Cómo Usar Techie",
      items: [
        {
          q: "¿Cómo le pido ayuda a Techie?",
          a: "Escribe lo que necesites en el chat. Por ejemplo: 'Explícame las tablas de multiplicar' o 'Ayúdame con mi tarea de ciencias'."
        },
        {
          q: "¿Qué puedo preguntarle a Techie?",
          a: "De todo: matemáticas, ciencias, historia, español, inglés, arte, y más. También puede ayudarte a escribir cuentos y preparar exámenes."
        },
        {
          q: "¿Cómo funciona el Laboratorio de Matemáticas?",
          a: "Haz clic en 'Laboratorio de Mate' en el menú para resolver problemas paso a paso."
        },
        {
          q: "¿Cómo creo imágenes?",
          a: "Usa el 'Taller de Arte'. Describe lo que quieres ver y Techie lo creará para ti."
        }
      ]
    },
    {
      title: "🎒 Mochila y Logros",
      items: [
        {
          q: "¿Cómo gano medallas?",
          a: "Ganas cuando completas misiones de estudio, sacas 100% en Quizzes, investigas temas nuevos o creas arte."
        },
        {
          q: "¿Qué hay en mi Mochila?",
          a: "Tu Mochila guarda todo lo que creas: imágenes, archivos y certificados."
        }
      ]
    },
    {
      title: "🎨 Taller de Arte",
      items: [
        {
          q: "¿Quién es el dueño de lo que creo?",
          a: "¡Tú! Todo lo que generas con ayuda de la IA es tuyo."
        },
        {
          q: "¿Puedo usar las imágenes para la escuela?",
          a: "Sí. Las imágenes son perfectas para presentaciones de tareas y proyectos."
        }
      ]
    },
    {
      title: "📱 Cuentas y Dispositivos",
      items: [
        {
          q: "¿Puedo usar Techie en mi celular?",
          a: "Sí. Techie funciona en phones, tablets y computadoras con navegador e internet."
        },
        {
          q: "¿Necesito una cuenta de correo?",
          a: "Sí. Usa tu correo de Google (Gmail) para entrar rápido, o crea una cuenta con correo y contraseña."
        }
      ]
    },
    {
      title: "❓ Ayuda",
      items: [
        {
          q: "¿Qué hago si algo no funciona?",
          a: "Cierra y abre el navegador. Si sigue sin funcionar,-contacta a tus papás para que nos escriban a contacto@catalizia.com"
        },
        {
          q: "¿Cómo contacto al equipo?",
          a: "Tus papás pueden escribirnos a contacto@catalizia.com con el problema."
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-4 border-blue-900/10">
        <div className="bg-blue-900 p-4 sm:p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 hidden sm:block">Manual del Explorador</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mt-1">Preguntas Frecuentes</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 ml-2">
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, qIdx) => (
                  <details key={qIdx} className="group rounded-xl border border-blue-100 overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 p-3 sm:p-4 cursor-pointer bg-blue-50/30 hover:bg-blue-50 transition-colors list-none">
                      <span className="font-bold text-blue-900 text-xs sm:text-sm">{item.q}</span>
                      <span className="text-blue-400 text-lg group-open:rotate-45 transition-transform">▶</span>
                    </summary>
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-blue-100 mt-1">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 border-t flex justify-center shrink-0">
          <button onClick={onClose} className="px-8 py-3 bg-blue-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-black transition-all w-full sm:w-auto">
            ¡Entendido, a Explorar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;