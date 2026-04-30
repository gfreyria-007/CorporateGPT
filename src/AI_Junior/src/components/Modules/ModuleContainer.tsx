import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Module } from '../../data/curriculum';
import { ArrowLeft, Sparkles, Volume2, HelpCircle, Terminal, Cpu, Info } from 'lucide-react';
import { callGemini } from '../../services/gemini';

interface ModuleContainerProps {
  module: Module;
  onClose: () => void;
  children: React.ReactNode;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ module, onClose, children }) => {
  const { persona, geminiKey, language, t, userName, userAge, speak, isSpeaking } = useApp();
  const [professorSpeech, setProfessorSpeech] = useState<string>(module.description);
  const [isAsking, setIsAsking] = useState(false);

  const askProfessor = async () => {
    if (!geminiKey) {
      setProfessorSpeech(language === 'es' ? 'Falta conectar tu llave API de Google Gemini en la Configuración para Padres. Sin ella, no puedo pensar en vivo.' : 'Please connect your Google Gemini API key in the Parent Settings. Without it, I cannot think live.');
      return;
    }
    setIsAsking(true);
    try {
      const resp = await callGemini(
        `Explain the module "${module.title}" and the concept of "${module.concept}" to me like I'm ${userAge} years old. 
        Adopt a "Pro Architect Mentor" tone. Use youthful, cool language but provide deep, diploma-level technical logic. 
        Make me feel like I'm learning the secrets of the pros. Be extremely engaging and clear.`,
        persona,
        geminiKey,
        userName,
        userAge,
        { language }
      );
      setProfessorSpeech(resp);
      speak(resp);
    } catch (e) {
      setProfessorSpeech(language === 'es' ? 'Hubo un error al procesar la información. Verifica que tu llave API sea válida en la Configuración.' : 'There was an error processing the data. Please check if your API key is valid in Settings.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <motion.div 
      className="module-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cinematic HUD Background */}
      <div className="hud-overlay" />
      
      <header className="mission-header">
        <button onClick={onClose} className="mission-back">
          <ArrowLeft size={18} /> {t('backToMap')}
        </button>
        
        <div className="mission-title-area">
          <div className="mission-badge">MISSION {module.id}</div>
          <h2>{module.title}</h2>
        </div>

        <div className="mission-nav">
          <div className="nav-item">
            <Cpu size={16} />
            <span>SYS: ONLINE</span>
          </div>
          <div className="nav-item">
            <Terminal size={16} />
            <span>LAB: READY</span>
          </div>
        </div>
      </header>

      <div className="mission-layout">
        {/* Professor Command Center */}
        <aside className="command-center">
          <div className="professor-pod">
            <div className={`avatar-frame ${isSpeaking ? 'speaking' : ''}`}>
              <div className="avatar-content">
                {persona === 'Princess' ? '👸' : persona === 'StarStriker' ? '⚽' : '🧪'}
              </div>
              <div className="scan-line" />
            </div>
            
            <div className="comms-window">
              <div className="comms-header">
                <span className="dot" />
                <span>COMMS: {persona.toUpperCase()}</span>
                <Volume2 
                  size={14} 
                  className={`speaker-icon ${isSpeaking ? 'active' : ''}`} 
                  onClick={() => speak(professorSpeech)}
                />
              </div>
              <div className="comms-body">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={professorSpeech}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {professorSpeech}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="comms-footer">
                <button 
                  className={`ask-trigger ${isAsking ? 'loading' : ''}`}
                  onClick={askProfessor}
                >
                  <HelpCircle size={14} /> {t('explainedBy')} {persona}
                </button>
              </div>
            </div>
          </div>

          <div className="mission-brief">
            <div className="brief-header">
              <Info size={14} />
              <span>BRIEFING</span>
            </div>
            <div className="brief-item">
              <label>CONCEPT</label>
              <p>{module.concept}</p>
            </div>
            <div className="brief-item">
              <label>REWARD</label>
              <p>🏆 {module.reward}</p>
            </div>
          </div>
        </aside>

        {/* Lab Workspace */}
        <main className="lab-workspace">
          <div className="workspace-inner">
            <div className="lab-corners">
              <span className="tl" /><span className="tr" />
              <span className="bl" /><span className="br" />
            </div>
            <div className="lab-scroll">
              {children}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .module-stage {
          position: fixed;
          inset: 0;
          background: #050510;
          z-index: 500;
          display: flex;
          flex-direction: column;
          color: white;
          font-family: 'Outfit', sans-serif;
        }

        .hud-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(108, 92, 231, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(162, 155, 254, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .mission-header {
          height: 80px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .mission-back {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          padding: 8px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mission-back:hover { background: rgba(255,255,255,0.1); color: white; }

        .mission-title-area { text-align: center; }
        .mission-badge { font-size: 10px; font-weight: 900; color: #a29bfe; letter-spacing: 2px; }
        .mission-title-area h2 { margin: 0; font-size: 20px; font-weight: 800; }

        .mission-nav { display: flex; gap: 20px; }
        .nav-item { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: #00d1b2; opacity: 0.8; }

        .mission-layout {
          flex: 1;
          display: flex;
          padding: 30px;
          gap: 30px;
          overflow: hidden;
          z-index: 5;
        }

        .command-center { width: 350px; display: flex; flex-direction: column; gap: 20px; }
        
        .professor-pod {
          background: rgba(255,255,255,0.03);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .avatar-frame {
          width: 100px;
          height: 100px;
          margin: 0 auto;
          background: #151525;
          border-radius: 20px;
          border: 2px solid rgba(108, 92, 231, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          position: relative;
          overflow: hidden;
        }
        .avatar-frame.speaking { border-color: #00d1b2; box-shadow: 0 0 20px rgba(0, 209, 178, 0.3); }
        
        .scan-line {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(108, 92, 231, 0.2) 50%);
          background-size: 100% 4px;
          pointer-events: none;
        }

        .comms-window { background: rgba(0,0,0,0.3); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .comms-header { 
          padding: 8px 12px; background: rgba(255,255,255,0.05); 
          display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.4);
        }
        .comms-header .dot { width: 6px; height: 6px; background: #00d1b2; border-radius: 50%; }
        .speaker-icon { margin-left: auto; cursor: pointer; transition: color 0.2s; }
        .speaker-icon.active { color: #00d1b2; }

        .comms-body { padding: 16px; min-height: 100px; max-height: 250px; overflow-y: auto; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.8); }
        .comms-footer { padding: 8px; border-top: 1px solid rgba(255,255,255,0.05); }
        .ask-trigger { 
          width: 100%; background: none; border: none; color: #a29bfe; font-size: 11px; font-weight: 700; 
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .ask-trigger.loading { opacity: 0.5; animation: pulse 1s infinite; }

        .mission-brief { 
          background: rgba(162, 155, 254, 0.05); border-radius: 20px; border: 1px solid rgba(162, 155, 254, 0.1); padding: 20px;
        }
        .brief-header { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 900; color: #a29bfe; margin-bottom: 16px; }
        .brief-item { margin-bottom: 12px; }
        .brief-item label { font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.3); display: block; margin-bottom: 4px; }
        .brief-item p { margin: 0; font-size: 13px; font-weight: 600; }

        .lab-workspace { flex: 1; position: relative; }
        .workspace-inner { 
          position: absolute; inset: 0; background: rgba(255,255,255,0.02); 
          border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; backdrop-filter: blur(5px);
          display: flex; flex-direction: column; overflow: hidden;
        }
        
        .lab-corners span { position: absolute; width: 20px; height: 20px; border: 2px solid #6c5ce7; pointer-events: none; }
        .tl { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .tr { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
        .bl { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
        .br { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

        .lab-scroll { flex: 1; overflow-y: auto; padding: 40px; }

        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

        @media (max-width: 1024px) {
          .mission-layout { flex-direction: column; padding: 15px; gap: 15px; }
          .command-center { width: 100%; flex-direction: row; overflow-x: auto; gap: 15px; }
          .professor-pod { flex-direction: row; align-items: center; padding: 16px; min-width: 0; }
          .avatar-frame { width: 60px; height: 60px; font-size: 30px; flex-shrink: 0; }
          .comms-body { max-height: 80px; min-height: 60px; }
          .mission-brief { display: none; }
          .lab-workspace { min-height: 400px; }
          .workspace-inner { position: relative; inset: auto; min-height: 400px; border-radius: 20px; }
          .lab-scroll { padding: 20px; }
          .lab-corners { display: none; }
        }
        
        @media (max-width: 640px) {
          .mission-header { padding: 0 15px; height: 60px; }
          .mission-title-area h2 { font-size: 16px; }
          .mission-nav { display: none; }
          .mission-back { padding: 6px 12px; font-size: 12px; }
          .command-center { flex-direction: column; }
          .lab-scroll { padding: 15px; }
        }
      `}</style>
    </motion.div>
  );
};
