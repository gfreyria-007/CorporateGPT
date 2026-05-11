
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import ImageEditorModal from './components/ImageEditorModal';

import { FirebaseUser } from '../../lib/firebase';
import { ModelSelector } from '../../components/ModelSelector';
import { ImageModelSelector } from '../../components/ImageModelSelector';
import { ModelMetadata } from '../../types';

import { 
  Role, Grade, ChatMode, ChatMessage, ExplorerSettings, 
  ImageContent, QuizResultContent, Flashcard,
  AspectRatio, ImageSize, ImageStyle, LightingStyle, SearchSource, UserProfile, Badge, Project
} from './types';
import { TOOL_DEFINITIONS, GRADES } from './constants';
import { Sparkles, GraduationCap, Calculator, Image as ImageIcon, Search, LayoutGrid, Zap, Crown, ChevronRight } from 'lucide-react';
import { optimizePromptForImage } from '../../lib/promptOptimizer';
import * as geminiService from './services/geminiService';
import { fileToGenerativePart } from './utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './core/AuthContext';
import { useLanguage } from './core/LanguageContext';
import * as gameAudio from './utils/gameAudio';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-md border border-blue-100 hover:bg-blue-50 transition-all text-xs font-bold"
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className={`text-lg ${language === 'es' ? '' : 'opacity-60'}`}>🇪🇸</span>
      <span className={`text-lg ${language === 'en' ? '' : 'opacity-60'}`}>🇺🇸</span>
      <span className="text-[10px] uppercase text-blue-800">{language}</span>
    </button>
  );
};

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



