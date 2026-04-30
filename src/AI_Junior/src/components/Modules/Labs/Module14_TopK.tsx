import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Filter, ShoppingBasket, Sparkles, CheckCircle, Dice5 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module14_TopK: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [topK, setTopK] = useState(1);
  const [choices, setChoices] = useState<string[]>([]);

  const WORD_POOL = ["Happy", "Sad", "Excited", "Sleepy", "Hungry", "Brave", "Fast", "Silly"];

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 15, completedModules: ['14'] });
    onComplete();
  };

  const getFortune = () => {
    // Simulated Top-K selection
    const pool = WORD_POOL.slice(0, topK);
    const result = pool[Math.floor(Math.random() * pool.length)];
    setChoices([result, ...choices].slice(0, 5));
  };

  return (
    <div className="topk-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <List size={80} color="#6c5ce7" />
              <h3>The Word Bucket! 🪣</h3>
              <p>When AI picks the next word, it looks at a giant list. **Top-K** tells the AI to only look at the top "K" best words. 
              If K is 1, it only picks the very best word every time! If K is 10, it can pick from 10 different words.</p>
              <button className="next-btn" onClick={() => setView('game')}>Fill the Bucket! 🪣</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Top-K Picker</h3>
              <p>Change K to see how many words the AI can choose from!</p>
              
              <div className="bucket-visual">
                <div className="bucket-label">Bucket Size (K): {topK}</div>
                <div className="words-in-bucket">
                  {WORD_POOL.slice(0, topK).map((w, i) => (
                    <motion.div 
                      key={w} 
                      className="bucket-word"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {w}
                    </motion.div>
                  ))}
                </div>
                <ShoppingBasket size={150} color="#6c5ce7" strokeWidth={1} />
              </div>

              <div className="k-controls">
                <button onClick={() => setTopK(1)} className={topK === 1 ? 'active' : ''}>K=1 (Strict)</button>
                <button onClick={() => setTopK(3)} className={topK === 3 ? 'active' : ''}>K=3 (Varied)</button>
                <button onClick={() => setTopK(8)} className={topK === 8 ? 'active' : ''}>K=8 (Wild!)</button>
              </div>

              <button className="next-btn" onClick={() => setView('app')}>Try the Fortune Teller! 🔮</button>
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The AI Fortune Teller 🔮</h3>
              <p>Click the crystal ball to see your future. Change K to see what happens!</p>
              
              <div className="app-layout">
                <div className="settings">
                  <label>Bucket Size (K)</label>
                  <input type="range" min="1" max="8" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} />
                  <span>{topK === 1 ? "Only 1 Choice" : `${topK} Choices`}</span>
                </div>

                <button className="fortune-btn" onClick={getFortune}>
                  <Dice5 size={30} />
                  Tell my Fortune!
                </button>

                <div className="fortunes-list">
                  {choices.map((c, i) => (
                    <motion.div 
                      key={i} 
                      className="fortune-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      "Today you will feel <strong>{c}</strong>!"
                    </motion.div>
                  ))}
                  {choices.length === 0 && <p className="hint">Click the ball! ✨</p>}
                </div>
              </div>

              <div className="insight-box">
                <CheckCircle size={20} color="#00b894" />
                <p>{topK === 1 ? "At K=1, the result is always the same! Borrr-ing!" : "With a larger K, the AI can pick different words every time!"}</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Top-K Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .topk-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .bucket-visual { position: relative; height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
        .bucket-label { position: absolute; top: 0; font-weight: 800; color: #6c5ce7; }
        .words-in-bucket { position: absolute; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; width: 200px; padding-bottom: 50px; }
        .bucket-word { background: #f0f0ff; padding: 5px 12px; border-radius: 10px; font-size: 12px; font-weight: bold; border: 1px solid #6c5ce7; color: #6c5ce7; }

        .k-controls { display: flex; gap: 10px; width: 100%; }
        .k-controls button { flex: 1; padding: 12px; border: 2px solid #eee; background: white; border-radius: 12px; cursor: pointer; font-weight: 600; }
        .k-controls button.active { border-color: #6c5ce7; background: #f0f0ff; color: #6c5ce7; }

        .app-layout { width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .fortune-btn { background: #6c5ce7; color: white; border: none; padding: 20px; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 15px; cursor: pointer; font-size: 20px; font-weight: bold; box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3); }
        .fortunes-list { background: #f1f2f6; border-radius: 20px; padding: 20px; min-height: 100px; display: flex; flex-direction: column; gap: 10px; }
        .fortune-item { background: white; padding: 10px 20px; border-radius: 12px; text-align: left; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

        .insight-box { background: #f0fcf9; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 13px; border: 1px solid #c6f6d5; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
      `}</style>
    </div>
  );
};
