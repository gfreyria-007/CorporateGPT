
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import GradeSelector from './components/GradeSelector';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import UserProfileSetup from './components/UserProfileSetup';
import ImageCreationModal from './components/ImageCreationModal';
import ImagePopup from './components/ImagePopup';
import FlashcardModal from './components/FlashcardModal';
import AdminDashboard from './components/AdminDashboard';
import SettingsModal from './components/SettingsModal';
import BackpackModal from './components/BackpackModal';
import FAQModal from './components/FAQModal';
import DiagnosticsModal from './components/DiagnosticsModal';
import ArcadeModal from './components/ArcadeModal';
import SnakeGame from './components/SnakeGame';
import TetrisGame from './components/TetrisGame';
import SpaceAliensGame from './components/SpaceAliensGame';
import MathLabModal from './components/MathLabModal';

import { FirebaseUser } from './firebase';

import { 
  Role, Grade, ChatMode, ChatMessage, ExplorerSettings, 
  ImageContent, QuizResultContent, Flashcard,
  AspectRatio, ImageSize, ImageStyle, LightingStyle, SearchSource, UserProfile, Badge, Project
} from './types';
import { TOOL_DEFINITIONS, GRADES } from './constants';
import * as geminiService from './services/geminiService';
import { fileToGenerativePart } from './utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './core/AuthContext';
import * as gameAudio from './utils/gameAudio';

const BUDGETS = {
    FREE: 0,
    MAESTRO: 50,
    LEYENDA: 125
};

const COSTS = {
    FLASH: 0.01,
    PRO: 0.1,
    IMAGE: 0.5,
    RESEARCH: 0.2
};



