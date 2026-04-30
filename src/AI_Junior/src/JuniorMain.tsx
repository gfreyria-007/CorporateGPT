import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './context/AppContext';
import { LandingPage } from './components/Landing/LandingPage';
import { Login } from './components/Auth/Login';
import { ParentActivation } from './components/Auth/ParentActivation';
import { Onboarding } from './components/Auth/Onboarding';
import { WorldMap } from './components/Map/WorldMap';
import { ModuleContainer } from './components/Modules/ModuleContainer';
import { Module } from './data/curriculum';
import { 
  Sparkles, Zap, Volume2, VolumeX, RefreshCw
} from 'lucide-react';
import { StarfieldBackground, ConfettiLayer, useConfetti } from './utils/particles';
import { sfxClick, sfxNav, sfxWarp, sfxAchievement, setMuted, sfxHover } from './utils/sounds';

// Dynamic Module Components Mapping
import { Module1_Brain } from './components/Modules/Labs/Module1_Brain';
import { Module2_ML } from './components/Modules/Labs/Module2_ML';
import { Module3_Vision } from './components/Modules/Labs/Module3_Vision';
import { Module7_Prompting } from './components/Modules/Labs/Module7_Prompting';

const LAB_COMPONENTS: Record<string, React.FC<any>> = {
  '1': Module1_Brain,
  '2': Module2_ML,
  '3': Module3_Vision,
  '7': Module7_Prompting,
};

