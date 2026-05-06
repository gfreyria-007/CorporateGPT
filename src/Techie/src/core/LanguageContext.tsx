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