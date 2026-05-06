import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    'app.title': 'Techie - Tu Tutor IA',
    'tools.default': 'Techie Tutor IA',
    'tools.socratic': 'Tutor Socrático',
    'tools.math-viva': 'Laboratorio de Mate',
    'tools.explorer': 'Explorador del Mundo',
    'tools.researcher': 'Super Reportes',
    'tools.quiz-master': 'Práctica de Exámenes',
    'tools.image-studio': 'Estudio de Arte Mágico',
    'tools.arcade': 'Zona Arcade',
    'tools.review-homework': 'Revisa tu Tarea',
    'chat.placeholder': 'Escribe tu mensaje...',
    'chat.send': 'Enviar',
    'grade.select': 'Selecciona tu grado',
    'grade.primaria': 'Primaria',
    'grade.secundaria': 'Secundaria',
    'menu.settings': 'Ajustes',
    'menu.profile': 'Perfil',
    'menu.logout': 'Cerrar sesión',
    'error.dailyLimit': 'Has alcanzado tu límite diario',
    'error.budgetExceeded': 'Has agotado tu crédito mensual',
    'loading.thinking': 'Techie está pensando...',
    'loading.generatingImage': 'Creando imagen...',
    'loading.researching': 'Investigando...',
    'image.generated': '¡Imagen creada!',
    'image.error': 'No pude crear esa imagen',
    'sources.consulted': 'Fuentes Consultadas',
    'greeting.hello': '¡Hola!',
    'greeting.welcome': '¡Hola {name}! Soy tu **{tool}**. ¿En qué puedo ayudarte?',
    'paywall.title': 'Desbloquea el Poder de Techie',
    'paywall.description': 'Tu acceso premium está inactivo. Techie Tutor es mucho más que un chat: es un ecosistema completo para potenciar el aprendizaje de tu familia.',
    'guardrails.blocked': 'Contenido no apropiado para {grade}. ¿Qué otro tema te gustaría explorar?',
    'grade.primaria1': '1º Primaria',
    'grade.primaria2': '2º Primaria',
    'grade.primaria3': '3º Primaria',
    'grade.primaria4': '4º Primaria',
    'grade.primaria5': '5º Primaria',
    'grade.primaria6': '6º Primaria',
    'grade.secundaria1': '1º Secundaria',
    'grade.secundaria2': '2º Secundaria',
    'grade.secundaria3': '3º Secundaria',
    'placeholder.default': 'Escribe tu pregunta...',
    'placeholder.explorer': 'Pregunta a internet lo que quieras...',
    'placeholder.researcher': 'Ingresa un tema para investigar...',
    'placeholder.quiz': 'Tema del examen y número de preguntas...',
    'placeholder.review': 'Describe tu duda sobre la tarea...',
    'error.noPlan': '¡Hola! Para continuar aprendiendo con Techie, necesitas activar un Plan Familiar en el Hub de CatalizIA o ingresar tu propia API Key en los ajustes.',
    'tools.desc.default': 'Tu guía súper inteligente que te da pistas para que tú mismo descubras la respuesta.',
    'tools.desc.socratic': '¡No da respuestas! Te hace preguntas para que descubras tú mismo la respuesta.',
    'tools.desc.math-viva': '¡Juega con bloques, pizzas de fracciones y balanzas mágicas para entender los números!',
    'tools.desc.explorer': '¡Pregúntale lo que sea a la gran biblioteca de internet!',
    'tools.desc.researcher': 'Investigación profunda para convertirte en un experto de cualquier tema.',
    'tools.desc.quiz-master': '¡Pon a prueba lo que sabes y prepárate para tus exámenes!',
    'tools.desc.image-studio': '¡Usa tu imaginación y crea dibujos increíbles con IA!',
    'tools.desc.arcade': '¡Tómate un respiro y diviértete con juegos clásicos!',
  },
  en: {
    'app.title': 'Techie - Your AI Tutor',
    'tools.default': 'Techie AI Tutor',
    'tools.socratic': 'Socratic Tutor',
    'tools.math-viva': 'Math Lab',
    'tools.explorer': 'World Explorer',
    'tools.researcher': 'Super Reports',
    'tools.quiz-master': 'Exam Practice',
    'tools.image-studio': 'Magic Art Studio',
    'tools.arcade': 'Arcade Zone',
    'tools.review-homework': 'Check Your Homework',
    'chat.placeholder': 'Type your message...',
    'chat.send': 'Send',
    'grade.select': 'Select your grade',
    'grade.primaria': 'Elementary',
    'grade.secundaria': 'Middle School',
    'menu.settings': 'Settings',
    'menu.profile': 'Profile',
    'menu.logout': 'Log out',
    'error.dailyLimit': 'You have reached your daily limit',
    'error.budgetExceeded': 'You have exhausted your monthly credit',
    'loading.thinking': 'Techie is thinking...',
    'loading.generatingImage': 'Creating image...',
    'loading.researching': 'Researching...',
    'image.generated': 'Image created!',
    'image.error': 'I could not create that image',
    'sources.consulted': 'Sources Consulted',
    'greeting.hello': 'Hello!',
    'greeting.welcome': 'Hello {name}! I am your **{tool}**. How can I help you?',
    'paywall.title': 'Unlock Techie\'s Power',
    'paywall.description': 'Your premium access is inactive. Techie Tutor is much more than a chat: it\'s a complete ecosystem to enhance your family\'s learning.',
    'guardrails.blocked': 'Content not appropriate for {grade}. What other topic would you like to explore?',
    'grade.primaria1': '1st Grade',
    'grade.primaria2': '2nd Grade',
    'grade.primaria3': '3rd Grade',
    'grade.primaria4': '4th Grade',
    'grade.primaria5': '5th Grade',
    'grade.primaria6': '6th Grade',
    'grade.secundaria1': '7th Grade',
    'grade.secundaria2': '8th Grade',
    'grade.secundaria3': '9th Grade',
    'placeholder.default': 'Type your question...',
    'placeholder.explorer': 'Ask the internet anything...',
    'placeholder.researcher': 'Enter a topic to research...',
    'placeholder.quiz': 'Exam topic and number of questions...',
    'placeholder.review': 'Describe your question about the homework...',
    'error.noPlan': 'Hello! To continue learning with Techie, you need to activate a Family Plan at the CatalizIA Hub or enter your own API Key in settings.',
    'tools.desc.default': 'Your super smart guide that gives you hints so you can discover the answer yourself.',
    'tools.desc.socratic': 'Does not give answers! It asks you questions so you discover the answer yourself.',
    'tools.desc.math-viva': 'Play with blocks, fraction pizzas and magic scales to understand numbers!',
    'tools.desc.explorer': 'Ask the great internet library anything!',
    'tools.desc.researcher': 'Deep research to become an expert on any topic.',
    'tools.desc.quiz-master': 'Test what you know and prepare for your exams!',
    'tools.desc.image-studio': 'Use your imagination and create amazing drawings with AI!',
    'tools.desc.arcade': 'Take a break and have fun with classic games!',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('techie-language');
      if (saved === 'es' || saved === 'en') return saved;
    }
    return 'es';
  });

  useEffect(() => {
    localStorage.setItem('techie-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};