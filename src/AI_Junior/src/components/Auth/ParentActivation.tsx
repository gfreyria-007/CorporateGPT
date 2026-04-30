import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, ExternalLink, Rocket, ArrowRight, CheckCircle2, Zap, Brain, Globe, Lock, Play, Terminal, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfxClick, sfxAchievement, sfxHover } from '../../utils/sounds';

interface ParentActivationProps {
  onClose?: () => void;
}

export const ParentActivation: React.FC<ParentActivationProps> = ({ onClose }) => {
  const { setGeminiKey, t, language, userName } = useApp();
  const [keyInput, setKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleVerify = async () => {
    if (!keyInput.startsWith('AIza')) {
      setError(language === 'es' ? 'La llave debe empezar con AIza...' : 'Key must start with AIza...');
      return;
    }
    
    setError(null);
    setIsTesting(true);
    sfxClick();

    try {
      // Simulate validation/init
      await new Promise(resolve => setTimeout(resolve, 2000));
      await setGeminiKey(keyInput);
      sfxAchievement();
      setIsSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
    } catch (err) {
      setError(language === 'es' ? 'Error al conectar con la IA' : 'Failed to connect to AI');
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="arcade-bridge">
      <div className="bridge-bg">
        <div className="grid-3d" />
        <div className="stars" />
      </div>

      <div className="crt-effect" />

      <motion.div 
        className="bridge-container"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button className="arcade-close-btn" onClick={() => { sfxClick(); if (onClose) onClose(); }}>
          <Zap size={16} />
          <span>ABORT_BYPASS</span>
        </button>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div key="form" className="bridge-layout" exit={{ scale: 0.9, opacity: 0 }}>

              {/* Left Side: System Readout */}
              <div className="system-readout">
                <div className="readout-header">
                  <div className="bit">STATUS: WAITING_FOR_SYNC</div>
                  <h2>{language === 'es' ? 'Previsualización de Misión' : 'Mission Preview'}</h2>
                </div>
                <div className="preview-monitor">
                  <img src="/lab_previews_grid_1776908589057.png" alt="Mission Previews" />
                  <div className="scanline-anim" />
                  <div className="corner-decor top-left" />
                  <div className="corner-decor bottom-right" />
                </div>
                <div className="readout-stats">
                  <div className="stat"><Brain size={14} /> <span>NEURAL_ENGINE_V9</span></div>
                  <div className="stat"><Zap size={14} /> <span>CORE_IGNITION_READY</span></div>
                </div>
              </div>

              {/* Right Side: Setup Panel */}
              <div className="override-panel">
                <div className="panel-header">
                  <div className="badge-neon">ADMIN_SYSTEM_OVERRIDE</div>
                  <h1>{language === 'es' ? 'Sincronizar Núcleo' : 'Sync AI Nucleus'}</h1>
                  <p className="panel-desc">{language === 'es' ? `Hola ${userName}, necesitamos energía para tu nave. Sigue los protocolos.` : `Hi ${userName}, we need energy for your ship. Follow protocols.`}</p>
                </div>

                <div className="protocol-list">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="protocol-item" onMouseEnter={sfxHover}>
                    <div className="p-num">01</div>
                    <div className="p-info">
                      <strong>{language === 'es' ? 'Obtener Llave Gemini' : 'Get Gemini Key'}</strong>
                      <span>{language === 'es' ? 'Gratis en 30 segundos.' : 'Free in 30 seconds.'}</span>
                    </div>
                    <ExternalLink size={16} className="link-icon" />
                  </a>
                  
                  <button className="protocol-item" onClick={() => setShowTutorial(true)} onMouseEnter={sfxHover}>
                    <div className="p-num">?</div>
                    <div className="p-info">
                      <strong>{language === 'es' ? '¿Cómo obtenerla?' : 'How to get it?'}</strong>
                      <span>{language === 'es' ? 'Ver manual de instrucciones.' : 'View instruction manual.'}</span>
                    </div>
                    <Globe size={16} className="link-icon" />
                  </button>
                </div>

                <div className="arcade-terminal">
                  <div className="term-top">
                    <div className="leds"><div/><div/><div/></div>
                    <span>TERMINAL_KEY_INPUT</span>
                  </div>
                  <div className="term-input-box">
                    <Key className="input-icon" size={18} />
                    <input 
                      type="password" 
                      placeholder="INSERT_AI_NUCLEUS_..." 
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                    />
                  </div>
                </div>

                {error && <motion.div className="protocol-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

                <button 
                  className={`arcade-btn-large ${isTesting ? 'igniting' : ''}`}
                  disabled={!keyInput.startsWith('AIza') || isTesting}
                  onClick={handleVerify}
                >
                  {isTesting ? (
                    <>
                      <div className="loader-pixel" />
                      <span>{language === 'es' ? 'SINCRONIZANDO...' : 'SYNCING...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'es' ? 'ACTIVAR NÚCLEO' : 'ACTIVATE CORE'}</span>
                      <Play size={18} fill="currentColor" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success" 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ignition-result"
            >
              <div className="success-glow" />
              <div className="result-icon">
                <CheckCircle2 size={80} color="#00ffff" />
              </div>
              <h2>{language === 'es' ? 'NÚCLEO ONLINE' : 'NUCLEUS ONLINE'}</h2>
              <p>{language === 'es' ? 'Sistemas al 100%. Entrando al Mapa Mundial...' : 'Systems at 100%. Entering World Map...'}</p>
              <div className="launch-visual">
                <Rocket className="rocket-streak" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div 
              className="tutorial-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="tutorial-modal">
                <div className="tutorial-header">
                  <Brain size={20} />
                  <span>MANUAL_INSTRUCCIONES_AI_STUDIO</span>
                  <button className="close-tut" onClick={() => setShowTutorial(false)}>X</button>
                </div>
                <div className="tutorial-content">
                  <div className="step">
                    <span className="step-num">1</span>
                    <p>{language === 'es' ? 'Haz clic en el enlace de "Obtener Llave Gemini" arriba.' : 'Click the "Get Gemini Key" link above.'}</p>
                  </div>
                  <div className="step">
                    <span className="step-num">2</span>
                    <p>{language === 'es' ? 'Entra con tu cuenta de Google en AI Studio.' : 'Sign in with your Google account at AI Studio.'}</p>
                  </div>
                  <div className="step">
                    <span className="step-num">3</span>
                    <p>{language === 'es' ? 'Haz clic en el botón azul "Create API key".' : 'Click the blue "Create API key" button.'}</p>
                  </div>
                  <div className="step">
                    <span className="step-num">4</span>
                    <p>{language === 'es' ? 'Copia la llave (empieza con "AIza") y pégala en la terminal de aquí.' : 'Copy the key (starts with "AIza") and paste it into the terminal here.'}</p>
                  </div>
                </div>
                <button className="tut-btn" onClick={() => setShowTutorial(false)}>ENTENDIDO</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .arcade-bridge { 
          position: fixed; inset: 0; background: #050510; display: flex; align-items: center; justify-content: center; z-index: 2000;
          font-family: 'Space Grotesk', sans-serif; overflow: hidden;
        }
        .bridge-bg { position: absolute; inset: 0; z-index: 0; }
        .grid-3d {
          position: absolute; width: 200%; height: 200%; bottom: -50%; left: -50%;
          background-image: linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 100px 100px; transform: rotateX(60deg); opacity: 0.2;
        }
        .stars { position: absolute; inset: 0; background-image: radial-gradient(circle, #fff 0.5px, transparent 0.5px); background-size: 40px 40px; opacity: 0.1; }

        .crt-effect { position: fixed; inset: 0; z-index: 1000; pointer-events: none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%); background-size: 100% 4px; opacity: 0.2; }

        .bridge-container { width: 95%; max-width: 1000px; z-index: 10; position: relative; }
        
        .arcade-close-btn {
          position: absolute; top: -60px; right: 0;
          background: #000; border: 2px solid #ff00ff; padding: 10px 20px; border-radius: 4px; color: #ff00ff;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          font-size: 10px; font-weight: 900; transition: all 0.2s; box-shadow: 4px 4px 0 rgba(255,0,255,0.2);
        }
        .arcade-close-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 rgba(255,0,255,0.3); }

        .bridge-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: #0a0a1f; border: 2px solid #00ffff; border-radius: 4px; padding: 40px; box-shadow: 15px 15px 0 #000; }

        .system-readout { display: flex; flex-direction: column; gap: 20px; }
        .readout-header { border-bottom: 1px solid #00ffff22; padding-bottom: 15px; }
        .bit { font-size: 9px; font-weight: 900; color: #ff00ff; letter-spacing: 2px; margin-bottom: 5px; }
        .system-readout h2 { color: white; font-size: 20px; font-weight: 900; margin: 0; }
        
        .preview-monitor { position: relative; aspect-ratio: 16/9; background: #000; border: 2px solid #00ffff; border-radius: 4px; overflow: hidden; }
        .preview-monitor img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; filter: grayscale(0.5) contrast(1.2); }
        .scanline-anim { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,255,255,0.1) 50%); background-size: 100% 4px; animation: scan 8s linear infinite; }
        @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        .corner-decor { position: absolute; width: 20px; height: 20px; border: 2px solid #00ffff; }
        .top-left { top: 10px; left: 10px; border-right: 0; border-bottom: 0; }
        .bottom-right { bottom: 10px; right: 10px; border-left: 0; border-top: 0; }

        .readout-stats { display: flex; gap: 20px; margin-top: auto; }
        .stat { background: rgba(0,255,255,0.05); padding: 10px 15px; border-radius: 2px; display: flex; align-items: center; gap: 10px; font-size: 10px; font-weight: 900; color: #00ffff; border: 1px solid #00ffff22; }

        .override-panel { display: flex; flex-direction: column; gap: 25px; }
        .badge-neon { display: inline-block; padding: 4px 10px; background: #ff00ff; color: #000; font-size: 10px; font-weight: 900; border-radius: 2px; margin-bottom: 10px; letter-spacing: 2px; }
        .override-panel h1 { font-size: 32px; font-weight: 900; color: white; margin: 0; }
        .panel-desc { font-size: 13px; color: #ffffff66; margin: 0; line-height: 1.5; }

        .protocol-list { display: flex; flex-direction: column; gap: 10px; }
        .protocol-item { background: #000; border: 1px solid #00ffff22; border-radius: 4px; padding: 15px; display: flex; align-items: center; gap: 15px; text-decoration: none; transition: 0.2s; }
        .protocol-item:not(.locked):hover { border-color: #00ffff; background: rgba(0,255,255,0.05); transform: translateX(5px); }
        .p-num { font-size: 20px; font-weight: 900; color: #00ffff; opacity: 0.3; }
        .p-info { flex: 1; display: flex; flex-direction: column; }
        .p-info strong { font-size: 13px; color: white; }
        .p-info span { font-size: 11px; color: #ffffff44; }
        .link-icon { color: #00ffff; }
        .protocol-item.locked { opacity: 0.5; border-style: dashed; cursor: not-allowed; }

        .arcade-terminal { background: #000; border: 2px solid #ff00ff; border-radius: 4px; overflow: hidden; box-shadow: 4px 4px 0 rgba(255,0,255,0.1); }
        .term-top { background: #000; border-bottom: 1px solid #ff00ff22; padding: 8px 15px; display: flex; align-items: center; gap: 12px; font-size: 9px; font-weight: 900; color: #ff00ff; letter-spacing: 1px; }
        .leds { display: flex; gap: 4px; }
        .leds div { width: 4px; height: 4px; background: #ff00ff; border-radius: 50%; opacity: 0.3; }
        .term-input-box { padding: 15px; display: flex; align-items: center; gap: 12px; }
        .input-icon { color: #ff00ff; }
        .term-input-box input { background: none; border: none; color: #ff00ff; width: 100%; outline: none; font-size: 14px; font-family: monospace; font-weight: 900; }
        .term-input-box input::placeholder { color: #ff00ff44; }

        .protocol-error { background: #ff000022; border: 1px solid #ff0000; color: #ff0000; padding: 10px; border-radius: 2px; font-size: 11px; font-weight: 900; text-align: center; }

        .arcade-btn-large {
          width: 100%; background: #00ffff; color: #000; border: none; padding: 20px; border-radius: 4px;
          font-size: 16px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 15px;
          box-shadow: 0 0 20px #00ffff44, 6px 6px 0 #000; transition: 0.2s;
        }
        .arcade-btn-large:disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
        .arcade-btn-large:not(:disabled):hover { transform: translate(-2px, -2px); box-shadow: 0 0 30px #00ffff66, 8px 8px 0 #000; }

        .loader-pixel { width: 20px; height: 20px; border: 3px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ignition-result { background: #0a0a1f; border: 2px solid #00ffff; padding: 60px; text-align: center; border-radius: 4px; position: relative; overflow: hidden; box-shadow: 15px 15px 0 #000; }
        .success-glow { position: absolute; inset: 0; background: radial-gradient(circle, rgba(0,255,255,0.1), transparent 70%); }
        .result-icon { margin-bottom: 20px; filter: drop-shadow(0 0 20px #00ffff44); }
        .ignition-result h2 { color: #00ffff; font-size: 40px; font-weight: 900; margin: 0; letter-spacing: 2px; }
        .ignition-result p { color: white; opacity: 0.6; font-size: 16px; margin: 20px 0; }
        .launch-visual { margin-top: 40px; height: 100px; display: flex; align-items: flex-end; justify-content: center; }
        .rocket-streak { color: #00ffff; animation: streak 1s ease-in infinite; }
        @keyframes streak { 0% { transform: translateY(0) scale(1); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-200px) scale(0.5); opacity: 0; } }

        @media (max-width: 900px) {
          .bridge-layout { grid-template-columns: 1fr; padding: 25px; }
          .system-readout { display: none; }
          .override-panel h1 { font-size: 24px; }
          .arcade-btn-large { padding: 16px; }
        }

        .tutorial-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; z-index: 5000; padding: 20px;
        }
        .tutorial-modal {
          background: #0a0a1f; border: 2px solid #00ffff; border-radius: 4px; width: 100%; max-width: 500px;
          box-shadow: 0 0 50px rgba(0,255,255,0.2); overflow: hidden;
        }
        .tutorial-header {
          background: #000; padding: 15px 25px; display: flex; align-items: center; gap: 15px;
          border-bottom: 1px solid #00ffff22; font-size: 10px; font-weight: 900; color: #00ffff; letter-spacing: 2px;
        }
        .close-tut { background: none; border: none; color: white; margin-left: auto; cursor: pointer; opacity: 0.5; }
        .tutorial-content { padding: 30px; display: flex; flex-direction: column; gap: 20px; }
        .step { display: flex; gap: 20px; align-items: flex-start; }
        .step-num { 
          width: 24px; height: 24px; background: #00ffff; color: #000; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; font-weight: 900; flex-shrink: 0;
          font-size: 12px;
        }
        .step p { margin: 0; font-size: 13px; color: white; line-height: 1.5; opacity: 0.8; }
        .tut-btn {
          width: 100%; background: #00ffff; color: #000; border: none; padding: 15px; 
          font-weight: 900; cursor: pointer; transition: 0.2s;
        }
        .tut-btn:hover { background: #fff; }
      `}</style>
    </div>
  );
};
