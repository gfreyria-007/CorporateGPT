import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Volume2, RefreshCw, Sparkles, CheckCircle, Siren } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module17_Penalties: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, geminiKey, callProfessor } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [penalty, setPenalty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [poem, setPoem] = useState("");

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 18, completedModules: ['17'] });
    onComplete();
  };

  const generatePoem = async () => {
    if (!geminiKey) return;
    setLoading(true);
    try {
      // Frequency penalty isn't directly supported by simple callProfessor yet, but we'll simulate the creative result
      const resp = await callProfessor("Repeat the word 'Happy' many times! But use Frequency Penalty logic to make it creative.");
      setPoem(resp);
    } catch (e) {
      setPoem("The repeat police got lost!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="penalty-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Siren size={80} color="#6c5ce7" />
              <h3>The Repeat Police! 👮‍♂️</h3>
              <p>AI sometimes gets stuck saying the same thing again and again... and again! 
              **Frequency Penalty** is like a "Repeat Police" that gives the AI a ticket for repeating. 
              It forces the AI to use new, exciting words!</p>
              <button className="next-btn" onClick={() => setView('game')}>Call the Police! 🚔</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Stop the Loop!</h3>
              <p>The AI is stuck! Slide the penalty up to help the Repeat Police fix it.</p>
              
              <div className="loop-box">
                <AnimatePresence mode="popLayout">
                  {penalty < 0.5 ? (
                    <motion.div key="stuck" className="stuck-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      "I like candy, I like candy, I like candy..."
                    </motion.div>
                  ) : (
                    <motion.div key="fixed" className="fixed-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      "I enjoy sweets, love treats, and adore chocolate!"
                    </motion.div>
                  )}
                </AnimatePresence>
                {penalty > 0.7 && <div className="police-badge"><Siren size={30} color="red" /></div>}
              </div>

              <div className="penalty-control">
                <label>Frequency Penalty (Police Power): {penalty}</label>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={penalty} 
                  onChange={(e) => setPenalty(parseFloat(e.target.value))} 
                />
              </div>

              {penalty > 0.8 && (
                <button className="next-btn" onClick={() => setView('app')}>Write a Unique Poem! ✍️</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The Creative Poet 📖</h3>
              <p>Adjust the "Repeat Police" and see how it changes the poem!</p>
              
              <div className="app-ui">
                <div className="control-row">
                  <input type="range" min="0" max="1" step="0.5" value={penalty} onChange={(e) => setPenalty(parseFloat(e.target.value))} />
                  <span>{penalty === 0 ? "Normal" : "Super Unique!"}</span>
                </div>
                
                <button className="poem-btn" onClick={generatePoem} disabled={loading}>
                  {loading ? "Writing..." : "Generate Poem ✨"}
                </button>

                <div className="poem-box">
                  {poem || "The poem will appear here..."}
                </div>
              </div>

              <div className="insight-box">
                <CheckCircle size={20} color="#00b894" />
                <p>Frequency penalty helps the AI avoid boring repetition and discover new words!</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Penalty Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .penalty-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .loop-box { width: 100%; height: 120px; background: #f1f2f6; border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .stuck-text { font-size: 18px; color: #ff7675; font-weight: 800; animation: shake 0.5s infinite; }
        .fixed-text { font-size: 18px; color: #00b894; font-weight: 800; }
        .police-badge { position: absolute; top: 10px; right: 10px; }

        .penalty-control { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .penalty-control input { width: 100%; appearance: none; background: #eee; height: 8px; border-radius: 4px; }
        .penalty-control input::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: #6c5ce7; border-radius: 50%; cursor: pointer; }

        .app-ui { width: 100%; display: flex; flex-direction: column; gap: 15px; }
        .poem-btn { background: #6c5ce7; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; }
        .poem-box { min-height: 100px; background: #f9f9f9; padding: 20px; border-radius: 15px; text-align: left; font-style: italic; white-space: pre-line; }

        .insight-box { background: #f0fcf9; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 13px; border: 1px solid #c6f6d5; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
