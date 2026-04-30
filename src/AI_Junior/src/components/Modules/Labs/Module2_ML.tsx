import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Check, ShieldAlert, Zap, Search, Music } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sfxCorrect, sfxError, sfxScan } from '../../../utils/sounds';

interface Pattern {
  id: string;
  type: 'Happy' | 'Angry' | 'Hungry';
  color: string;
  waves: number[];
}

const TRAINING_DATA: Pattern[] = [
  { id: 'h1', type: 'Happy', color: '#00d1b2', waves: [5, 20, 5, 20, 5] },
  { id: 'a1', type: 'Angry', color: '#ff7675', waves: [30, 30, 30, 30, 30] },
  { id: 'hu1', type: 'Hungry', color: '#f9ca24', waves: [5, 5, 30, 5, 5] },
];

export const Module2_ML: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, t, language } = useApp();
  const [step, setStep] = useState(1);
  const [trainedModel, setTrainedModel] = useState<Record<string, string>>({});
  const [testWave, setTestWave] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startTest = () => {
    const randomType = ['Happy', 'Angry', 'Hungry'][Math.floor(Math.random() * 3)] as 'Happy' | 'Angry' | 'Hungry';
    const baseWave = TRAINING_DATA.find(p => p.type === randomType)!.waves;
    setTestWave(baseWave.map(v => v + (Math.random() * 4 - 2))); // Add noise
    setStep(3);
  };

  const handleClassify = (type: string) => {
    const actualType = TRAINING_DATA.find(p => JSON.stringify(p.waves.map(Math.round)) === JSON.stringify(testWave.map(Math.round)))?.type;
    // For simplicity in this lab, we just check if they pick the right one
    const isRight = TRAINING_DATA.find(p => p.type === type)!.waves.every((v, i) => Math.abs(v - testWave[i]) < 5);
    
    setIsCorrect(isRight);
    if (isRight) {
      sfxCorrect();
      setTimeout(() => {
        updateProgress({ unlockedLevel: 3, completedModules: ['2'], energyCores: 10 });
        onComplete();
      }, 2000);
    } else {
      sfxError();
    }
  };

  return (
    <div className="ml-lab">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" className="lab-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="zog-intro">
              <img src="/ai_alien_pet_zog_1776894086903.png" alt="Zog" className="zog-avatar" />
              <div className="zog-speech">
                <p>{language === 'es' ? '¡Hola! Soy Zog. No puedo hablar tu idioma, pero mis señales tienen patrones. ¿Puedes ayudar a la IA a entenderlos?' : "Hi! I'm Zog. I can't speak your language, but my signals have patterns. Can you help the AI understand them?"}</p>
              </div>
            </div>
            
            <div className="concept-card">
              <Search className="card-icon" />
              <h3>{language === 'es' ? '¿Qué es el Aprendizaje Automático?' : 'What is Machine Learning?'}</h3>
              <p>{language === 'es' ? 'Es cuando enseñamos a una computadora a encontrar PATRONES en los datos, ¡igual que tú lo haces!' : 'It is when we teach a computer to find PATTERNS in data, just like you do!'}</p>
            </div>

            <button className="mission-btn" onClick={() => setStep(2)}>{language === 'es' ? 'Iniciar Entrenamiento' : 'Start Training'}</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" className="lab-step" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <div className="training-center">
              <h3>{language === 'es' ? 'Centro de Datos de Zog' : "Zog's Data Center"}</h3>
              <div className="data-grid">
                {TRAINING_DATA.map(p => (
                  <div key={p.id} className="data-card">
                    <label>{p.type.toUpperCase()}</label>
                    <div className="wave-viz">
                      {p.waves.map((h, i) => (
                        <motion.div 
                          key={i} 
                          className="wave-bar" 
                          style={{ height: `${h * 2}px`, background: p.color }}
                          animate={{ height: [h*1.5, h*2.5, h*1.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="instruction">{language === 'es' ? 'Memoriza los patrones: "Feliz" sube y baja, "Enojado" es constante, "Hambriento" tiene un pico.' : 'Memorize the patterns: "Happy" waves up and down, "Angry" is a solid block, "Hungry" has a single spike.'}</p>
            <button className="mission-btn" onClick={startTest}>{language === 'es' ? 'Probar la IA' : 'Test the AI'}</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" className="lab-step" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="live-signal">
              <div className="signal-header">
                <Activity size={20} color="#00d1b2" />
                <span>{language === 'es' ? 'SEÑAL EN VIVO DETECTADA' : 'LIVE SIGNAL DETECTED'}</span>
              </div>
              <div className="wave-viz large">
                {testWave.map((h, i) => (
                  <motion.div 
                    key={i} 
                    className="wave-bar" 
                    style={{ height: `${h * 3}px`, background: '#a29bfe' }}
                    animate={{ height: [h*2.5, h*3.5, h*2.5] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>

            <div className="classifier-actions">
              <p>{language === 'es' ? '¿Qué está sintiendo Zog?' : 'What is Zog feeling?'}</p>
              <div className="btn-group">
                <button onClick={() => handleClassify('Happy')} className="choice-btn happy">😊 {language === 'es' ? 'Feliz' : 'Happy'}</button>
                <button onClick={() => handleClassify('Angry')} className="choice-btn angry">💢 {language === 'es' ? 'Enojado' : 'Angry'}</button>
                <button onClick={() => handleClassify('Hungry')} className="choice-btn hungry">🍔 {language === 'es' ? 'Hambriento' : 'Hungry'}</button>
              </div>
            </div>

            {isCorrect === true && <div className="feedback correct">✨ {language === 'es' ? '¡Increíble! Has entrenado a la IA correctamente.' : 'Amazing! You trained the AI correctly.'}</div>}
            {isCorrect === false && <div className="feedback wrong">❌ {language === 'es' ? 'Patrón no coincide. ¡Mira los datos otra vez!' : 'Pattern mismatch. Check the data again!'}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ml-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .lab-step { width: 100%; max-width: 800px; display: flex; flex-direction: column; align-items: center; gap: 40px; text-align: center; }
        
        .zog-intro { display: flex; align-items: center; gap: 30px; background: rgba(255,255,255,0.03); padding: 30px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .zog-avatar { width: 150px; height: 150px; border-radius: 20px; box-shadow: 0 0 30px rgba(108, 92, 231, 0.3); }
        .zog-speech { flex: 1; text-align: left; font-size: 18px; font-weight: 600; line-height: 1.5; color: #a29bfe; }

        .concept-card { background: rgba(108, 92, 231, 0.1); border: 1px solid rgba(108, 92, 231, 0.2); padding: 30px; border-radius: 24px; }
        .card-icon { color: #6c5ce7; margin-bottom: 15px; }

        .training-center { width: 100%; }
        .data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px; }
        .data-card { background: #151525; padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .data-card label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.4); margin-bottom: 15px; display: block; }
        
        .wave-viz { display: flex; align-items: flex-end; justify-content: center; gap: 6px; height: 100px; }
        .wave-bar { width: 8px; border-radius: 4px; }
        .wave-viz.large { height: 200px; gap: 15px; }
        .wave-viz.large .wave-bar { width: 20px; border-radius: 10px; }

        .live-signal { width: 100%; background: #000; border: 2px solid #a29bfe; border-radius: 30px; padding: 40px; box-shadow: 0 0 50px rgba(162, 155, 254, 0.2); }
        .signal-header { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; font-weight: 800; font-size: 12px; color: #00d1b2; letter-spacing: 2px; }

        .classifier-actions { margin-top: 20px; }
        .btn-group { display: flex; gap: 20px; margin-top: 20px; }
        .choice-btn { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 15px 30px; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .choice-btn:hover { transform: translateY(-3px); background: #6c5ce7; border-color: #6c5ce7; }

        .feedback { margin-top: 30px; font-size: 20px; font-weight: 800; padding: 20px 40px; border-radius: 20px; }
        .feedback.correct { background: rgba(0, 209, 178, 0.1); color: #00d1b2; border: 1px solid #00d1b2; }
        .feedback.wrong { background: rgba(255, 118, 117, 0.1); color: #ff7675; border: 1px solid #ff7675; }

        .mission-btn { background: #6c5ce7; color: white; border: none; padding: 18px 48px; border-radius: 18px; font-size: 18px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3); transition: all 0.2s; }
        .mission-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(108, 92, 231, 0.4); }

        @media (max-width: 768px) {
          .ml-lab { padding: 10px; }
          .lab-step { gap: 25px; }
          .zog-intro { flex-direction: column; gap: 15px; padding: 20px; text-align: center; }
          .zog-avatar { width: 100px; height: 100px; }
          .zog-speech { text-align: center; font-size: 15px; }
          .data-grid { grid-template-columns: 1fr; gap: 12px; }
          .wave-viz.large { height: 120px; }
          .wave-viz.large .wave-bar { width: 14px; }
          .btn-group { flex-direction: column; gap: 10px; }
          .choice-btn { width: 100%; padding: 14px; }
          .mission-btn { width: 100%; max-width: 300px; padding: 16px; font-size: 16px; }
          .feedback { font-size: 16px; padding: 15px 20px; }
          .live-signal { padding: 20px; }
        }
      `}</style>
    </div>
  );
};
