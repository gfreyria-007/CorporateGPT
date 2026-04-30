import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Target, Percent, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module15_TopP: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [pVal, setPVal] = useState(0.5);
  const [score, setScore] = useState(0);

  const OPTIONS = [
    { word: "Sun", p: 0.5, color: "#f9d423" },
    { word: "Cloud", p: 0.2, color: "#4facfe" },
    { word: "Rain", p: 0.15, color: "#00b894" },
    { word: "Snow", p: 0.1, color: "#a29bfe" },
    { word: "Storm", p: 0.05, color: "#ff7675" },
  ];

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 16, completedModules: ['15'] });
    onComplete();
  };

  return (
    <div className="topp-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Cloud size={80} color="#4facfe" />
              <h3>The Probability Cloud! ☁️</h3>
              <p>Top-P (also called **Nucleus Sampling**) is a smart way to pick words. 
              Instead of picking a fixed number of words, the AI adds up the "Probability Points" of the best words until it has enough! 
              It's like filling a bucket until it's 90% full of the best choices.</p>
              <button className="next-btn" onClick={() => setView('game')}>Catch the Cloud! ☁️</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Probability Meter</h3>
              <p>Add words to fill the meter to exactly **0.9 (90%)**!</p>
              
              <div className="meter-visual">
                <div className="meter-label">Total Probability: {score.toFixed(2)}</div>
                <div className="meter-bar">
                  <motion.div 
                    className="meter-fill" 
                    animate={{ width: `${score * 100}%` }}
                    style={{ background: score > 0.9 ? '#ff7675' : '#00b894' }}
                  />
                  <div className="target-line" style={{ left: '90%' }} />
                </div>
              </div>

              <div className="words-grid">
                {OPTIONS.map(opt => (
                  <button 
                    key={opt.word} 
                    className="word-pick-btn"
                    style={{ borderBottom: `4px solid ${opt.color}` }}
                    onClick={() => setScore(s => s + opt.p)}
                  >
                    <strong>{opt.word}</strong>
                    <span>+{opt.p} pts</span>
                  </button>
                ))}
              </div>

              {score >= 0.9 && score < 1.0 && (
                <div className="success-toast">
                  <CheckCircle /> Perfect! You caught the Nucleus!
                  <button className="next-btn" onClick={() => setView('app')}>Try the Smart Filter! 🧪</button>
                </div>
              )}

              <button className="reset-btn" onClick={() => setScore(0)}>Reset Meter</button>
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The Nucleus Filter 🔍</h3>
              <p>Change Top-P to see which words the AI considers "Safe" to pick!</p>
              
              <div className="nucleus-app">
                <div className="p-selector">
                  <label>Top-P Value: {pVal.toFixed(1)}</label>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={pVal} 
                    onChange={(e) => setPVal(parseFloat(e.target.value))} 
                  />
                </div>

                <div className="cloud-visualization">
                  {OPTIONS.map((opt, i) => {
                    // Calculate cumulative probability
                    const cumulative = OPTIONS.slice(0, i + 1).reduce((acc, curr) => acc + curr.p, 0);
                    const isActive = cumulative <= pVal || (i > 0 && OPTIONS.slice(0, i).reduce((acc, curr) => acc + curr.p, 0) < pVal);
                    
                    return (
                      <motion.div 
                        key={opt.word} 
                        className={`cloud-word ${isActive ? 'active' : 'dim'}`}
                        animate={{ scale: isActive ? 1.1 : 0.8, opacity: isActive ? 1 : 0.3 }}
                      >
                        {opt.word} ({opt.p})
                      </motion.div>
                    );
                  })}
                </div>

                <div className="explanation-bubble">
                  {pVal < 0.3 ? "At low P, AI only picks the absolute most certain word." : "At high P, AI includes more 'maybe' words in its choice cloud!"}
                </div>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Top-P Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .topp-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .meter-visual { width: 100%; margin-bottom: 20px; }
        .meter-label { font-weight: 800; color: #4facfe; margin-bottom: 10px; }
        .meter-bar { width: 100%; height: 30px; background: #eee; border-radius: 15px; position: relative; overflow: hidden; border: 3px solid #eee; }
        .meter-fill { height: 100%; transition: width 0.3s ease; }
        .target-line { position: absolute; top: 0; bottom: 0; width: 4px; background: black; opacity: 0.3; }

        .words-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
        .word-pick-btn {
          padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;
          display: flex; flex-direction: column; gap: 5px; transition: transform 0.1s;
        }
        .word-pick-btn:active { transform: scale(0.95); }
        .word-pick-btn span { font-size: 10px; color: #636e72; }

        .success-toast { margin-top: 20px; background: #f0fcf9; padding: 20px; border-radius: 20px; border: 1px solid #c6f6d5; color: #00b894; font-weight: bold; }

        .nucleus-app { width: 100%; display: flex; flex-direction: column; gap: 30px; }
        .p-selector { display: flex; flex-direction: column; gap: 10px; }
        .p-selector input { width: 100%; appearance: none; background: #eee; height: 10px; border-radius: 5px; outline: none; }
        .p-selector input::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: #4facfe; border-radius: 50%; cursor: pointer; }

        .cloud-visualization { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; min-height: 100px; }
        .cloud-word { padding: 10px 20px; background: white; border: 2px solid #4facfe; border-radius: 50px; font-weight: bold; color: #4facfe; }
        .cloud-word.dim { border-color: #eee; color: #ccc; }

        .explanation-bubble { background: #f0f4f8; padding: 15px; border-radius: 15px; font-size: 14px; text-align: left; }

        .next-btn, .finish-btn, .reset-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .reset-btn { background: #dfe6e9; color: #636e72; }
      `}</style>
    </div>
  );
};
