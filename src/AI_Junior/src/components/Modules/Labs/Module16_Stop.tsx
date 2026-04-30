import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Octagon, ListChecks } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module16_Stop: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [stopWord, setStopWord] = useState("Blue");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 17, completedModules: ['16'] });
    onComplete();
  };

  const testStop = async () => {
    setLoading(true);
    const prompt = `Write a list of 5 colors, but STOP immediately if you write the word "${stopWord}".`;
    
    try {
      const resp = await callProfessor(prompt, { stopSequences: [stopWord] });
      setResult(resp);
    } catch (e) {
      setResult("The stop light broke!");
    } finally {
      setLoading(false);
    }
  };

  const testOneItem = async () => {
    setLoading(true);
    try {
      const resp = await callProfessor("Give me one single name of a cool gadget.", { stopSequences: ["\n"] });
      setResult(resp);
    } catch (e) {
      setResult("Error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stop-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Octagon size={80} color="#ff7675" fill="#ff7675" />
              <h3>The Red Light! 🛑</h3>
              <p>Sometimes AI talks too much! You can give it a **Stop Sequence**. 
              It's like a "Red Light" word. When the AI sees that word, it stops talking immediately!</p>
              <button className="next-btn" onClick={() => setView('game')}>Set the Red Light! 🛑</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Stop Sequence Race</h3>
              <p>Pick a word. The AI will try to list colors, but it MUST stop when it hits your word!</p>
              
              <div className="word-picker">
                <button onClick={() => setStopWord("Blue")} className={stopWord === "Blue" ? 'active' : ''}>Blue</button>
                <button onClick={() => setStopWord("Red")} className={stopWord === "Red" ? 'active' : ''}>Red</button>
                <button onClick={() => setStopWord("Green")} className={stopWord === "Green" ? 'active' : ''}>Green</button>
              </div>

              <div className="race-track">
                <div className="track-labels">
                  <span>Start</span>
                  <span>Stop Word: {stopWord} 🛑</span>
                </div>
                <div className="track-visual">
                  <motion.div 
                    className="ai-car"
                    animate={loading ? { x: ['0%', '100%'] } : { x: 0 }}
                    transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
                  >
                    🤖🚗
                  </motion.div>
                </div>
              </div>

              <button className="test-btn" onClick={testStop} disabled={loading}>
                {loading ? "Running..." : "Start the AI Race! 🏁"}
              </button>

              <div className="result-display">
                {result || "Waiting for the race..."}
              </div>

              {result && (
                <button className="next-btn" onClick={() => setView('app')}>Bullet Point Master! 📝</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The One-Point Wonder 📝</h3>
              <p>We set the "New Line" as a Stop Sequence. Now the AI can only give you ONE item at a time!</p>
              
              <div className="bullet-app">
                <button className="add-btn" onClick={testOneItem} disabled={loading}>
                  {loading ? "Adding..." : "Add One Random Gadget"}
                </button>
                <div className="bullet-list">
                  {result && <div className="bullet-item">✨ {result}</div>}
                </div>
              </div>

              <div className="insight-box">
                <ListChecks size={20} color="#6c5ce7" />
                <p>By using a Stop Sequence, you can control exactly how long the AI's answer is!</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Stop Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .stop-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .word-picker { display: flex; gap: 10px; width: 100%; }
        .word-picker button { flex: 1; padding: 12px; border: 2px solid #eee; background: white; border-radius: 12px; cursor: pointer; font-weight: 800; }
        .word-picker button.active { border-color: #ff7675; background: #fff5f5; color: #ff7675; }

        .race-track { width: 100%; margin: 20px 0; }
        .track-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: #636e72; margin-bottom: 5px; }
        .track-visual { width: 100%; height: 60px; background: #f1f2f6; border-radius: 30px; position: relative; padding: 10px; border: 2px dashed #ccc; }
        .ai-car { font-size: 30px; position: absolute; }

        .result-display { width: 100%; padding: 15px; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee; min-height: 50px; font-weight: 800; color: #2d3436; }

        .bullet-app { width: 100%; display: flex; flex-direction: column; gap: 15px; }
        .add-btn { background: #6c5ce7; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; }
        .add-btn:disabled { opacity: 0.5; }
        .bullet-list { min-height: 50px; background: #f1f2f6; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .bullet-item { background: white; padding: 10px; border-radius: 8px; text-align: left; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

        .insight-box { background: #f0f0ff; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 13px; border: 1px solid #d1d1ff; }

        .next-btn, .finish-btn, .test-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
        .test-btn:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
};