export const TechieMain: React.FC<{ onSwitchToCorporate?: () => void }> = ({ onSwitchToCorporate }) => {
  const { 
    user: currentUser, 
    profile: userProfile, 
    loading: isAuthLoading, 
    isProfileLoading, 
    isAdmin, 
    login: handleLogin, 
    appleLogin: handleAppleLogin, 
    logout: authLogout,
    updateProfile,
    setProfileData,
    deleteAccount,
    resendVerification,
    setProfile: setUserProfile
  } = useAuth();

  const { language, setLanguage } = useLanguage();
  const isSpanish = language === 'es';

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
  const [useGenZ, setUseGenZ] = useState(true);
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
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [mobileNavTab, setMobileNavTab] = useState<'chat' | 'images' | 'tools' | 'menu'>('chat');
  const [editorImage, setEditorImage] = useState<string | undefined>(undefined);

  // --- Shared Model Selector State (same as CorporateGPT) ---
  const [selectedModel, setSelectedModel] = useState('openrouter/auto');
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [showImageModelSelector, setShowImageModelSelector] = useState(false);
  const [pendingImagePrompt, setPendingImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const isAdminRole = userProfile?.role === 'admin' || userProfile?.role === 'super-admin' || (userProfile as any)?.role === 'owner' || currentUser?.email === 'gfreyria@gmail.com' || currentUser?.email === 'sohernandez@gmail.com';
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

  // Fetch models from same API as CorporateGPT
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) {
          setModels([
            { id: 'openrouter/auto', name: 'Auto Router', description: 'Best available model', pricing: { prompt: '0', completion: '0', request: '0', image: '0' }, context_length: 128000 } as ModelMetadata,
            { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast & capable', pricing: { prompt: '0', completion: '0', request: '0', image: '0' }, context_length: 1000000 } as ModelMetadata,
          ]);
          return;
        }
        const data = await response.json();
        if (data.data) {
          const uniqueModels = Array.from(new Map(data.data.map((m: any) => [m.id, m])).values()) as ModelMetadata[];
          setModels(uniqueModels.sort((a: any, b: any) => b.context_length - a.context_length));
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        setModels([
          { id: 'openrouter/auto', name: 'Auto Router', description: 'Best available model', pricing: { prompt: '0', completion: '0', request: '0', image: '0' }, context_length: 128000 } as ModelMetadata,
        ]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const handleOpenBackpack = () => { closeAllModals(); setShowBackpack(true); };
    const handleOpenArcade = () => { closeAllModals(); setShowArcade(true); };
    const handleOpenMathLab = () => { closeAllModals(); setShowMathLab(true); };
    const handleSetResearcher = () => { closeAllModals(); setChatMode('researcher'); };
    const handleSetQuiz = () => { closeAllModals(); setChatMode('quiz-master'); };
    const handleSetDefault = () => { closeAllModals(); setChatMode('default'); };
    
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


  const greetingSentRef = useRef(false);

  useEffect(() => {
    if (selectedGrade && userName && messages.length === 0 && !greetingSentRef.current) {
      greetingSentRef.current = true;
      // Defer to next tick so handleSendMessage closure is fully bound
      setTimeout(() => handleSendMessage("¡Hola!"), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

   const closeAllModals = () => {
    setShowImageCreationModal(false);
    setShowArcade(false);
    setShowMathLab(false);
    setShowFlashcards(false);
    setShowBackpack(false);
    setShowFAQ(false);
    setShowSettingsModal(false);
    setShowAdminDashboard(false);
    setShowDiagnostics(false);
    setShowImagePopup(false);
    setShowImageEditor(false);
    setShowImageModelSelector(false);
    setShowBadgePopup(false);
    setActiveGame(null);
    setAwardedBadge(null);
  };

  const handleLogout = async () => {
    closeAllModals();
    await authLogout();
  };

  const handleModeChange = (newMode: ChatMode) => {
    // Close any open modals first to prevent overlap
    closeAllModals();

    // We allow re-triggering if it's a modal-based tool
    if (newMode === chatMode && !['arcade', 'image-studio'].includes(newMode)) return;
    
    setChatMode(newMode);
    const tool = TOOL_DEFINITIONS.find(t => t.id === newMode);
    if (tool) {
        const toolTrans = isSpanish ? 
            (newMode === 'default' ? 'Techie Tutor IA' :
             newMode === 'socratic' ? 'Tutor Socrático' :
             newMode === 'math-viva' ? 'Laboratorio de Mate' :
             newMode === 'explorer' ? 'Explorador del Mundo' :
             newMode === 'researcher' ? 'Super Reportes' :
             newMode === 'quiz-master' ? 'Práctica de Exámenes' :
             newMode === 'image-studio' ? 'Estudio de Arte Mágico' :
             newMode === 'arcade' ? 'Zona Arcade' : tool.title) :
            (newMode === 'default' ? 'Techie AI Tutor' :
             newMode === 'socratic' ? 'Socratic Tutor' :
             newMode === 'math-viva' ? 'Math Lab' :
             newMode === 'explorer' ? 'World Explorer' :
             newMode === 'researcher' ? 'Super Reports' :
             newMode === 'quiz-master' ? 'Exam Practice' :
             newMode === 'image-studio' ? 'Magic Art Studio' :
             newMode === 'arcade' ? 'Arcade Zone' : tool.title);
        addMessage(Role.SYSTEM, isSpanish ? `HERRAMIENTA ACTIVADA: ${toolTrans.toUpperCase()}` : `TOOL ACTIVATED: ${toolTrans.toUpperCase()}`);
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
        const toolTitle = TOOL_DEFINITIONS.find(t=>t.id===mode)?.title || (isSpanish ? 'Tutor Socrático' : 'Socratic Tutor');
        const welcomeMsg = isSpanish ? 
            `¡Hola ${name}! Soy tu **${toolTitle}**. ¿En qué puedo ayudarte?` : 
            `Hello ${name}! I am your **${toolTitle}**. How can I help you?`;
        addMessage(Role.MODEL, welcomeMsg);
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

  const handleDeleteData = async () => {
    try {
      await updateProfile({
        badges: [],
        projects: [],
        monthlyCostUsed: 0,
        dailyUsageCount: 0,
        name: null,
        age: null,
        gradeId: null
      });
      setUserName(null);
      setUserAge(0);
      setSelectedGrade(null);
      setMessages([]);
      localStorage.removeItem('techie_grade');
      alert(isSpanish ? 'Tus datos han sido borrados. Techie se reiniciará.' : 'Your data has been deleted. Techie will restart.');
      window.location.reload();
    } catch (e) {
      console.error('Error deleting data:', e);
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
          const noPlanMsg = isSpanish ? 
            '¡Hola! Para continuar aprendiendo con Techie, necesitas activar un Plan Familiar en el Hub de CatalizIA o ingresar tu propia API Key en los ajustes.' : 
            'Hello! To continue learning with Techie, you need to activate a Family Plan at the CatalizIA Hub or enter your own API Key in settings.';
          addMessage(Role.MODEL, noPlanMsg);
          closeAllModals();
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
      
      if (file && isReviewMode) setLoadingText(isSpanish ? "Revisando y evaluando tu tarea..." : "Reviewing and evaluating your homework...");
      else if (file) setLoadingText(isSpanish ? "Observando y analizando la imagen..." : "Observing and analyzing the image...");
      else if (chatMode === 'researcher') setLoadingText(isSpanish ? "Investigando y redactando reporte..." : "Researching and writing report...");
      else if (chatMode === 'quiz-master') setLoadingText(isSpanish ? "Diseñando un examen..." : "Designing an exam...");
      else if (chatMode === 'explorer') setLoadingText(isSpanish ? "Buscando en la web..." : "Searching the web...");
      else setLoadingText(isSpanish ? "Techie está pensando..." : "Techie is thinking...");
      
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
             response = await geminiService.reviewHomework(await fileToGenerativePart(file), text, selectedGrade, userName, userAge, customKey, useGenZ);
          } else if (file) {
             response = await geminiService.analyzeImage(await fileToGenerativePart(file), text, selectedGrade, userName, userAge, history, chatMode, customKey, useGenZ);
          } else if (chatMode === 'researcher' && !isInitialGreeting) {
             response = await geminiService.getDeepResearchResponse(text, selectedGrade, userName, userAge, customKey, useGenZ);
          } else {
             response = await geminiService.getChatResponse(history, selectedGrade, userName, userAge, chatMode, explorerSettings.temperature, explorerSettings.persona, explorerSettings.customSystemInstruction || '', customKey, selectedModel, useGenZ);
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
                       
if (parsed.type === 'image-request') {
                            setLoadingText(isSpanish ? "Investigando para crear imagen..." : "Researching to create image...");
                            
                            // ? Search Grounding: Optimize prompt
                            let finalPrompt = parsed.prompt;
                            try {
                              const idToken = await currentUser?.getIdToken();
                              if (idToken && currentUser?.uid) {
                                finalPrompt = await optimizePromptForImage(parsed.prompt, currentUser.uid, idToken, isSpanish ? 'es' : 'en');
                              }
                            } catch (e) { console.error("[Techie] Research failed:", e); }

                            const imageResult = await geminiService.generateImage(
                               finalPrompt,
                               '16:9' as AspectRatio,
                               selectedGrade,
                               userName || 'Estudiante',
                               'none',
                               'none',
                               undefined,
                               '1K',
                               undefined,
                               getCustomKey()
                           );
                           
                           if (imageResult) {
                               addMessage(Role.MODEL, { 
                                   type: 'image', 
                                   url: imageResult.url, 
                                   prompt: parsed.prompt,
                                   enhancedPrompt: imageResult.enhancedPrompt 
                               }, sources);
                           } else {
                               addMessage(Role.MODEL, { type: 'selection', text: 'No pude crear esa imagen. ¿Qué otra cosa te gustaría ver?', question: '¿Try something else?', options: [] }, sources);
                           }
                       } else {
                           addMessage(Role.MODEL, parsed, sources);
                       }
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
                <h2 className="text-white text-3xl font-black tracking-widest uppercase mb-3 drop-shadow-md">CatalizIA</h2>
                <p className="text-indigo-400 text-[10px] font-black tracking-[0.6em] uppercase">Intelligence for Education</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-40 h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex items-center justify-center mb-10 p-6 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src="/techie-mascot.png" alt="Techie" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
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


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-pattern text-[#1e3a8a] font-sans">


        <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">

        {/* Mobile-only sticky header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-gradient-to-r from-blue-700 to-indigo-700 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white tracking-tight">?? Techie</span>
            <span className="text-[8px] bg-white/20 text-white font-black uppercase px-2 py-0.5 rounded-full tracking-widest backdrop-blur">Tutor IA</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {currentUser?.photoURL && (
              <button onClick={() => setShowSettingsModal(true)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-200 shrink-0">
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
              </button>
            )}
          </div>
        </header>
          {/* Trial banners removed - follows Corporate GPT trial/sub state */}

          {!canUseApp ? (
            <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 custom-scrollbar overflow-y-auto">
                <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-2xl text-center my-8">
                    <div className="text-6xl mb-6">🚀</div>
                    <h2 className="text-4xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">{isSpanish ? 'Desbloquea el Poder de Techie' : 'Unlock Techie\'s Power'}</h2>
                    <p className="text-gray-500 mb-12 text-base leading-relaxed max-w-2xl mx-auto">
                        {isSpanish ? (isBudgetExceeded ? 'Has agotado tu crédito mensual.' : 'Tu acceso premium está inactivo.') : (isBudgetExceeded ? 'You have exhausted your monthly credit.' : 'Your premium access is inactive.')} {isSpanish ? 'Techie Tutor es mucho más que un chat: es un ecosistema completo para potenciar el aprendizaje de tu familia.' : 'Techie Tutor is much more than a chat: it\'s a complete ecosystem to enhance your family\'s learning.'}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                        {[
                            { title: isSpanish ? 'Tutor Socrático' : 'Socratic Tutor', desc: isSpanish ? 'No solo da respuestas, enseña a pensar con IA.' : 'Does not just give answers, teaches to think with AI.', icon: <Sparkles className="text-amber-500" /> },
                            { title: isSpanish ? 'Investigación' : 'Research', desc: isSpanish ? 'Investigación académica profunda en toda la web.' : 'Deep academic research on the web.', icon: <Search className="text-blue-500" /> },
                            { title: isSpanish ? 'Laboratorio de Mate' : 'Math Lab', desc: isSpanish ? 'Resolución visual de problemas paso a paso.' : 'Visual problem-solving step by step.', icon: <Calculator className="text-emerald-500" /> },
                            { title: isSpanish ? 'Taller de Arte' : 'Art Studio', desc: isSpanish ? 'Crea imágenes increíbles para tareas y proyectos.' : 'Create amazing images for homework and projects.', icon: <ImageIcon className="text-purple-500" /> },
                            { title: isSpanish ? 'Desafíos' : 'Challenges', desc: isSpanish ? 'Quizzes gamificados para medir el progreso.' : 'Gamified quizzes to measure progress.', icon: <Crown className="text-yellow-500" /> },
                            { title: isSpanish ? 'Zona Arcade' : 'Arcade Zone', desc: isSpanish ? 'Juegos educativos para aprender divirtiéndose.' : 'Educational games to learn while having fun.', icon: <LayoutGrid className="text-pink-500" /> },
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
                        {/* Redundant logout button removed as it is available in the top selector */}
                    </div>
                </div>
            </div>
          ) : !userName || !selectedGrade ? (
            <UserProfileSetup 
              onProfileSubmit={handleProfileSubmit} 
              initialData={userName ? {name: userName, age: userAge || 0} : undefined} 
              initialGrade={selectedGrade} 
              onOpenAdmin={() => { 
                console.log('Opening Admin from UserProfileSetup'); 
                closeAllModals();
                setShowAdminDashboard(true); 
              }}
            />
          ) : (
            <>
              {/* -- MOBILE: Gamified adventure launcher ---------------- */}
              <div className="lg:hidden flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain">

                {/* XP / Streak hero bar */}
                <div className="mx-4 mt-3 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3 flex items-center gap-3 shadow-lg shadow-blue-500/30">
                  <button onClick={() => { closeAllModals(); setShowBackpack(true); }}
                    className="flex flex-col items-center shrink-0 active:scale-90 transition-transform">
                    <span className="text-[26px] leading-none">??</span>
                    <span className="text-white text-[8px] font-black uppercase tracking-widest leading-none mt-0.5">
                      {userProfile?.badges?.length || 0} logros
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[11px] font-black truncate mb-1">
                      {userName ? `�Hola, ${userName}! ?` : '�Listo para aprender!'}
                    </p>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, ((userProfile?.badges?.length || 0) * 14) % 100 + 5)}%` }} />
                    </div>
                    <p className="text-blue-200 text-[8px] font-bold mt-0.5">
                      {selectedGrade?.name || 'Selecciona tu nivel'}
                    </p>
                  </div>
                  <div className="text-2xl shrink-0">??</div>
                </div>

                {/* Adventure cards OR chat messages */}
                {messages.length > 0 ? (
                  <div className="flex-1 overflow-y-auto">
                    <ChatWindow
                      messages={messages} isLoading={isChatLoading} loadingText={loadingText}
                      onQuizAnswer={(q, o) => o.isCorrect && chatMode === 'default' && handleSendMessage('Siguiente paso?')}
                      onSelection={(t) => handleSendMessage(t)}
                      onImageClick={(u,p)=> { setPopupImage(u); setPopupPrompt(p); setShowImagePopup(true); }}
                      onCreateFlashcards={async (t)=> {
                        const cards = await geminiService.generateFlashcards(t);
                        closeAllModals(); setFlashcards(cards); setShowFlashcards(true);
                      }}
                      onEditImage={(u) => { setImageCreationUrl(u); closeAllModals(); setShowImageCreationModal(true); setShowImagePopup(false); }}
                      onQuizFinished={(res) => addMessage(Role.MODEL, res)}
                      onAwardBadge={handleAwardBadge} onSaveProject={handleSaveProject}
                      grade={selectedGrade || undefined} userName={userName} customKey={getCustomKey()}
                    />
                  </div>
                ) : (
                  <div className="flex-1 px-4 py-2 space-y-3">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] text-center">
                      ? �Qu� aventura eliges hoy?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { emoji:'??', label:'Preguntar', sub:'Tu tutor IA', color:'from-blue-500 to-blue-700', glow:'shadow-blue-500/40',
                          action: () => { handleModeChange('default'); setTimeout(()=>{ (document.querySelector('textarea') as HTMLTextAreaElement)?.focus(); },150); } },
                        { emoji:'??', label:'Crear Arte', sub:'Im�genes m�gicas', color:'from-purple-500 to-pink-600', glow:'shadow-purple-500/40',
                          action: () => { closeAllModals(); setShowImageCreationModal(true); setMobileNavTab('images'); } },
                        { emoji:'??', label:'Mate Lab', sub:'Paso a paso', color:'from-emerald-500 to-teal-600', glow:'shadow-emerald-500/40',
                          action: () => { closeAllModals(); setShowMathLab(true); setMobileNavTab('tools'); } },
                        { emoji:'??', label:'�Arcade!', sub:'Juega y aprende', color:'from-orange-500 to-red-500', glow:'shadow-orange-500/40',
                          action: () => { closeAllModals(); setShowArcade(true); } },
                        { emoji:'?', label:'Desaf�o', sub:'Quiz r�pido', color:'from-yellow-400 to-orange-500', glow:'shadow-yellow-500/40',
                          action: () => { handleModeChange('quiz-master'); setTimeout(()=>{ (document.querySelector('textarea') as HTMLTextAreaElement)?.focus(); },150); } },
                        { emoji:'??', label:'Investigar', sub:'Busca en la web', color:'from-cyan-500 to-blue-500', glow:'shadow-cyan-500/40',
                          action: () => { handleModeChange('researcher'); setTimeout(()=>{ (document.querySelector('textarea') as HTMLTextAreaElement)?.focus(); },150); } },
                      ].map((c,i) => (
                        <button key={i} onClick={c.action}
                          className={`relative bg-gradient-to-br ${c.color} rounded-2xl p-4 text-left shadow-lg ${c.glow} active:scale-95 transition-all duration-150 overflow-hidden`}>
                          <div className="absolute top-0 left-0 right-0 h-px bg-white/30"/>
                          <span className="text-3xl block mb-1.5 drop-shadow">{c.emoji}</span>
                          <p className="text-white font-black text-sm leading-tight">{c.label}</p>
                          <p className="text-white/70 font-bold text-[10px] mt-0.5">{c.sub}</p>
                        </button>
                      ))}
                    </div>
                    {(userProfile?.badges?.length ?? 0) > 0 && (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3">
                        <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-2">?? Tus medallas</p>
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                          {userProfile!.badges.slice(-8).map((b: any, i: number) => (
                            <span key={i} className="text-2xl shrink-0">{b.icon}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile chat input */}
                <div className="shrink-0">
                  <ChatInput onSendMessage={handleSendMessage} onDefaultMode={() => handleModeChange('default')}
                    onModeChange={handleModeChange} chatMode={chatMode} isLoading={isChatLoading}
                    explorerSettings={explorerSettings} onUpdateExplorerSettings={setExplorerSettings}
                    selectedGrade={selectedGrade} onOpenFAQ={() => { closeAllModals(); setShowFAQ(true); }}
                    selectedModel={selectedModel} onModelSelect={setSelectedModel} models={models} isLoadingModels={isLoadingModels}
                  />
                </div>
              </div>

              {/* -- DESKTOP: original layout ---------------------------- */}
              <div className="hidden lg:flex flex-col flex-1 min-h-0">

              {/* Top controls: Model on one compact row */}
              <div className="shrink-0 px-2 sm:px-4 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                  {/* Gen-Z Toggle */}
                  <button
                    onClick={() => setUseGenZ(!useGenZ)}
                    className={`p-2 sm:p-3 rounded-full flex items-center gap-2 transition-all shadow-md active:scale-95 ${useGenZ ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white' : 'bg-white text-blue-900 border border-blue-100'}`}
                    title={isSpanish ? (useGenZ ? 'Modo Divertido Activado' : 'Modo Serio Activado') : (useGenZ ? 'Fun Mode On' : 'Serious Mode On')}
                  >
                    <span className="text-sm">{useGenZ ? '😎' : '👔'}</span>
                    <span className="hidden sm:inline uppercase">{useGenZ ? (isSpanish ? 'Divertido' : 'Fun') : (isSpanish ? 'Serio' : 'Serious')}</span>
                  </button>

                </div>
              </div>

              <div className="flex-1 relative flex flex-col min-h-0 bg-white overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    <ChatWindow 
                      messages={messages} 
                      isLoading={isChatLoading} 
                      loadingText={loadingText} 
                      onQuizAnswer={(q, o) => o.isCorrect && chatMode === 'default' && handleSendMessage(`Siguiente paso?`)} 
                      onSelection={(t) => handleSendMessage(t)} 
                      onImageClick={(u,p)=> { setPopupImage(u); setPopupPrompt(p); setShowImagePopup(true); }} 
                      onCreateFlashcards={async (t)=> { 
                        const cards = await geminiService.generateFlashcards(t); 
                        closeAllModals();
                        setFlashcards(cards); 
                        setShowFlashcards(true); 
                      }} 
                      onEditImage={(u) => { 
                        setImageCreationUrl(u); 
                        closeAllModals();
                        setShowImageCreationModal(true); 
                        setShowImagePopup(false); 
                      }} 
                      onQuizFinished={(res) => addMessage(Role.MODEL, res)} 
                      onAwardBadge={handleAwardBadge} 
                      onSaveProject={handleSaveProject} 
                      grade={selectedGrade || undefined} 
                      userName={userName} 
                      customKey={getCustomKey()} 
                    />
                  </div>
              </div>
              <div className="shrink-0">
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  onDefaultMode={() => handleModeChange('default')} 
                  onModeChange={handleModeChange}
                  chatMode={chatMode} 
                  isLoading={isChatLoading} 
                  explorerSettings={explorerSettings} 
                  onUpdateExplorerSettings={setExplorerSettings} 
                  selectedGrade={selectedGrade} 
                  onOpenFAQ={() => { closeAllModals(); setShowFAQ(true); }}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  models={models}
                  isLoadingModels={isLoadingModels}

                />
                <Footer sessionTokensUsed={sessionTokensUsed} subscriptionLevel={userProfile?.subscriptionLevel} onOpenFAQ={() => { closeAllModals(); setShowFAQ(true); }} />
              </div>

              </div>{/* end desktop-only wrapper */}
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
                    const idToken = await currentUser?.getIdToken();
                    let finalP = p;
                    if (idToken && currentUser?.uid) {
                        finalP = await optimizePromptForImage(p, currentUser.uid, idToken, isSpanish ? 'es' : 'en');
                    }
                    const customKey = getCustomKey();
                    const res = await geminiService.generateImage(finalP, a, selectedGrade, userName, s, l, e, sz, src, customKey); 
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
                    const idToken = await currentUser?.getIdToken();
                    let finalP = p;
                    if (idToken && currentUser?.uid) {
                        finalP = await optimizePromptForImage(p, currentUser.uid, idToken, isSpanish ? 'es' : 'en');
                    }
                    const customKey = getCustomKey();
                    const url = await geminiService.editImage(s, p, selectedGrade, m, style, system, customKey); 
                    if (url) { addMessage(Role.MODEL, { type: 'image', url, prompt: p }); setStudioHistory(prev => [{ type: 'image', url }, ...prev]); } 
                } catch(e: any) { addMessage(Role.MODEL, e.message); }

                setIsStudioLoading(false); 
            }}
            isLoading={isStudioLoading} initialEditFile={imageCreationFile} initialEditUrl={imageCreationUrl} history={studioHistory}
        />
        <ImagePopup isOpen={showImagePopup} imageUrl={popupImage} prompt={popupPrompt} onClose={() => setShowImagePopup(false)} onEdit={(u) => { setEditorImage(u); setShowImageEditor(true); setShowImagePopup(false); }} />
        <ImageEditorModal isOpen={showImageEditor} onClose={() => { setShowImageEditor(false); setEditorImage(undefined); }} initialImage={editorImage} />
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
          <SettingsModal onSwitchToCorporate={onSwitchToCorporate} 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
            userProfile={userProfile} 
            onProfileUpdate={() => {}} 
            onDeleteData={handleDeleteData}
            onOpenFAQ={() => { setShowSettingsModal(false); setShowFAQ(true); }}
            selectedGrade={selectedGrade}
            onGradeChange={(g) => { 
                setSelectedGrade(g); 
                if (g) {
                    localStorage.setItem('techie_grade', g.id);
                    addMessage(Role.SYSTEM, isSpanish ? `Cambiando a nivel: **${g.name}** 🎓` : `Switching to level: **${g.name}** 🎓`);
                }
            }}
            language={language}
            onLanguageChange={(l: any) => {
                setLanguage(l);
                addMessage(Role.SYSTEM, l === 'es' ? 'Cambiando a Español 🇪🇸' : 'Switching to English 🇺🇸');
            }}
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
                  useGenZ={useGenZ}
                />
            )}
        </AnimatePresence>

        {/* Image Model Selector — same as CorporateGPT */}
        <ImageModelSelector 
          isOpen={showImageModelSelector}
          onClose={() => { setShowImageModelSelector(false); setPendingImagePrompt(''); }}
          onSelectModel={async (modelId, prompt) => {
            setShowImageModelSelector(false);
            setIsGeneratingImage(true);
            
            // ?? Prompt Genie: Research and optimize prompt before generating
            let finalPrompt = prompt;
            try {
              const idToken = await currentUser?.getIdToken();
              if (idToken && currentUser?.uid) {
                finalPrompt = await optimizePromptForImage(prompt, currentUser.uid, idToken, isSpanish ? 'es' : 'en');
              }
            } catch (e) {
              console.error("[Techie] Prompt Optimization Failed:", e);
            }

            if (selectedGrade && userName) {
              geminiService.generateImage(finalPrompt, '1:1' as any, selectedGrade, userName, undefined, undefined, undefined, undefined, undefined, getCustomKey())
                .then(res => {
                  if (res) addMessage(Role.MODEL, { type: 'image', url: res.url, prompt });
                })
                .catch(err => addMessage(Role.MODEL, err.message))
                .finally(() => setIsGeneratingImage(false));
            }
          }}
          pendingPrompt={pendingImagePrompt}
          theme="light"
          lang="es"
          isGenerating={isGeneratingImage}
        />

        {/* ── Mobile Bottom Navigation Bar ─────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[900] bg-white border-t border-blue-100 techie-bottom-nav">
          <div className="flex items-stretch h-16">
            {([
              {
                id: 'chat' as const, label: 'Tutor',
                icon: (active: boolean) => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )
              },
              {
                id: 'images' as const, label: 'Arte',
                icon: (active: boolean) => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )
              },
              {
                id: 'tools' as const, label: 'Mate',
                icon: (active: boolean) => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                )
              },
              {
                id: 'menu' as const, label: 'Yo',
                icon: (active: boolean) => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )
              },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setMobileNavTab(tab.id);
                  if (tab.id === 'images') { closeAllModals(); setShowImageCreationModal(true); }
                  else if (tab.id === 'tools') { closeAllModals(); setShowMathLab(true); }
                  else if (tab.id === 'menu') { closeAllModals(); setShowSettingsModal(true); }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all active:scale-95 select-none ${
                  mobileNavTab === tab.id ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {tab.icon(mobileNavTab === tab.id)}
                <span className="text-[9px] font-black uppercase tracking-wide mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

    </div>
  );
};

export default TechieMain;
