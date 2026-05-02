import React from 'react';
import { HelpCircle, ChevronRight, MessageSquare, ShieldCheck, Zap, Gem, Palette, Coins, X, CreditCard, Users, FileText, Globe, Lock, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface FAQProps {
  onClose: () => void;
  lang: 'en' | 'es';
  theme: 'light' | 'dark';
}

const content = {
  en: {
    title: "CorporateGPT Help Center",
    subtitle: "Everything you need to know about our AI platform",
    sections: [
      {
        title: "About CorporateGPT",
        icon: <ShieldCheck size={20} />,
        questions: [
          {
            q: "What is CorporateGPT?",
            a: "CorporateGPT is an enterprise AI platform powered by Google Gemini models. We offer intelligent chat, document analysis, image generation, and presentation tools for businesses."
          },
          {
            q: "Which AI models do you use?",
            a: "Our primary engine is Google Gemini (gemini-2.0-flash for fast responses, gemini-1.5-flash for economy). All plans use Gemini - there's no routing to other providers."
          },
          {
            q: "How is my data protected?",
            a: "Your data is processed securely through our servers. We do NOT share your data with third parties. Your conversations and uploads are handled with privacy in mind."
          }
        ]
      },
      {
        title: "Getting Started",
        icon: <Zap size={20} />,
        questions: [
          {
            q: "How do I start?",
            a: "Sign in with your email, Google, or Apple account. Once logged in, you can start chatting immediately. The system will route your queries automatically."
          },
          {
            q: "Can I upload documents?",
            a: "Yes. You can upload PDFs, Word documents, Excel files, CSVs, and images. The AI can analyze them and answer questions about the content."
          },
          {
            q: "Can I create images?",
            a: "Yes. Use the Asset Studio (palette icon in the sidebar) to generate professional infographics and slides using AI."
          }
        ]
      },
      {
        title: "Plans & Tier System",
        icon: <CreditCard size={20} />,
        questions: [
          {
            q: "How does the tier system work?",
            a: "Your account is assigned a tier (Elite, Standard, Eco, or Free) based on your subscription. Different tiers have different daily token allowances."
          },
          {
            q: "What happens when I run out of tokens?",
            a: "When your daily allowance is exhausted, the system shows an 'Eco Mode' banner and automatically switches to our free tier model. Your work continues without interruption."
          },
          {
            q: "Can I upgrade my plan?",
            a: "Yes. Contact contacto@catalizia.com to inquire about upgrading your subscription. We'll provide information on available plans and pricing."
          }
        ]
      },
      {
        title: "Features",
        icon: <Palette size={20} />,
        questions: [
          {
            q: "Can I create custom GPTs?",
            a: "Yes. Go to 'Knowledge Bank' (database icon in sidebar) to create custom AI assistants with your own documents and instructions."
          },
          {
            q: "Can I generate PowerPoint presentations?",
            a: "Yes. Use the PPT Studio to generate slide decks. Describe your topic and the AI will create professional slides with charts and data visualizations."
          },
          {
            q: "What about the Junior (Techie) mode?",
            a: "Family plans include access to Techie - our educational AI tutor for students. Techie uses age-appropriate content and has safety filters for children."
          }
        ]
      },
      {
        title: "Privacy & Data",
        icon: <Lock size={20} />,
        questions: [
          {
            q: "Is my data private?",
            a: "Yes. We use industry-standard security practices. Your data is processed through our secure infrastructure and we do not share it with external parties."
          },
          {
            q: "Where is my data stored?",
            a: "Your data is stored on Google Cloud Platform (GCP) secure servers."
          },
          {
            q: "Do you comply with GDPR / Mexican data laws?",
            a: "We are committed to compliance with applicable data protection regulations. Contact contacto@catalizia.com for specific compliance requirements."
          }
        ]
      },
      {
        title: "Team Management",
        icon: <Users size={20} />,
        questions: [
          {
            q: "Can I add team members?",
            a: "Yes. Super Admins can invite new users from the Team Management panel. Enter their email and assign a role."
          },
          {
            q: "What roles are available?",
            a: "Roles include: Super Admin (full access), Admin (can manage users), User (standard access), and Viewer (view-only access)."
          }
        ]
      },
      {
        title: "Support",
        icon: <MessageSquare size={20} />,
        questions: [
          {
            q: "How do I get help?",
            a: "Email contacto@catalizia.com for all inquiries including technical support, billing questions, and general questions. We'll respond as quickly as possible."
          },
          {
            q: "The platform is not working",
            a: "First, try refreshing your browser. If the problem persists, contact us with details and we'll investigate."
          }
        ]
      }
    ]
  },
  es: {
    title: "Centro de Ayuda CorporateGPT",
    subtitle: "Todo lo que necesitas saber sobre nuestra plataforma de IA",
    sections: [
      {
        title: "Acerca de CorporateGPT",
        icon: <ShieldCheck size={20} />,
        questions: [
          {
            q: "¿Qué es CorporateGPT?",
            a: "CorporateGPT es una plataforma de IA empresarial impulsada por Google Gemini. Ofrecemos chat inteligente, análisis de documentos, generación de imágenes y herramientas de presentaciones para empresas."
          },
          {
            q: "¿Qué modelos de IA usan?",
            a: "Nuestro motor principal es Google Gemini (gemini-2.0-flash para respuestas rápidas, gemini-1.5-flash para economía). Todos los planes usan Gemini - no hay enrutamiento a otros proveedores."
          },
          {
            q: "¿Cómo está protegida mi información?",
            a: "Tu información se procesa de forma segura a través de nuestros servidores. NO compartimos tus datos con terceros. Tus conversaciones y subida de archivos se manejan con privacidad en mente."
          }
        ]
      },
      {
        title: "Comenzar",
        icon: <Zap size={20} />,
        questions: [
          {
            q: "¿Cómo empiezo?",
            a: "Inicia sesión con tu correo, Google o Apple. Una vez conectado, puedes comenzar a chatear inmediatamente. El sistema enrutará tus consultas automáticamente."
          },
          {
            q: "¿Puedo subir documentos?",
            a: "Sí. Puedes subir PDFs, documentos de Word, Excel, CSVs e imágenes. La IA puede analizarlos y responder preguntas sobre el contenido."
          },
          {
            q: "¿Puedo generar imágenes?",
            a: "Sí. Usa el Estudio de Activos (ícono de paleta en el barra lateral) para generar infografías profesionales y diapositivas usando IA."
          }
        ]
      },
      {
        title: "Planes y Sistema de Niveles",
        icon: <CreditCard size={20} />,
        questions: [
          {
            q: "¿Cómo funciona el sistema de niveles?",
            a: "Tu cuenta tiene un nivel asignado (Elite, Standard, Eco o Free) basado en tu suscripción. Diferentes niveles tienen diferentes asignaciones diarias de tokens."
          },
          {
            q: "¿Qué pasa cuando me quedo sin tokens?",
            a: "Cuando tu asignación diaria se agota, el sistema muestra un banner de 'Modo Eco' y cambia automáticamente al modelo de nivel gratuito. Tu trabajo continúa sin interrupción."
          },
          {
            q: "¿Puedo mejorar mi plan?",
            a: "Sí. Contacta contacto@catalizia.com para preguntar sobre mejorar tu suscripción. Te proporcionaremos información sobre planes disponibles y precios."
          }
        ]
      },
      {
        title: "Características",
        icon: <Palette size={20} />,
        questions: [
          {
            q: "¿Puedo crear GPTs personalizados?",
            a: "Sí. Ve a 'Banco de Conocimiento' (ícono de base de datos en barra lateral) para crear asistentes de IA personalizados con tus propios documentos e instrucciones."
          },
          {
            q: "¿Puedo generar presentaciones de PowerPoint?",
            a: "Sí. Usa el Estudio de PPT para generar juegos de diapositivas. Describe tu tema y la IA creará diapositivas profesionales con gráficos y visualizaciones de datos."
          },
          {
            q: "¿Qué pasa con el modo Junior (Techie)?",
            a: "Los planes familiares incluyen acceso a Techie - nuestro tutor de IA educativo para estudiantes. Techie usa contenido apropiado para la edad y tiene filtros de seguridad para niños."
          }
        ]
      },
      {
        title: "Privacidad y Datos",
        icon: <Lock size={20} />,
        questions: [
          {
            q: "¿Mis datos son privados?",
            a: "Sí. Usamos prácticas de seguridad estándar de la industria. Tu información se procesa a través de nuestra infraestructura segura y no la compartimos con partes externas."
          },
          {
            q: "¿Dónde se almacenan mis datos?",
            a: "Tus datos se almacenan en servidores seguros de Google Cloud Platform (GCP)."
          },
          {
            q: "¿Cumplen con GDPR / leyes mexicanas de datos?",
            a: "Estamos comprometidos con el cumplimiento de las regulaciones de protección de datos aplicables. Contacta contacto@catalizia.com para requisitos específicos de cumplimiento."
          }
        ]
      },
      {
        title: "Gestión de Equipo",
        icon: <Users size={20} />,
        questions: [
          {
            q: "¿Puedo agregar miembros al equipo?",
            a: "Sí. Los Super Admins pueden invitar nuevos usuarios desde el panel de Gestión de Equipo. Ingresa su correo y asigna un rol."
          },
          {
            q: "¿Qué roles están disponibles?",
            a: "Los roles incluyen: Super Admin (acceso completo), Admin (puede gestionar usuarios), Usuario (acceso estándar), y Visor (solo ver)."
          }
        ]
      },
      {
        title: "Soporte",
        icon: <MessageSquare size={20} />,
        questions: [
          {
            q: "¿Cómo obtengo ayuda?",
            a: "Email contacto@catalizia.com para todas las consultas incluyendo soporte técnico, preguntas de facturación y preguntas generales. Responderemos lo más rápido posible."
          },
          {
            q: "La plataforma no funciona",
            a: "Primero, intenta actualizar tu navegador. Si el problema persiste, contáctanos con detalles y investigaremos."
          }
        ]
      }
    ]
  }
};

export function FAQ({ onClose, lang = 'es', theme }: FAQProps) {
  const c = content[lang || 'es'];
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{c.title}</h3>
            <p className="text-sm text-slate-500">{c.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {c.sections.map((section, sectionIdx) => (
            <section key={sectionIdx} className="space-y-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-900 py-2 -mt-2 z-10">
                <span className="text-blue-600">{section.icon}</span>
                {section.title}
              </h3>
              <div className="grid gap-3">
                {section.questions.map((item, qIdx) => (
                  <details key={qIdx} className="group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors list-none">
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{item.q}</span>
                      <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Zap size={14} className="text-blue-600" /> 
            <span className="hidden sm:inline">SYSTEM: OPERATIONAL</span>
          </div>
          <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            {lang === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}