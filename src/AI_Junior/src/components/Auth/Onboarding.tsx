import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Rocket, Sparkles, Brain, Check, Zap, Terminal, ArrowRight, Gamepad2, Trophy, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfxClick } from '../../utils/sounds';

export const Onboarding: React.FC = () => {
  const { setProfile, setPersona, t, language, persona } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState(8);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    sfxClick();
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && name.length > 2) {
      setStep(2);
    } else if (step === 2) {
      if (age >= 14) setPersona('Scientist');
      else if (age >= 11) setPersona('StarStriker');
      else setPersona('Princess');
      setStep(3);
    } else if (step === 3 && !saving) {
      setSaving(true);
      try {
        await setProfile(name, age);
      } catch (err) {
        console.error('Profile save failed:', err);
        setSaving(false);
      }
    }
  };

  return (
    <div className="arcade-onboarding">
      <div className="onboarding-bg">
        <div className="grid-3d" />
        <div className="stars" />
      </div>

      <div className="crt-overlay" />

      <motion.div 
        className="arcade-enroll-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="enroll-header">
          <Terminal size={14} />
          <span>CADET_REGISTRATION_V2.0</span>
          <div className="pulse-dot" />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0" 
              className="enroll-step" 
              exit={{ scale: 0.9, opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="icon-box neon-purple">
                <Gamepad2 size={48} />
              </div>
              
              <h2>{language === 'es' ? 'BIENVENIDO, ARQUITECTO' : 'WELCOME, ARCHITECT'}</h2>
              <p className="step-desc">
                {language === 'es' 
                  ? 'Estás a punto de entrar a la Academia. El futuro no es algo que sucede, es algo que tú vas a programar.' 
                  : 'You are about to enter the Academy. The future isn\'t something that happens; it\'s something you will program.'}
              </p>
              
              <div className="features-pixel">
                <div className="f-row"><Brain size={16} /> <span>NEURAL_NET_MASTER</span></div>
                <div className="f-row"><Target size={16} /> <span>PROMPT_ENGINEERING</span></div>
                <div className="f-row"><Trophy size={16} /> <span>LEVEL_UP_READY</span></div>
              </div>

              <button className="arcade-btn primary" onClick={handleNext}>
                {language === 'es' ? 'PRESIONAR START' : 'PRESS START'} <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1" 
              className="enroll-step" 
              exit={{ x: -50, opacity: 0 }}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="icon-box neon-cyan">
                <User size={48} />
              </div>
              
              <h2>{language === 'es' ? 'INGRESA TU CALLSIGN' : 'ENTER YOUR CALLSIGN'}</h2>
              <p className="step-desc">{language === 'es' ? '¿Cómo te conocerán en la red?' : 'How will the network know you?'}</p>
              
              <div className="arcade-input-wrap">
                <span className="cursor">{'>'}</span>
                <input 
                  type="text" 
                  placeholder="ID_..."
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>

              <button className="arcade-btn" disabled={name.length < 3} onClick={handleNext}>
                {language === 'es' ? 'CONFIRMAR ID' : 'CONFIRM ID'} <Rocket size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" 
              className="enroll-step" 
              exit={{ x: -50, opacity: 0 }}
              initial={{ x: 50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="icon-box neon-pink">
                <Zap size={48} />
              </div>

              <h2>{language === 'es' ? 'NIVEL DE ENERGÍA' : 'SET POWER LEVEL'}</h2>
              <p className="step-desc">{language === 'es' ? 'Sincronizando bio-edad...' : 'Syncing bio-age...'}</p>
              
              <div className="power-console">
                <input 
                  type="range" 
                  min="8" max="15" 
                  value={age} 
                  onChange={(e) => setAge(parseInt(e.target.value))} 
                />
                <div className="readout">
                  <span className="unit">AGE_UNITS:</span>
                  <span className="val">{age}</span>
                </div>
                <div className="mode-badge">
                  {age <= 10 && <span className="m1">ADVENTURE_MODE</span>}
                  {age >= 11 && age <= 13 && <span className="m2">EXPLORER_MODE</span>}
                  {age >= 14 && <span className="m3">ARCHITECT_MODE</span>}
                </div>
              </div>
              
              <button className="arcade-btn" onClick={handleNext}>
                {language === 'es' ? 'CONTINUAR' : 'CONTINUE'} <Rocket size={18} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              className="enroll-step" 
              initial={{ x: 50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="icon-box neon-yellow">
                <Sparkles size={48} />
              </div>

              <h2>{language === 'es' ? 'ELIGE TU AVATAR' : 'CHOOSE YOUR AVATAR'}</h2>
              <p className="step-desc">{language === 'es' ? 'Selecciona a tu guía IA' : 'Select your AI guide'}</p>
              
              <div className="avatar-grid">
                <button className={`avatar-card-v2 ${persona === 'Princess' ? 'active' : ''}`} onClick={() => setPersona('Princess')}>
                  <div className="avatar-frame">
                    <img src="/cyber_princess_avatar_1776959734137.png" alt="Princess" />
                  </div>
                  <span className="label">{language === 'es' ? 'PRINCESA' : 'PRINCESS'}</span>
                </button>
                <button className={`avatar-card-v2 ${persona === 'StarStriker' ? 'active' : ''}`} onClick={() => setPersona('StarStriker')}>
                  <div className="avatar-frame">
                    <img src="/cyber_striker_avatar_1776959748164.png" alt="Striker" />
                  </div>
                  <span className="label">{language === 'es' ? 'GOLEADOR' : 'STRIKER'}</span>
                </button>
                <button className={`avatar-card-v2 ${persona === 'Scientist' ? 'active' : ''}`} onClick={() => setPersona('Scientist')}>
                  <div className="avatar-frame">
                    <img src="/cyber_scientist_avatar_1776959764012.png" alt="Scientist" />
                  </div>
                  <span className="label">{language === 'es' ? 'CIENTÍFICO' : 'SCIENTIST'}</span>
                </button>
              </div>
              
              <button className="arcade-btn primary" onClick={handleNext} disabled={saving}>
                {saving 
                  ? (language === 'es' ? 'GUARDANDO...' : 'SAVING...') 
                  : (language === 'es' ? 'INICIAR MISIÓN' : 'LAUNCH MISSION')
                } {!saving && <Zap size={18} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="enroll-footer">
          <div className="stat"><Check size={10} /> SYS_READY</div>
          <div className="stat"><Brain size={10} /> NEURAL_SYNC_100%</div>
        </div>
      </motion.div>

      <style>{`
        .arcade-onboarding {
          position: fixed; inset: 0; background: #050510; display: flex; align-items: center; justify-content: center; z-index: 3000;
          font-family: 'Space Grotesk', sans-serif; overflow: hidden;
        }

        .onboarding-bg { position: absolute; inset: 0; z-index: 0; }
        .grid-3d {
          position: absolute; width: 200%; height: 200%; bottom: -50%; left: -50%;
          background-image: linear-gradient(rgba(108, 92, 231, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(108, 92, 231, 0.1) 1px, transparent 1px);
          background-size: 80px 80px; transform: rotateX(60deg); opacity: 0.3;
        }
        .stars { position: absolute; inset: 0; background-image: radial-gradient(circle, #fff 0.5px, transparent 0.5px); background-size: 50px 50px; opacity: 0.1; }

        .crt-overlay { position: fixed; inset: 0; z-index: 100; pointer-events: none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%); background-size: 100% 4px; opacity: 0.3; }

        .arcade-enroll-card {
          width: 100%; max-width: 550px; background: #0a0a1f; border: 2px solid #6c5ce7; border-radius: 4px;
          box-shadow: 0 0 50px rgba(108, 92, 231, 0.2), 10px 10px 0 #000; z-index: 10; position: relative;
        }

        .enroll-header { padding: 12px 20px; background: #000; border-bottom: 1px solid #6c5ce744; display: flex; align-items: center; gap: 12px; font-size: 10px; font-weight: 900; color: #6c5ce7; letter-spacing: 2px; }
        .pulse-dot { width: 6px; height: 6px; background: #00ff00; border-radius: 50%; margin-left: auto; animation: pulse-green 2s infinite; }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(0,255,0,0.7); } 70% { box-shadow: 0 0 0 10px rgba(0,255,0,0); } 100% { box-shadow: 0 0 0 0 rgba(0,255,0,0); } }

        .enroll-step { padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }

        .icon-box { width: 80px; height: 80px; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid currentColor; margin-bottom: 10px; }
        .neon-purple { color: #6c5ce7; box-shadow: 0 0 20px #6c5ce744; }
        .neon-cyan { color: #00ffff; box-shadow: 0 0 20px #00ffff44; }
        .neon-pink { color: #ff00ff; box-shadow: 0 0 20px #ff00ff44; }
        .neon-yellow { color: #f9ca24; box-shadow: 0 0 20px #f9ca2444; }

        h2 { font-size: 24px; font-weight: 900; color: white; margin: 0; letter-spacing: 1px; }
        .step-desc { font-size: 13px; color: #ffffff66; margin: 0; line-height: 1.6; }

        .features-pixel { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .f-row { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 2px; display: flex; align-items: center; gap: 15px; font-size: 11px; font-weight: 900; color: #6c5ce7; transition: 0.3s; }
        .f-row:hover { border-color: #6c5ce7; background: rgba(108, 92, 231, 0.05); }

        .arcade-input-wrap { width: 100%; background: #000; border: 2px solid #00ffff; padding: 20px; border-radius: 4px; display: flex; align-items: center; gap: 15px; box-shadow: 4px 4px 0 #00ffff22; }
        .cursor { color: #00ffff; font-weight: 900; font-family: monospace; }
        input[type="text"] { background: none; border: none; color: #fff; font-size: 18px; font-weight: 900; width: 100%; outline: none; font-family: monospace; }

        .power-console { width: 100%; display: flex; flex-direction: column; gap: 20px; }
        input[type="range"] { appearance: none; width: 100%; background: rgba(255,0,255,0.1); height: 6px; border-radius: 3px; }
        input[type="range"]::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: #ff00ff; border: 2px solid #fff; border-radius: 2px; cursor: pointer; box-shadow: 0 0 15px #ff00ff; }

        .readout { display: flex; justify-content: space-between; font-weight: 900; font-family: monospace; }
        .readout .unit { font-size: 10px; color: #ffffff22; }
        .readout .val { font-size: 20px; color: #ff00ff; }
        .mode-badge { background: #000; padding: 10px; border-radius: 2px; font-size: 10px; font-weight: 900; color: #ff00ff; border: 1px dashed #ff00ff44; }

        .avatar-grid { display: flex; gap: 15px; width: 100%; justify-content: center; padding: 10px 0; }
        .avatar-card-v2 { 
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; 
          padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; 
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: white; width: 130px; 
        }
        .avatar-frame { 
          width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden; 
          background: #000; border: 1px solid rgba(255,255,255,0.1);
        }
        .avatar-frame img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: 0.3s; }
        
        .avatar-card-v2:hover { background: rgba(108, 92, 231, 0.05); border-color: #6c5ce744; transform: translateY(-5px); }
        .avatar-card-v2:hover img { opacity: 1; transform: scale(1.1); }
        
        .avatar-card-v2.active { 
          border-color: #6c5ce7; background: rgba(108, 92, 231, 0.1); 
          box-shadow: 0 0 30px rgba(108, 92, 231, 0.2); 
        }
        .avatar-card-v2.active .avatar-frame { border-color: #6c5ce7; box-shadow: 0 0 15px rgba(108, 92, 231, 0.5); }
        .avatar-card-v2.active img { opacity: 1; }
        
        .avatar-card-v2 .label { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: rgba(255,255,255,0.5); }
        .avatar-card-v2.active .label { color: #6c5ce7; }

        .arcade-btn {
          width: 100%; background: #0a0a1f; border: 2px solid currentColor; padding: 18px; border-radius: 4px;
          font-size: 14px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 15px;
          transition: 0.2s; color: #00ffff; box-shadow: 4px 4px 0 #000;
        }
        .arcade-btn.primary { color: white; background: #6c5ce7; border-color: #6c5ce7; box-shadow: 4px 4px 0 #000, 0 0 20px rgba(108, 92, 231, 0.4); }
        .arcade-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .arcade-btn:not(:disabled):hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #000; }

        .enroll-footer { padding: 12px 20px; background: #000; display: flex; gap: 20px; font-size: 9px; font-weight: 900; color: #ffffff11; letter-spacing: 1px; }
        .stat { display: flex; align-items: center; gap: 6px; }

        @media (max-width: 550px) {
          .arcade-enroll-card { width: 95%; margin: 10px; }
          .enroll-step { padding: 30px 20px; }
          .avatar-grid { gap: 10px; }
          .avatar-card-v2 { width: 100px; }
        }
      `}</style>
    </div>
  );
};