export default function JuniorMain() {
  const { 
    user, loading, userName, userAge, persona, geminiKey, language, progress, t, setLanguage, guestSignIn
  } = useApp();
  
  const [showLanding, setShowLanding] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [isWarping, setIsWarping] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [timer, setTimer] = useState(5);
  const [muted, setMutedState] = useState(false);
  const { particles, fire: fireConfetti } = useConfetti();

  const handleStartMission = () => {
    sfxWarp();
    setIsWarping(true);
    setTimeout(() => {
      setShowLanding(false);
      setIsWarping(false);
    }, 1200);
  };

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  };

  useEffect(() => {
    let interval: any;
    if (loading && timer > 0 && !showLanding) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && loading) {
      setLoadError(true);
    }
    return () => clearInterval(interval);
  }, [loading, timer, showLanding]);

  // ─── Loading Screen: Arcade Boot Sequence ───
  if (loading && !loadError && !showLanding && !userName) {
    return (
      <div className="arcade-loading">
        <StarfieldBackground />
        <div className="crt-scanlines" />
        <div className="boot-terminal">
          <div className="term-bar">
            <div className="term-leds"><div className="l1"/><div className="l2"/><div className="l3"/></div>
            <span>SYS_BOOT_v20.99</span>
          </div>
          <div className="term-content">
            <p className="p-ok">&gt; INITIALIZING_NEURAL_LINKS... [OK]</p>
            <p className="p-ok">&gt; SYNCING_STARDUST_ENGINE... [OK]</p>
            <p className={timer < 3 ? 'p-ok' : 'p-wait'}>
              &gt; LOADING_CURRICULUM_MATRIX... [{timer < 3 ? 'OK' : 'PENDING'}]
            </p>
            <p className={timer < 2 ? 'p-ok' : 'p-wait'}>
              &gt; AUTHENTICATING_CADET_ID... [{timer < 2 ? 'OK' : 'WAITING'}]
            </p>
            
            {timer <= 2 && (
              <motion.div 
                className="emergency-bypass"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="warn">! SYNC_LATENCY_DETECTED</p>
                <div className="bypass-actions">
                  <button className="bypass-btn" onClick={() => window.location.reload()}>
                    <RefreshCw size={12} /> <span>RETRY_SYNC</span>
                  </button>
                  <button className="bypass-btn secondary" onClick={() => {
                    console.log("Manual Override triggered.");
                    window.location.reload(); 
                  }}>
                    <span>MANUAL_OVERRIDE</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          <div className="boot-meter">
            <div className="meter-label">SYSTEM_LOAD: {Math.round(((5 - timer) / 5) * 100)}%</div>
            <div className="meter-bar">
              <motion.div 
                className="meter-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.round(((5 - timer) / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <style>{`
          .arcade-loading { position: fixed; inset: 0; background: #050510; display: flex; align-items: center; justify-content: center; z-index: 5000; font-family: monospace; }
          .crt-scanlines { position: absolute; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%); background-size: 100% 4px; pointer-events: none; }
          .boot-terminal { width: 95%; max-width: 500px; background: #000; border: 2px solid #00ffff; border-radius: 4px; box-shadow: 10px 10px 0 #000; padding: 0; overflow: hidden; }
          .term-bar { background: #1a1a2e; padding: 12px 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #00ffff44; color: #00ffff; font-size: 11px; font-weight: 900; }
          .term-leds { display: flex; gap: 6px; }
          .term-leds div { width: 8px; height: 8px; border-radius: 50%; background: #ff00ff; box-shadow: 0 0 10px #ff00ff; }
          .term-leds .l1 { animation: blink 1s infinite; }
          .term-leds .l2 { animation: blink 1s infinite 0.3s; }
          .term-leds .l3 { animation: blink 1s infinite 0.6s; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          
          .term-content { padding: 40px; }
          .term-content p { margin: 15px 0; font-size: 13px; letter-spacing: 1.5px; }
          .p-ok { color: #00ffff; text-shadow: 0 0 5px #00ffff44; }
          .p-wait { color: #ffffff22; }
          
          .emergency-bypass { margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ffffff22; display: flex; flex-direction: column; gap: 10px; }
          .warn { color: #ff00ff !important; font-size: 10px !important; margin: 0 0 10px 0 !important; }
          .bypass-actions { display: flex; gap: 10px; }
          .bypass-btn { flex: 1; background: #00ffff; color: #000; border: none; padding: 12px; border-radius: 2px; font-weight: 900; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
          .bypass-btn.secondary { background: none; border: 1px solid #ffffff22; color: #ffffff44; }
          .bypass-btn:hover { background: #fff; color: #000; }

          .boot-meter { padding: 0 40px 40px; }
          .meter-label { font-size: 10px; color: #00ffff; margin-bottom: 12px; font-weight: 900; }
          .meter-bar { height: 12px; background: #1a1a2e; border-radius: 2px; overflow: hidden; border: 1px solid #00ffff22; }
          .meter-fill { height: 100%; background: #ff00ff; box-shadow: 0 0 20px #ff00ff; }
        `}</style>
      </div>
    );
  }

  // ─── Error Screen: Game Over ───
  if (loadError) {
    return (
      <div className="game-over-screen">
        <StarfieldBackground />
        <div className="crt-scanlines" />
        <motion.div className="game-over-card" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h1 className="glitch-text">GAME OVER</h1>
          <p>HOUSTON, WE HAVE A PROBLEM...</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            <RefreshCw size={20} /> <span>TRY AGAIN</span>
          </button>
        </motion.div>
        <style>{`
          .game-over-screen { position: fixed; inset: 0; background: #000; display: flex; align-items: center; justify-content: center; z-index: 6000; }
          .game-over-card { text-align: center; }
          .glitch-text { font-size: 80px; font-weight: 900; color: #ff00ff; text-shadow: 0 0 20px #ff00ff; margin-bottom: 20px; }
          .retry-btn { background: #00ffff; color: #000; border: none; padding: 15px 40px; border-radius: 4px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 10px; margin: 0 auto; box-shadow: 5px 5px 0 #000; }
        `}</style>
      </div>
    );
  }

  const ActiveLab = activeModule ? LAB_COMPONENTS[activeModule.id.toString()] : null;

  const handleSelectModule = (module: Module) => {
    sfxWarp();
    setActiveModule(module);
  };

  const handleCloseModule = () => { sfxNav(); setActiveModule(null); };

  const handleModuleComplete = () => {
    sfxAchievement();
    fireConfetti();
    setTimeout(() => setActiveModule(null), 1500);
  };

  return (
    <div className="academy-shell">
      <StarfieldBackground />
      <ConfettiLayer particles={particles} />
      <div className="crt-effect-global" />

      {/* Cinematic Warp Transition */}
      <AnimatePresence>
        {isWarping && (
          <motion.div className="warp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="warp-tunnel" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div 
            key="landing" 
            exit={{ opacity: 0, scale: 1.1 }}
            style={{ overflowY: 'auto', height: '100vh' }}
          >
            <LandingPage onStart={handleStartMission} />
          </motion.div>
        ) : !userName ? (
          <motion.div key="auth-onboarding">
            {!user ? <Login /> : <Onboarding />}
          </motion.div>
        ) : (
          <motion.div key="main-app" className="main-viewport">
            {showConfig && <ParentActivation onClose={() => setShowConfig(false)} />}
            
            {activeModule ? (
              <ModuleContainer module={activeModule} onClose={handleCloseModule}>
                {ActiveLab ? <ActiveLab onComplete={handleModuleComplete} /> : (
                  <div className="lab-placeholder">
                    <Sparkles size={48} color="#ff00ff" />
                    <h2>COMING SOON</h2>
                    <p>ENGINEERS ARE WORKING ON THIS MODULE</p>
                  </div>
                )}
              </ModuleContainer>
            ) : (
              <div className="map-wrapper">
                <WorldMap onSelectModule={handleSelectModule} onConfigClick={() => setShowConfig(true)} />
                <div className="arcade-hud">
                  <div className="hud-p1">
                    <div className="label">1P</div>
                    <div className="value">{userName.toUpperCase()}</div>
                  </div>
                  <div className="hud-level">
                    <div className="label">LVL</div>
                    <div className="value">{Math.floor((progress.unlockedLevel - 1) / 6) + 1}</div>
                  </div>
                  <div className="hud-energy">
                    <Zap size={14} color="#00ffff" />
                    <div className="value">{progress.energyCores} C</div>
                  </div>
                  <button className="mute-toggle" onClick={toggleMute} onMouseEnter={sfxHover}>
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .academy-shell { 
          width: 100vw; 
          height: 100vh; 
          overflow: hidden; 
          background: #0d0221; 
          color: white; 
          position: relative; 
          font-family: 'Space Grotesk', sans-serif;
        }
        
        /* Enable scrolling only on the landing page wrapper */
        .academy-shell > div { height: 100%; }

        .crt-effect-global { 
          position: fixed; 
          inset: 0; 
          z-index: 9999; 
          pointer-events: none; 
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%); 
          background-size: 100% 4px; 
          opacity: 0.15; 
        }
        
        .warp-overlay { position: fixed; inset: 0; z-index: 5000; background: #000; }
        .warp-tunnel { width: 200%; height: 200%; background: radial-gradient(circle, transparent 20%, #00ffff 100%); opacity: 0.5; animation: warpZoom 1.2s ease-in; }
        @keyframes warpZoom { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(3); opacity: 0; } }

        .arcade-hud { 
          position: fixed; 
          top: 20px; 
          right: 20px; 
          display: flex; 
          gap: 20px; 
          align-items: center; 
          z-index: 1000; 
          background: rgba(13, 2, 33, 0.9); 
          padding: 10px 25px; 
          border: 3px solid #ff007f; 
          border-radius: 8px; 
          box-shadow: 6px 6px 0 #00f2ff; 
          backdrop-filter: blur(10px);
        }
        .hud-p1, .hud-level { border-left: 2px solid #00f2ff; padding-left: 10px; }
        .label { font-size: 10px; color: #ff007f; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .value { font-size: 16px; font-weight: 900; color: white; text-shadow: 0 0 10px #ff007f44; }
        .hud-energy { display: flex; align-items: center; gap: 8px; color: #faff00; }
        .mute-toggle { background: none; border: none; color: #00f2ff; cursor: pointer; transition: 0.2s; }
        .mute-toggle:hover { transform: scale(1.2) rotate(10deg); color: #ff007f; }

        .lab-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px; opacity: 0.5; }
        .lab-placeholder h2 { letter-spacing: 5px; color: #ff007f; }

        .map-wrapper { position: relative; width: 100%; height: 100%; }
      `}</style>
    </div>
  );
}


