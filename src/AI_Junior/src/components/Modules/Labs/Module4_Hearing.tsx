import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Activity, CheckCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module4_Hearing: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [waveData, setWaveData] = useState<number[]>(Array(20).fill(10));
  const [step, setStep] = useState(0); 
  const [selectedWave, setSelectedWave] = useState<number | null>(null);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setWaveData(Array(20).fill(0).map(() => Math.random() * 50 + 10));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setWaveData(Array(20).fill(10));
    }
  }, [isListening]);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 5, completedModules: ['4'] });
    onComplete();
  };

  return (
    <div className="hearing-lab">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            className="step-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="explainer-card">
              <div className="icon-pulse">
                <Volume2 size={60} color="#6c5ce7" />
              </div>
              <h3>Sound is Wobbly! 🌊</h3>
              <p>When you speak, your voice makes the air wobble. AI doesn't hear words; it sees these "wobbles" as patterns!</p>
              <button className="next-btn" onClick={() => setStep(1)}>Show me the wobbles! 🚀</button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            className="step-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="game-card">
              <h3>Match the Wobble!</h3>
              <p>Which sound wave looks like a LOUD SHOUT? 📢</p>
              
              <div className="wave-options">
                {[1, 2, 3].map(i => (
                  <motion.button 
                    key={i}
                    className={`wave-btn ${selectedWave === i ? 'selected' : ''}`}
                    onClick={() => setSelectedWave(i)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="static-wave">
                      {Array(10).fill(0).map((_, j) => (
                        <div 
                          key={j} 
                          className="wave-bar" 
                          style={{ height: i === 2 ? `${Math.random() * 80 + 20}%` : `${Math.random() * 30 + 10}%` }} 
                        />
                      ))}
                    </div>
                    <span>Option {i}</span>
                  </motion.button>
                ))}
              </div>

              {selectedWave && (
                <div className="feedback-area">
                  {selectedWave === 2 ? (
                    <div className="success">
                      <CheckCircle color="#00b894" /> 
                      <span>Yes! Loud sounds have BIG wobbles!</span>
                      <button className="next-btn" onClick={() => setStep(2)}>Try the Voice-O-Matic!</button>
                    </div>
                  ) : (
                    <div className="retry">Try again! Look for the tallest waves!</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            className="step-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mini-app-card">
              <h3>The Voice-O-Matic 🎤</h3>
              <p>Speak into the microphone (simulated) and see your voice-print!</p>

              <div className="visualizer">
                {waveData.map((h, i) => (
                  <motion.div 
                    key={i}
                    className="viz-bar"
                    animate={{ height: `${h}%` }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                ))}
              </div>

              <div className="controls">
                <button 
                  className={`mic-btn ${isListening ? 'active' : ''}`}
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? <MicOff /> : <Mic />}
                  {isListening ? "Stop Listening" : "Start Listening"}
                </button>
              </div>

              {isListening && (
                <motion.div 
                  className="ai-transcript"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Activity size={16} />
                  "The AI is turning your wobbles into data..."
                </motion.div>
              )}

              <button className="finish-btn" onClick={handleComplete}>Graduation Time! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hearing-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .icon-pulse {
          width: 120px; height: 120px; background: #f0f0ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;
        }

        .wave-options { display: flex; gap: 15px; width: 100%; margin-top: 20px; }
        .wave-btn {
          flex: 1; height: 150px; background: #f8f9fa; border: 2px solid #eee; border-radius: 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
        }
        .wave-btn.selected { border-color: #6c5ce7; background: #f0f0ff; }

        .static-wave { display: flex; align-items: flex-end; gap: 4px; height: 60px; }
        .wave-bar { width: 6px; background: #6c5ce7; border-radius: 3px; }

        .visualizer { width: 100%; height: 150px; background: #2d3436; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 0 20px; }
        .viz-bar { flex: 1; background: #00ff00; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }

        .mic-btn { display: flex; align-items: center; gap: 10px; padding: 15px 30px; background: #6c5ce7; color: white; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; transition: all 0.3s; }
        .mic-btn.active { background: #d63031; animation: bounce 0.5s infinite; }

        .ai-transcript { background: #f1f2f6; padding: 15px; border-radius: 12px; font-family: monospace; color: #2d3436; display: flex; align-items: center; gap: 10px; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .success { color: #00b894; font-weight: bold; display: flex; flex-direction: column; align-items: center; gap: 10px; }

        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(108, 92, 231, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
        }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
};
