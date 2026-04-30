import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { callGemini } from '../services/gemini';
import type { PersonaType, UserProgress, AIParams } from '../types/index.ts';
import { translations, Language, TranslationKey } from '../i18n/translations';

interface AppState {
  user: User | null;
  loading: boolean;
  userName: string;
  userAge: number;
  persona: PersonaType;
  geminiKey: string | null;
  language: Language;
  progress: UserProgress;
  setPersona: (p: PersonaType) => void;
  setGeminiKey: (key: string) => Promise<void>;
  setLanguage: (lang: Language) => void;
  setProfile: (name: string, age: number) => Promise<void>;
  updateProgress: (newProgress: Partial<UserProgress>) => Promise<void>;
  callProfessor: (prompt: string, params?: AIParams) => Promise<string>;
  t: (key: TranslationKey, variables?: Record<string, any>) => string;
  guestSignIn: () => Promise<User>;
  speak: (text: string, onStart?: () => void, onEnd?: () => void) => void;
  isSpeaking: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState(8);
  const [persona, setPersona] = useState<PersonaType>('Princess');
  const [geminiKey, setGeminiKeyState] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(localStorage.getItem('APP_LANG') as Language || 'en');
  const [progress, setProgress] = useState<UserProgress>({
    unlockedLevel: 1,
    completedModules: [],
    badges: [],
    energyCores: 0,
    scores: {},
  });

  useEffect(() => {
    let isSettled = false;
    const fallbackTimeout = setTimeout(() => {
      if (!isSettled) {
        console.warn("Firebase Auth timeout — proceeding as guest/unauthenticated.");
        isSettled = true;
        setLoading(false);
      }
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      isSettled = true;
      clearTimeout(fallbackTimeout);
      setUser(user);
      
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          
          // Fast-track the loading state if we have a user
          // but don't block the whole app on Firestore
          const userDocPromise = getDoc(userRef);
          
          const userDoc = await Promise.race([
            userDocPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
          ]) as any;
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProgress(data.progress || progress);
            setUserName(data.profile?.name || '');
            setUserAge(data.profile?.age || 8);
            setGeminiKeyState(data.geminiKey || null);
            if (data.settings) {
              setPersona(data.settings.persona || 'Princess');
              setLanguage(data.settings.language || 'en');
            }
          } else {
            // New user or guest
            await setDoc(userRef, {
              email: user.email || 'guest',
              profile: { name: '', age: 8 },
              settings: { persona: 'Princess', language: 'en' },
              progress: progress,
              geminiKey: null
            });
          }

          onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.progress) setProgress(data.progress);
              if (data.profile?.name) setUserName(data.profile.name);
              if (data.profile?.age) setUserAge(data.profile.age);
              if (data.geminiKey !== undefined) setGeminiKeyState(data.geminiKey);
            }
          });
        }
      } catch (err) {
        console.error("Auth data fetch error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const t = (key: TranslationKey, variables?: Record<string, any>) => {
    let text = translations[language][key] || translations.en[key];
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const setGeminiKey = async (key: string) => {
    if (!user) return;
    setGeminiKeyState(key);
    await setDoc(doc(db, 'users', user.uid), { geminiKey: key }, { merge: true });
  };

  const setProfile = async (name: string, age: number) => {
    setUserName(name);
    setUserAge(age);
    
    // If user is still null, it might be because guestSignIn is in progress
    // We don't want to block the UI, but we do want to eventually save.
    if (!user) {
      console.log("No user yet, profile will be saved once auth is settled.");
      return; 
    }
    
    try {
      await setDoc(doc(db, 'users', user.uid), { 
        profile: { name, age },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const guestSignIn = async () => {
    const { signInAnonymously } = await import('firebase/auth');
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (err) {
      console.error("Guest sign in failed:", err);
      throw err;
    }
  };

  const updateProgress = async (newProgress: Partial<UserProgress>) => {
    if (!user) return;
    const updated = { ...progress, ...newProgress };
    setProgress(updated);
    await setDoc(doc(db, 'users', user.uid), { progress: updated }, { merge: true });
  };

  const callProfessor = async (prompt: string, params: AIParams = {}) => {
    if (!geminiKey) throw new Error(t('unlockBrain'));
    return callGemini(prompt, persona, geminiKey, userName, userAge, { ...params, language });
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('APP_LANG', lang);
    if (user) {
      setDoc(doc(db, 'users', user.uid), { settings: { language: lang } }, { merge: true });
    }
  };



  const speak = (text: string, onStart?: () => void, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
      utterance.rate = 1;
      utterance.pitch = persona === 'Princess' ? 1.2 : 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onStart) onStart();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppContext.Provider value={{
      user, loading, userName, userAge, persona, geminiKey, language, progress,
      setPersona, setGeminiKey, setLanguage: handleSetLanguage, setProfile, updateProgress, callProfessor, t,
      guestSignIn, speak, isSpeaking
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
