
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
import MonthlyQuotaBanner from './components/MonthlyQuotaBanner';

import { FirebaseUser } from '../../lib/firebase';

import { 
  Role, Grade, ChatMode, ChatMessage, ExplorerSettings, 
  ImageContent, QuizResultContent, Flashcard,
  AspectRatio, ImageSize, ImageStyle, LightingStyle, SearchSource, UserProfile, Badge, Project
} from './types';
import { TOOL_DEFINITIONS, GRADES } from './constants';
import { Sparkles, GraduationCap, Calculator, Image as ImageIcon, Search, LayoutGrid, Zap, Crown, ChevronRight } from 'lucide-react';
import * as geminiService from './services/geminiService';
import { fileToGenerativePart } from './utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './core/AuthContext';
import * as gameAudio from './utils/gameAudio';

const BUDGETS = {
    FREE: 50, // Trial users get 50 units
    MAESTRO: 500,
    LEYENDA: 1000,
    FAMILY_STARTER: 1500,
    FAMILY_MEGA: 2500
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

  const isAdminRole = userProfile?.role === 'admin' || userProfile?.role === 'super-admin' || (userProfile as any)?.role === 'owner' || currentUser?.email === 'gfreyria@gmail.com';
  const isSubscribed = ['trial', 'explorador', 'maestro', 'leyenda', 'family_starter', 'family_mega'].includes(userProfile?.subscriptionLevel || '') || isAdminRole;
  const isEmailVerified = true; // Bypassed per user request
  const hasPersonalKey = !!userProfile?.personalApiKey;

  // Maestro/Leyenda users and trial users get to use the system key.
  // Explorador users must use their own key (BYOK).
const canUseSystemKey = (isSubscribed || isAdminRole);
  
  const getMonthlyBudget = () => {
    if (isAdminRole) return Infinity;
    if (userProfile?.subscriptionLevel === 'family_mega') return BUDGETS.FAMILY_MEGA;
    if (userProfile?.subscriptionLevel === 'leyenda') return BUDGETS.LEYENDA;
    if (userProfile?.subscriptionLevel === 'family_starter') return BUDGETS.FAMILY_STARTER;
    if (userProfile?.subscriptionLevel === 'maestro') return BUDGETS.MAESTRO;
    return BUDGETS.FREE;
  };

  const isBudgetExceeded = (userProfile?.monthlyCostUsed || 0) >= getMonthlyBudget();

  const canUseApp = isEmailVerified && (isAdminRole || hasPersonalKey || userProfile?.subscriptionLevel === 'free' || userProfile?.subscriptionLevel === 'explorador' || canUseSystemKey);
  const getCustomKey = () => canUseSystemKey ? undefined : userProfile?.personalApiKey;

  useEffect(() => {
    gameAudio.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const handleOpenBackpack = () => setShowBackpack(true);
    const handleOpenArcade = () => setShowArcade(true);
    const handleOpenMathLab = () => setShowMathLab(true);
    const handleSetResearcher = () => setChatMode('researcher');
    const handleSetQuiz = () => setChatMode('quiz-master');
    const handleSetDefault = () => setChatMode('default');
    
    document.addEventListener('openBackpack', handleOpenBackpack);
    document.addEventListener('openArcade', handleOpenArcade);
    document.addEventListener('openMathLab', handleOpenMathLab);
    document.addEventListener('setResearcherMode', handleSetResearcher);
    document.addEventListener('setQuizMode', handleSetQuiz);
    document.addEventListener('setDefaultMode', handleSetDefault);
    
    return () => {
      document.removeEventListener('openBackpack', handleOpenBackpack);
      document.removeEventListener('openArcade', handleOpenArcade);
      document.removeEventListener('openMathLab', handleOpenMathLab);
      document.removeEventListener('setResearcherMode', handleSetResearcher);
      document.removeEventListener('setQuizMode', handleSetQuiz);
      document.removeEventListener('setDefaultMode', handleSetDefault);
    };
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
          addMessage(Role.MODEL, "¡Hola! Para continuar aprendiendo con Techie, necesitas activar un Plan Familiar en el Hub de CatalizIA o ingresar tu propia API Key en los ajustes.");
          setShowSettingsModal(true);
          return;
      }

      // Check usage limits only if using system key
      if (userProfile.role !== 'admin' && canUseSystemKey) {
          const isOverDailyLimit = userProfile.dailyUsageCount >= userProfile.tokensPerDay;

          // Unified approach: Family plans cover everything. Free users have daily limits.
          if (userProfile.subscriptionLevel === 'free' && isOverDailyLimit) {
              addMessage(Role.MODEL, "¡Ups! Has alcanzado tu límite diario. Vuelve mañana o usa tu propia API Key para acceso ilimitado. 🚀");
              return;
          }

          if (isBudgetExceeded) {
              addMessage(Role.MODEL, {
                type: 'selection',
                text: "¡Atención! Has agotado tu crédito de tokens mensual de tu plan actual.",
                question: "¿Qué te gustaría hacer?",
                options: [
                  { text: "Ver Planes de Mejora", isCorrect: true, feedback: "Redirigiendo al Hub...", action: () => window.location.href = '/' },
                  { text: "Ver Planes de Mejora", isCorrect: true, feedback: "Redirigiendo al Hub...", action: () => window.location.href = '/' }
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
          console.error("[Chat] Error:", error.message);
          
          if (error.message?.includes('budget') || error.message?.includes('quota')) {
            addMessage(Role.MODEL, "Has alcanzado el límite de tu plan actual. Por favor, considera subir de nivel para continuar.");
          } else {
            addMessage(Role.MODEL, "La conexión está tardando más de lo normal. Intenta de nuevo en unos segundos.");
          }
      } finally {
          setIsChatLoading(false);
          setLoadingText(undefined);
      }
  };

  useEffect(() => {
    console.log('Admin Status:', { 
      email: currentUser?.email, 
      role: userProfile?.role, 
      isAdmin: isAdmin,
      showAdmin: showAdminDashboard
    });
  }, [currentUser?.email, userProfile?.role, isAdmin, showAdminDashboard]);

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
                  src="https://catalizia.com/images/logo-white.png" 
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
    <div className="flex flex-col min-h-screen bg-pattern text-[#1e3a8a] font-sans">


        <main className="flex-1 flex flex-col relative">
          {/* Trial banners removed - follows Corporate GPT trial/sub state */}

          {!canUseApp ? (
            <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 custom-scrollbar overflow-y-auto">
                <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-2xl text-center my-8">
                    <div className="text-6xl mb-6">🚀</div>
                    <h2 className="text-4xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">Desbloquea el Poder de Techie</h2>
                    <p className="text-gray-500 mb-12 text-base leading-relaxed max-w-2xl mx-auto">
                        {isBudgetExceeded ? 'Has agotado tu crédito mensual.' : 'Tu acceso premium está inactivo.'} Techie Tutor es mucho más que un chat: es un ecosistema completo para potenciar el aprendizaje de tu familia.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                        {[
                            { title: 'Tutor Socrático', desc: 'No solo da respuestas, enseña a pensar con IA.', icon: <Sparkles className="text-amber-500" /> },
                            { title: 'PhD Research', desc: 'Investigación académica profunda en toda la web.', icon: <Search className="text-blue-500" /> },
                            { title: 'Math Lab', desc: 'Resolución visual de problemas paso a paso.', icon: <Calculator className="text-emerald-500" /> },
                            { title: 'Taller de Arte', desc: 'Crea imágenes increíbles para tareas y proyectos.', icon: <ImageIcon className="text-purple-500" /> },
                            { title: 'Desafíos', desc: 'Quizzes gamificados para medir el progreso.', icon: <Crown className="text-yellow-500" /> },
                            { title: 'Zona Arcade', desc: 'Juegos educativos para aprender divirtiéndose.', icon: <LayoutGrid className="text-pink-500" /> },
                        ].map((f, i) => (
                            <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className="mb-3">{f.icon}</div>
                                <h4 className="font-black text-[#1e3a8a] text-sm uppercase mb-1">{f.title}</h4>
                                <p className="text-[11px] text-gray-500 leading-tight">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        {/* Unified Action */}
                        <div className="p-10 bg-blue-600 rounded-[3rem] text-center relative overflow-hidden group max-w-sm shadow-2xl shadow-blue-600/30">
                            <div className="absolute top-6 right-6 text-[10px] bg-white/20 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest backdrop-blur-md">Recomendado</div>
                            <h4 className="font-black text-white uppercase text-2xl mb-4">Plan Familiar</h4>
                            <p className="text-sm text-blue-100 mb-10 leading-relaxed">
                                Acceso ilimitado a Techie Tutor para **toda tu familia**. Incluido en Family Starter y Family Mega.
                            </p>
                            <div className="space-y-4">
                                <button 
                                  onClick={() => window.location.href = '/?mode=corporate&upgrade=true'}
                                  className="block w-full py-5 bg-white text-blue-600 text-center font-black rounded-[2rem] text-sm uppercase tracking-widest shadow-xl hover:scale-[1.05] transition-all"
                                >
                                  Ver Planes y Precios
                                </button>
                                <button 
                                  onClick={() => window.location.reload()}
                                  className="block w-full py-4 bg-blue-700/50 text-blue-200 text-center font-black rounded-2xl text-[10px] uppercase tracking-widest hover:text-white transition-all"
                                >
                                  ¿Ya pagaste? Sincronizar
                                </button>
                            </div>
                        </div>

                        <div className="max-w-xs text-left">
                            <h5 className="font-black text-[#1e3a8a] uppercase text-xs mb-4 flex items-center gap-2">
                                <Zap size={14} className="text-amber-500" /> Beneficios Premium
                            </h5>
                            <ul className="space-y-3">
                                {[
                                    'Sin límites de conversación diarios',
                                    'Acceso a modelos de IA avanzados',
                                    'Guardado de proyectos y medallas',
                                    'Reportes de aprendizaje semanales'
                                ].map((b, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600">
                                        <ChevronRight size={12} className="text-blue-500 mt-0.5 shrink-0" />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100">
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
              
              {/* Monthly Quota Display */}
              <MonthlyQuotaBanner 
                userProfile={userProfile} 
                monthlyCostUsed={userProfile?.monthlyCostUsed || 0} 
                monthlyBudget={getMonthlyBudget()} 
              />

              <div className="flex-1 relative flex-col bg-white">
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
                if (!selectedGrade || !userName) {
                    addMessage(Role.MODEL, "Por favor completa tu perfil primero.");
                    return;
                }
                setIsStudioLoading(true); 
                try {
                    const customKey = getCustomKey();
                    const res = await geminiService.generateImage(p, a, selectedGrade, userName, s, l, e, sz, src, customKey); 
                    if (res) { addMessage(Role.MODEL, { type: 'image', url: res.url, prompt: p }); setStudioHistory(prev => [{ type: 'image', url: res.url }, ...prev]); } 
                } catch(e: any) { addMessage(Role.MODEL, e.message); }

                setIsStudioLoading(false); 
            }}
            onEdit={async (s, p, m, style, system) => { 
                if (!selectedGrade || !userName) {
                    addMessage(Role.MODEL, "Por favor completa tu perfil primero.");
                    return;
                }
                setIsStudioLoading(true); 
                try {
                    const customKey = getCustomKey();
                    const url = await geminiService.editImage(s, p, selectedGrade, m, style, system, customKey); 
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
            currentUser={currentUser}
            userProfile={userProfile}
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
apiKeyLength: 0,
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
