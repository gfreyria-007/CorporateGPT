import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Zap, Ghost, Sparkles, Cat, Brain } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { callGemini } from '../../../services/gemini';

export const Module13_Temperature: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [temp, setTemp] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 14, completedModules: ['13'] });
    onComplete();
  };

  const testTemperature = async () => {
    setLoading(true);
    const prompt = `Write a very short description of a cat. 
    Make it ${temp < 0.3 ? 'very normal and boring' : temp > 0.7 ? 'completely wild, crazy, and magical' : 'creative but sensible'}.`;
    
    try {
      const resp = await callProfessor(prompt, { temperature: temp });
      setResult(resp);
    } catch (e) {
      setResult("The creativity dial got stuck!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="temp-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Thermometer size={80} color="#ff7675" />
              <h3>The Creativity Dial! 🌡️</h3>
              <p>AI has a "Crazy Dial" called **Temperature**. 
              When it's low (Cold), the AI is very serious and predictable. 
              When it's high (Hot), the AI gets wild, silly, and very creative!</p>
              <button className="next-btn" onClick={() => setView('game')}>Play with the Dial! 🎛️</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>The Animal Transformer</h3>
              <p>Move the dial to change the AI Cat from Normal to WILD!</p>
              
              <div className="transformation-area">
                <motion.div 
                  className="cat-visual"
                  animate={{ 
                    scale: 1 + temp * 0.5,
                    rotate: temp * 20,
                    filter: `hue-rotate(${temp * 360}deg) saturate(${1 + temp * 2})`
                  }}
                >
                  <Cat size={120} color={temp > 0.8 ? "#ff00ff" : "#6c5ce7"} />
                  {temp > 0.7 && <motion.div className="wings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>🦋</motion.div>}
                  {temp > 0.9 && <motion.div className="hat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>🎩</motion.div>}
                </motion.div>
              </div>

              <div className="dial-container">
                <div className="dial-labels">
                  <span>❄️ Cold (Boring)</span>
                  <span>🔥 Hot (Wild!)</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={temp} 
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="temp-slider"
                />
                <div className="temp-value">Temperature: {temp}</div>
              </div>

              <button className="next-btn" onClick={() => setView('app')}>Try the AI Brain! 🧠</button>
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The AI Description Tuner 🎨</h3>
              <p>Adjust the temperature and see how the AI describes a cat!</p>
              
              <div className="app-controls">
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={temp} 
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                />
                <button className="test-btn" onClick={testTemperature} disabled={loading}>
                  {loading ? "Tuning..." : "Generate Magic! ✨"}
                </button>
              </div>

              <div className="result-bubble">
                {result || "Click the button to see the magic!"}
              </div>

              <div className="insight">
                <Zap size={20} color="#f9d423" />
                <p>{temp < 0.3 ? "At low temp, AI picks the most likely words." : "At high temp, AI takes bigger risks with funny words!"}</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Temperature Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .temp-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .transformation-area {
          width: 100%;
          height: 200px;
          background: #f8f9fa;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .cat-visual { position: relative; display: flex; align-items: center; justify-content: center; }
        .wings { position: absolute; top: -20px; font-size: 40px; }
        .hat { position: absolute; top: -50px; font-size: 30px; }

        .dial-container { width: 100%; padding: 20px; }
        .dial-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: #636e72; margin-bottom: 10px; }
        
        .temp-slider {
          width: 100%;
          height: 15px;
          border-radius: 10px;
          background: linear-gradient(to right, #4facfe, #ff7675);
          appearance: none;
          outline: none;
        }
        .temp-slider::-webkit-slider-thumb {
          appearance: none;
          width: 25px;
          height: 25px;
          background: white;
          border: 3px solid #6c5ce7;
          border-radius: 50%;
          cursor: pointer;
        }

        .temp-value { margin-top: 10px; font-weight: 800; color: #6c5ce7; }

        .app-controls { width: 100%; display: flex; flex-direction: column; gap: 15px; }
        .test-btn { background: #6c5ce7; color: white; border: none; padding: 15px; border-radius: 15px; font-weight: bold; cursor: pointer; }

        .result-bubble {
          width: 100%;
          padding: 20px;
          background: #f1f2f6;
          border-radius: 15px;
          font-style: italic;
          color: #2d3436;
          min-height: 100px;
          text-align: left;
        }

        .insight { display: flex; align-items: center; gap: 15px; background: #fffbe6; padding: 15px; border-radius: 15px; border: 1px solid #ffe58f; text-align: left; font-size: 13px; }

        .next-btn, .finish-btn {
          background: #6c5ce7;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 15px;
          font-weight: bold;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