export const TechieMain: React.FC = () => {
  const { 
    user: currentUser, 
    profile: userProfile, 
    loading: isAuthLoading, 
    isProfileLoading, 
    isAdmin, 
    login: handleLogin, 
    appleLogin: handleAppleLogin, 
    logout: handleLogout,
    updateProfile,
    setProfileData,
    deleteAccount,
    resendVerification,
    setProfile: setUserProfile
  } = useAuth();

  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [userName, setUserName] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const [chatMode, setChatMode] = useState<ChatMode>('default');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const [sessionTokensUsed, setSessionTokensUsed] = useState(0);
  
  const [explorerSettings, setExplorerSettings] = useState<ExplorerSettings>({ temperature: 0.7, persona: null });
  const [studioHistory, setStudioHistory] = useState<ImageContent[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [showImageCreationModal, setShowImageCreationModal] = useState(false);
  const [imageCreationFile, setImageCreationFile] = useState<File | null>(null);
  const [imageCreationUrl, setImageCreationUrl] = useState<string | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [popupPrompt, setPopupPrompt] = useState<string | undefined>(undefined);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [lastBadge, setLastBadge] = useState<Badge | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [lastErrorMsg, setLastErrorMsg] = useState<string | undefined>(undefined);
  const [awardedBadge, setAwardedBadge] = useState<Badge | null>(null);
  const [showArcade, setShowArcade] = useState(false);
  const [activeGame, setActiveGame] = useState<'snake' | 'tetris' | 'aliens' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMathLab, setShowMathLab] = useState(false);

  const isTrialActive = userProfile?.trialExpiresAt ? new Date() < new Date(userProfile.trialExpiresAt) : true;
  const isSubscribed = (userProfile?.subscriptionLevel === 'explorador' || userProfile?.subscriptionLevel === 'maestro' || userProfile?.role === 'admin');
  const isEmailVerified = currentUser?.emailVerified;
  const hasPersonalKey = !!userProfile?.personalApiKey;

  // Maestro/Leyenda users and trial users get to use the system key.
  // Explorador users must use their own key (BYOK).
  const metaEnv = (import.meta as any).env || {};
  const systemKeyExists = !!metaEnv.VITE_GEMINI_API_KEY;
  const canUseSystemKey = (isTrialActive || userProfile?.subscriptionLevel === 'maestro' || userProfile?.subscriptionLevel === 'leyenda' || userProfile?.role === 'admin') && systemKeyExists;
  
  const getMonthlyBudget = () => {
    if (userProfile?.role === 'admin') return Infinity;
    if (userProfile?.subscriptionLevel === 'leyenda') return BUDGETS.LEYENDA;
    if (userProfile?.subscriptionLevel === 'maestro') return BUDGETS.MAESTRO;
    return BUDGETS.FREE;
  };

  const isBudgetExceeded = (userProfile?.monthlyCostUsed || 0) >= getMonthlyBudget();

  const canUseApp = isEmailVerified && (canUseSystemKey ? !isBudgetExceeded : hasPersonalKey);
  const getCustomKey = () => canUseSystemKey ? undefined : userProfile?.personalApiKey;

  useEffect(() => {
    gameAudio.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const handleOpenBackpack = () => setShowBackpack(true);
    document.addEventListener('openBackpack', handleOpenBackpack);
    return () => document.removeEventListener('openBackpack', handleOpenBackpack);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.name || null);
      if (userProfile.age) setUserAge(userProfile.age);
      if (userProfile.gradeId) {
        const savedGrade = GRADES.find(g => g.id === userProfile.gradeId);
        if (savedGrade) setSelectedGrade(savedGrade);
      }
    }
  }, [userProfile]);


  useEffect(() => {
    if (selectedGrade && userName && messages.length === 0) {
      handleSendMessage("¡Hola!");
    }
  }, [selectedGrade, userName]);

  const getSimplifiedHistory = (msgs: ChatMessage[]) => {
    return msgs
      .filter(m => m.role !== Role.SYSTEM)
      .slice(-20) 
      .map(m => ({
          role: m.role === Role.MODEL ? 'model' : 'user',
          parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
      }));
  };

  const handleModeChange = (newMode: ChatMode) => {
    // We allow re-triggering if it's a modal-based tool
    if (newMode === chatMode && !['arcade', 'image-studio'].includes(newMode)) return;
    
    setChatMode(newMode);
    const tool = TOOL_DEFINITIONS.find(t => t.id === newMode);
    if (tool) {
        addMessage(Role.SYSTEM, `HERRAMIENTA ACTIVADA: ${tool.title.toUpperCase()}`);
    }

    if (newMode === 'image-studio') {
        setShowImageCreationModal(true);
    }

    if (newMode === 'arcade') {
        setShowArcade(true);
    }

    // Auto-trigger for interactive tools
    if (['quiz-master'].includes(newMode)) {
        let silentPrompt = "¡Actívate!";
        if (newMode === 'quiz-master') silentPrompt = "¡Hola! Quiero tomar un examen sobre un tema interesante.";
        
        handleSendMessage(silentPrompt, undefined, false, 5, newMode);
    }
  };

  const handleProfileSubmit = async (name: string, age: number, grade: Grade, mode: ChatMode, parentalConsent?: boolean) => {
    setUserName(name); setUserAge(age); setSelectedGrade(grade); setChatMode(mode);
    
    // Persist to Firestore
    if (currentUser?.uid) {
      try {
        const updateData: any = {
          name,
          age,
          gradeId: grade.id
        };

        if ((userProfile?.subscriptionLevel === 'explorador') && userProfile.personalApiKey) {
          updateData.personalApiKey = userProfile.personalApiKey;
        }

        if (age < 18 && parentalConsent) {
          updateData.parentalConsent = true;
          updateData.parentalConsentDate = new Date().toISOString();
        }

        await setProfileData(updateData);
      } catch (error) {
        console.error('Error saving profile data:', error);
      }
    }

    if (mode === 'image-studio') setShowImageCreationModal(true);
    else {
        const toolTitle = TOOL_DEFINITIONS.find(t=>t.id===mode)?.title || "Tutor Socrático";
        addMessage(Role.MODEL, `¡Hola ${name}! Soy tu **${toolTitle}**. ¿En qué puedo ayudarte?`);
    }
  };

  const handleResetProfile = () => {
    setUserName(null); setUserAge(null); setSelectedGrade(null); setMessages([]);
    setChatMode('default');
  };

  const addMessage = (role: Role, content: any, sources?: SearchSource[]) => {
      setMessages(prev => [...prev, { role, content, timestamp: Date.now(), sources }]);
  };

  const handleAwardBadge = async (badgeId: string, badgeName: string, badgeDescription: string, icon: string) => {
      if (!userProfile || !currentUser) return;
      const existingBadge = userProfile.badges?.find(b => b.id === badgeId);
      if (existingBadge) return; // Already earned

      const newBadge: Badge = { id: badgeId, name: badgeName, description: badgeDescription, icon, earnedAt: Date.now() };
      const updatedBadges = [...(userProfile.badges || []), newBadge];

      try {
          await updateProfile({ badges: updatedBadges });
          addMessage(Role.SYSTEM, `¡Felicidades! Has ganado una nueva medalla para tu mochila: **${badgeName}** ${icon}`);
          setAwardedBadge(newBadge);
          setTimeout(() => setAwardedBadge(null), 5000); // Hide after 5 seconds
          // setShowBackpack(true); // Maybe don't open it automatically to not disrupt flow, just show popup
      } catch (e) { 
          console.error('Error awarding badge:', e);
      }
  };

  const handleSaveProject = async (type: 'image' | 'report' | 'certificate', title: string, url?: string, content?: string) => {
      if (!userProfile || !currentUser) return;
      
      const newProject: Project = {
          id: `proj_${Date.now()}`,
          type,
          title,
          url,
          content,
          timestamp: Date.now()
      };

      const updatedProjects = [...(userProfile.projects || []), newProject];

      try {
          await updateProfile({ projects: updatedProjects });
          addMessage(Role.SYSTEM, `¡Proyecto guardado! Ahora puedes verlo en tu mochila: **${title}** 🎨`);
      } catch (e) {
          console.error('Error saving project:', e);
          alert("Error al guardar el proyecto.");
      }
  };

  const handleSendMessage = async (text: string, file?: File, isReviewMode?: boolean, quizCount?: number, modeOverride?: ChatMode) => {
      if (!selectedGrade || !userProfile) return;

      const isBYOKMode = !canUseSystemKey;
      const personalApiKey = userProfile.personalApiKey;

      if (isBYOKMode && !personalApiKey) {
          addMessage(Role.MODEL, "¡Hola! Tu periodo de prueba ha terminado. Por favor, ingresa tu API Key de Gemini en tu perfil (BYOK) o suscríbete para continuar.");
          setShowSettingsModal(true);
          return;
      }

      // Check usage limits only if using system key
      if (userProfile.role !== 'admin' && canUseSystemKey) {
          const isOverDailyLimit = userProfile.dailyUsageCount >= userProfile.tokensPerDay;

          if (userProfile.subscriptionLevel === 'free' && isOverDailyLimit && !isTrialActive) {
              addMessage(Role.MODEL, "¡Ups! Has alcanzado tu límite diario. Vuelve mañana o usa tu propia API Key para acceso ilimitado. 🚀");
              return;
          }

          if (isBudgetExceeded && !isTrialActive) {
              addMessage(Role.MODEL, {
                type: 'selection',
                text: "¡Atención! Has agotado tu crédito de tokens mensual de tu plan actual.",
                question: "¿Qué te gustaría hacer?",
                options: [
                  { text: "Ver Planes de Mejora", isCorrect: true, feedback: "Redirigiendo al Hub...", action: () => window.location.href = '/' },
                  { text: "Configurar mi propia llave", isCorrect: false, feedback: "Abriendo ajustes...", action: () => setShowSettingsModal(true) }
                ]
              });
              return;
          }
      }




      // Special handling for image studio mode with file attachment
      if (chatMode === 'image-studio' && file) {
          setImageCreationFile(file);
          setShowImageCreationModal(true);
          return;
      }

      const isInitialGreeting = text === "¡Hola!";

      if (!isInitialGreeting) {
          if (file) {
              const reader = new FileReader();
              reader.onload = (e) => addMessage(Role.USER, { type: 'image', url: e.target?.result as string, prompt: text || 'Imagen' });
              reader.readAsDataURL(file);
          } else addMessage(Role.USER, text);
      }

      setIsChatLoading(true);
      
      if (file && isReviewMode) setLoadingText("Revisando y evaluando tu tarea...");
      else if (file) setLoadingText("Observando y analizando la imagen...");
      else if (chatMode === 'researcher') setLoadingText("Investigando y redactando reporte...");
      else if (chatMode === 'quiz-master') setLoadingText("Diseñando un examen...");
      else if (chatMode === 'explorer') setLoadingText("Buscando en la web...");
      else setLoadingText("Techie está pensando...");
      
      try {
          let response: any;
          const history = getSimplifiedHistory([...messages, { role: Role.USER, content: text, timestamp: Date.now() }]);
          const customKey = getCustomKey();

          if (chatMode === 'quiz-master' && !isInitialGreeting) {
              const quizQuestions = await geminiService.generateTopicQuiz(text, selectedGrade, quizCount || 5, customKey);
              addMessage(Role.MODEL, { type: 'full-quiz', topic: text, questions: quizQuestions });
              setIsChatLoading(false); return;
          }

          if (isReviewMode && file) {
             response = await geminiService.reviewHomework(await fileToGenerativePart(file), text, selectedGrade, userName, userAge, customKey);
          } else if (file) {
             response = await geminiService.analyzeImage(await fileToGenerativePart(file), text, selectedGrade, userName, userAge, history, chatMode, customKey);
          } else if (chatMode === 'researcher' && !isInitialGreeting) {
             response = await geminiService.getDeepResearchResponse(text, selectedGrade, userName, userAge, customKey);
          } else {
             response = await geminiService.getChatResponse(history, selectedGrade, userName, userAge, chatMode, explorerSettings.temperature, explorerSettings.persona, explorerSettings.customSystemInstruction || '', customKey);
          }


          if (response && response.text) {
              const sources: SearchSource[] = [];
              const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
              if (chunks) {
                  chunks.forEach((chunk: any) => {
                      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                  });
              }

              if (chatMode === 'researcher' && !isInitialGreeting) {
                  addMessage(Role.MODEL, { type: 'deep-research', topic: text, markdownReport: response.text }, sources);
              } else {
                  try {
                      const parsed = JSON.parse(geminiService.cleanJsonString(response.text));
                      addMessage(Role.MODEL, parsed, sources);
                  } catch (e) {
                      addMessage(Role.MODEL, response.text, sources);
                  }
              }

              // Update usage count and cost only for system key users
              if (!isInitialGreeting && userProfile.uid && !isBYOKMode) {
                  const isOverDailyLimit = userProfile.dailyUsageCount >= userProfile.tokensPerDay;
                  
                  const newCount = userProfile.dailyUsageCount + 1;
                  let newMonthlyCost = userProfile.monthlyCostUsed || 0;

                  if (isOverDailyLimit) {
                      let addedCost = COSTS.FLASH;
                      if (chatMode === 'researcher') addedCost = COSTS.RESEARCH;
                      else if (chatMode === 'image-studio') addedCost = COSTS.IMAGE;
                      newMonthlyCost += addedCost;
                  }

                  await updateProfile({
                      dailyUsageCount: newCount,
                      monthlyCostUsed: newMonthlyCost
                  });
              }



          }
      } catch (error: any) {
          console.error("Critical Chat Error:", error);
          setLastErrorMsg(error.message);
          
          if (error.message?.includes('API key is missing')) {
            addMessage(Role.MODEL, {
                type: 'selection',
                text: "¡Ups! Parece que falta la llave maestra para conectar con mi cerebro (API Key).",
                question: "¿Quieres configurar tu propia llave gratuita ahora?",
                options: [
                    { text: "Sí, configurar llave", isCorrect: true, feedback: "¡Excelente! Se abrirá el panel de ajustes.", action: () => setShowSettingsModal(true) }
                ]
            });
          } else {
            addMessage(Role.MODEL, `Hubo un problema al conectar con la biblioteca (${error.message || 'Error Desconocido'}). Inténtalo de nuevo.`);
          }
      } finally {
          setIsChatLoading(false);
          setLoadingText(undefined);
      }
  };

  console.log('Admin Status:', { 
    email: currentUser?.email, 
    role: userProfile?.role, 
    isAdmin: userProfile?.role === 'admin' || currentUser?.email === 'gfreyria@gmail.com',
    showAdmin: showAdminDashboard 
  });

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="h-screen w-screen bg-[#1e3a8a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-white rounded-full animate-spin"></div>
          <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Cargando Techie...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && !userProfile) {
    return (
      <div className="h-screen w-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
        {/* Animated Background Accents */}
        <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-12 flex flex-col items-center"
            >
                <img 
                  src="https://catalizia.com/wp-content/uploads/2024/05/cropped-CatalizIA-logo-horizontal-sin-dot-com-scaled-1-313x100.png" 
                  alt="Catalizia" 
                  className="h-12 w-auto object-contain mb-3 brightness-0 invert opacity-90"
                />
                <p className="text-indigo-400 text-[10px] font-black tracking-[0.6em] uppercase">Intelligence for Education</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-40 h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex items-center justify-center mb-10 p-6 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src="https://catalizia.com/images/catalizia-techie.png" alt="Techie" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter font-display"
            >
              Techie <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Tutor</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-slate-400 mb-12 text-lg font-medium leading-relaxed max-w-sm"
            >
              Your personal AI-powered learning assistant for the digital age.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col gap-5 w-full max-w-xs"
            >
              <button 
                onClick={handleLogin}
                className="w-full bg-white text-slate-900 px-8 py-5 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-4 group"
              >
                <div className="bg-white p-1 rounded-full shadow-md group-hover:scale-110 transition-transform">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-7 h-7" alt="Google" />
                </div>
                <span className="text-sm">Enter with Google</span>
              </button>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]"
            >
              © 2026 CatalizIA Education
            </motion.p>
        </div>
      </div>
    );
  }

  const handleDeleteData = async () => {
      try {
          await deleteAccount();
      } catch (error) {
          alert("Hubo un error al borrar tus datos. Por favor contacta a soporte.");
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pattern text-[#1e3a8a] font-sans pt-20 sm:pt-24 md:pt-28">
        <Header 
          onResetProfile={handleResetProfile} 
          onIncreaseFont={() => setFontScale(p => Math.min(p+0.1, 1.3))} 
          onDecreaseFont={() => setFontScale(p => Math.max(p-0.1, 0.7))}
          canIncrease={fontScale < 1.3}
          canDecrease={fontScale > 0.7}
          onOpenAdmin={() => setShowAdminDashboard(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenFAQ={() => setShowFAQ(true)}
          onOpenArcade={() => setShowArcade(true)}
          onOpenMathLab={() => setShowMathLab(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
        />


        <main className="flex-1 flex flex-col relative">
          {userProfile && !isSubscribed && isTrialActive && (
            <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-2 text-center shadow-lg z-[60] flex items-center justify-center gap-2">
              <span>🌟 Periodo de prueba: 1 semana de acceso premium gratis</span>
              <span className="opacity-60 hidden sm:inline">•</span>
              <span className="opacity-80">Expira: {new Date(userProfile.trialExpiresAt!).toLocaleDateString()}</span>
            </div>
          )}
          {userProfile && !isSubscribed && !isTrialActive && (
            <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-2 text-center shadow-lg z-[60] flex items-center justify-center gap-2">
              <span>🚨 Tu prueba ha terminado. Configura tu propia llave para seguir.</span>
              <button onClick={() => setShowSettingsModal(true)} className="bg-white text-red-600 px-3 py-0.5 rounded-full hover:bg-red-50 transition-colors">Configurar</button>
            </div>
          )}

          {!isEmailVerified ? (
            <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
                <div className="bg-white border border-gray-100 rounded-[3rem] p-12 max-w-md w-full shadow-2xl text-center">
                    <div className="text-6xl mb-6">📧</div>
                    <h2 className="text-3xl font-black text-[#1e3a8a] mb-4 uppercase tracking-tight">Verifica tu Email</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Para evitar el spam y proteger la comunidad, necesitamos que confirmes tu correo electrónico. 
                        Revisa tu bandeja de entrada (y la carpeta de spam).
                    </p>
                    <div className="space-y-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full py-5 bg-[#1e3a8a] text-white font-black rounded-[2rem] shadow-xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Ya lo verifiqué ✅
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    await resendVerification();
                                    alert("¡Correo enviado! Revisa tu bandeja de entrada.");
                                } catch (e) {
                                    alert("Hubo un error al enviar el correo. Intenta de nuevo más tarde.");
                                }
                            }}
                            className="w-full py-4 bg-white border-2 border-gray-100 text-[#1e3a8a] font-black rounded-[2rem] hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                        >
                            Reenviar Email de Confirmación
                        </button>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
          ) : !canUseApp ? (
            <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
                <div className="bg-white border border-gray-100 rounded-[3rem] p-8 max-w-2xl w-full shadow-2xl text-center">
                    <div className="text-6xl mb-6">🚀</div>
                    <h2 className="text-3xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">Potencia tu Aprendizaje</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        {isBudgetExceeded ? 'Has agotado tu crédito mensual.' : 'Tu prueba gratuita ha terminado.'} Elige cómo quieres seguir explorando:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Maestro */}
                        <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 text-left relative overflow-hidden group">
                            <h4 className="font-black text-[#1e3a8a] uppercase text-[10px] mb-1">Maestro</h4>
                            <p className="text-[8px] text-gray-500 mb-3">Tokens incluidos (50 MXN).</p>
                            <div className="mt-auto">
                                <span className="block font-black text-blue-700 text-xs mb-2">$100 <span className="text-[8px]">MXN/mes</span></span>
                                <a href="https://buy.stripe.com/test_maestro" className="block w-full py-2 bg-blue-600 text-white text-center font-black rounded-xl text-[8px] uppercase tracking-widest">Elegir</a>
                            </div>
                        </div>
                        {/* Leyenda */}
                        <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100 text-left relative overflow-hidden group">
                            <div className="absolute top-2 right-2 text-[8px] bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-black">TOP</div>
                            <h4 className="font-black text-purple-800 uppercase text-[10px] mb-1">Leyenda</h4>
                            <p className="text-[8px] text-gray-500 mb-3">Máximo crédito (125 MXN).</p>
                            <div className="mt-auto">
                                <span className="block font-black text-purple-700 text-xs mb-2">$200 <span className="text-[8px]">MXN/mes</span></span>
                                <a href="https://buy.stripe.com/test_leyenda" className="block w-full py-2 bg-purple-600 text-white text-center font-black rounded-xl text-[8px] uppercase tracking-widest">Elegir</a>
                            </div>
                        </div>
                        {/* Explorador */}
                        <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 text-left">
                            <h4 className="font-black text-indigo-800 uppercase text-[10px] mb-1">Explorador</h4>
                            <p className="text-[8px] text-gray-500 mb-3">Bring Your Own Key (BYOK).</p>
                            <div className="mt-auto">
                                <span className="block font-black text-indigo-700 text-xs mb-2">$50 <span className="text-[8px]">MXN/mes</span></span>
                                <a href="https://buy.stripe.com/test_explorador" className="block w-full py-2 bg-indigo-600 text-white text-center font-black rounded-xl text-[8px] uppercase tracking-widest">Elegir</a>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button 
                            onClick={() => setShowSettingsModal(true)}
                            className="w-full py-3 bg-white border-2 border-gray-200 text-[#1e3a8a] font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Ya tengo mi llave (Configurar)
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
          ) : !userName || !selectedGrade ? (
            <UserProfileSetup 
              onProfileSubmit={handleProfileSubmit} 
              initialData={userName ? {name: userName, age: userAge || 0} : undefined} 
              initialGrade={selectedGrade} 
              onOpenAdmin={() => { console.log('Opening Admin from UserProfileSetup'); setShowAdminDashboard(true); }}
            />
          ) : (
            <>
              <GradeSelector selectedGrade={selectedGrade} activeTool={TOOL_DEFINITIONS.find(t => t.id === chatMode)} onGradeChange={setSelectedGrade} />
              

              <div className="flex-1 relative flex flex-col bg-white">
                  <ChatWindow messages={messages} isLoading={isChatLoading} loadingText={loadingText} onQuizAnswer={(q, o) => o.isCorrect && chatMode === 'default' && handleSendMessage(`Siguiente paso?`)} onSelection={(t) => handleSendMessage(t)} onImageClick={(u,p)=> { setPopupImage(u); setPopupPrompt(p); setShowImagePopup(true); }} onCreateFlashcards={async (t)=> { const cards = await geminiService.generateFlashcards(t); setFlashcards(cards); setShowFlashcards(true); }} onEditImage={(u) => { setImageCreationUrl(u); setShowImageCreationModal(true); setShowImagePopup(false); }} onQuizFinished={(res) => addMessage(Role.MODEL, res)} onAwardBadge={handleAwardBadge} onSaveProject={handleSaveProject} grade={selectedGrade || undefined} userName={userName} customKey={getCustomKey()} />
              </div>
              <ChatInput 
                onSendMessage={handleSendMessage} 
                onDefaultMode={() => handleModeChange('default')} 
                onModeChange={handleModeChange}
                chatMode={chatMode} 
                isLoading={isChatLoading} 
                explorerSettings={explorerSettings} 
                onUpdateExplorerSettings={setExplorerSettings} 
                selectedGrade={selectedGrade} 
                onOpenFAQ={() => setShowFAQ(true)}
              />
              <Footer sessionTokensUsed={sessionTokensUsed} subscriptionLevel={userProfile?.subscriptionLevel} onOpenFAQ={() => setShowFAQ(true)} />

            </>
          )}
        </main>
        
        <ImageCreationModal 
            isOpen={showImageCreationModal} 
            onClose={() => { setShowImageCreationModal(false); if(chatMode === 'image-studio') setChatMode('default'); setImageCreationFile(null); setImageCreationUrl(null); }}
            onGenerate={async (p, a, s, l, e, sz, src) => { 
                setIsStudioLoading(true); 
                try {
                    const customKey = getCustomKey();
                    const res = await geminiService.generateImage(p, a, selectedGrade!, userName!, s, l, e, sz, src, customKey); 
                    if (res) { addMessage(Role.MODEL, { type: 'image', url: res.url, prompt: p }); setStudioHistory(prev => [{ type: 'image', url: res.url }, ...prev]); } 
                } catch(e: any) { addMessage(Role.MODEL, e.message); }

                setIsStudioLoading(false); 
            }}
            onEdit={async (s, p, m, style, system) => { 
                setIsStudioLoading(true); 
                try {
                    const customKey = getCustomKey();
                    const url = await geminiService.editImage(s, p, selectedGrade!, m, style, system, customKey); 
                    if (url) { addMessage(Role.MODEL, { type: 'image', url, prompt: p }); setStudioHistory(prev => [{ type: 'image', url }, ...prev]); } 
                } catch(e: any) { addMessage(Role.MODEL, e.message); }

                setIsStudioLoading(false); 
            }}
            isLoading={isStudioLoading} initialEditFile={imageCreationFile} initialEditUrl={imageCreationUrl} history={studioHistory}
        />
        <ImagePopup isOpen={showImagePopup} imageUrl={popupImage} prompt={popupPrompt} onClose={() => setShowImagePopup(false)} onEdit={(u) => { setImageCreationUrl(u); setShowImageCreationModal(true); setShowImagePopup(false); }} />
        <FlashcardModal isOpen={showFlashcards} cards={flashcards} onClose={() => setShowFlashcards(false)} />
        <BackpackModal 
          isOpen={showBackpack} 
          onClose={() => setShowBackpack(false)} 
          badges={userProfile?.badges || []} 
          projects={userProfile?.projects || []}
        />
        <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
        
        <ArcadeModal 
          isOpen={showArcade} 
          onClose={() => { setShowArcade(false); if(chatMode === 'arcade') setChatMode('default'); }} 
          onSelectGame={(game) => { setActiveGame(game); setShowArcade(false); }} 
        />

        {activeGame === 'snake' && <SnakeGame onClose={() => setActiveGame(null)} onAwardBadge={handleAwardBadge} />}
        {activeGame === 'tetris' && <TetrisGame onClose={() => setActiveGame(null)} onAwardBadge={handleAwardBadge} />}
        {activeGame === 'aliens' && <SpaceAliensGame onClose={() => setActiveGame(null)} onAwardBadge={handleAwardBadge} />}
        
        {showAdminDashboard && (
          <AdminDashboard 
            onClose={() => setShowAdminDashboard(false)} 
            onOpenDiagnostics={() => setShowDiagnostics(true)}
          />
        )}
        {userProfile && (
          <SettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
            userProfile={userProfile} 
            onProfileUpdate={(updated) => setUserProfile(updated)} 
            onDeleteData={handleDeleteData}
            onOpenFAQ={() => { setShowSettingsModal(false); setShowFAQ(true); }}
          />
        )}

        <AnimatePresence>
          {awardedBadge && (
            <motion.div 
              initial={{ y: 200, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 200, opacity: 0, scale: 0.5 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent,rgba(255,215,0,0.3),transparent)] rounded-full"
              />
              <div className="bg-white rounded-[3rem] shadow-[0_0_50px_rgba(255,191,0,0.5)] p-12 border-4 border-yellow-400 flex flex-col items-center gap-4 max-w-sm text-center relative overflow-hidden">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-8xl mb-2 drop-shadow-2xl"
                >
                    {awardedBadge.icon}
                </motion.div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tighter">¡NUEVO LOGRO!</h3>
                    <p className="text-lg font-black text-amber-600 uppercase tracking-widest">{awardedBadge.name}</p>
                    <p className="text-sm font-bold text-gray-500">{awardedBadge.description}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  {["✨", "🌟", "🎉", "🔥", "🚀"].map((e, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, rotate: [0, 20, -20, 0] }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 1, repeat: Infinity }}
                      className="text-2xl"
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
                <button 
                    onClick={() => setAwardedBadge(null)}
                    className="mt-6 px-8 py-3 bg-blue-900 text-white rounded-full font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-transform"
                >
                    ¡Genial! 🎒
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <DiagnosticsModal 
            isOpen={showDiagnostics}
            onClose={() => setShowDiagnostics(false)}
            systemInfo={{
                apiKeyLength: (metaEnv.VITE_GEMINI_API_KEY || '').length,
                userRole: userProfile?.role || 'user',
                subscription: userProfile?.subscriptionLevel || 'free',
                lastError: lastErrorMsg,
                browser: navigator.userAgent.split(' ').pop() || 'Unknown',
                firebaseInitialized: true
            }}
        />

        <AnimatePresence>
            {showMathLab && (
                <MathLabModal 
                  onClose={() => setShowMathLab(false)} 
                  grade={selectedGrade || { id: 'primaria1', name: '1ro de Primaria' } as any}
                />
            )}
        </AnimatePresence>
    </div>
  );
};

export default TechieMain;
