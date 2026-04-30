import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Scissors, Puzzle, CheckCircle, Zap } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module8_Tokens: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [tokens, setTokens] = useState<string[]>([]);
  const [sentence] = useState("The Happy Robot");
  const [tokenBlocks, setTokenBlocks] = useState<{ id: number, text: string, color: string }[]>([]);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 9, completedModules: ['8'] });
    onComplete();
  };

  const breakSentence = () => {
    // Simulated tokenization
    setTokens(["The", " Hap", "py", " Ro", "bot"]);
  };

  const addBlock = (text: string, color: string) => {
    setTokenBlocks([...tokenBlocks, { id: Date.now(), text, color }]);
  };

  return (
    <div className="tokens-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Layers size={80} color="#6c5ce7" />
              <h3>Word Legos! 🧱</h3>
              <p>AI doesn't read words like you do. It breaks them into small pieces called **Tokens**. It's like building words with Legos!</p>
              <button className="next-btn" onClick={() => setView('game')}>Start the Token Breaker! ✂️</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Token Breaker</h3>
              <p>Click the scissors to see how the AI breaks this sentence!</p>
              
              <div className="sentence-display">
                <h2>{sentence}</h2>
              </div>

              <div className="tokens-result">
                {tokens.map((t, i) => (
                  <motion.div 
                    key={i} 
                    className="token-chip"
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {t}
                  </motion.div>
                ))}
              </div>

              {tokens.length === 0 ? (
                <button className="action-btn" onClick={breakSentence}><Scissors /> Break into Tokens!</button>
              ) : (
                <button className="next-btn" onClick={() => setView('app')}>Build with Tokens! 🏗️</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>Token Builder 🛠️</h3>
              <p>Pick the pieces to build the word **"UNSTOPPABLE"**!</p>
              
              <div className="token-pool">
                <button onClick={() => addBlock("un", "#ff7675")} className="pool-btn">un</button>
                <button onClick={() => addBlock("stop", "#74b9ff")} className="pool-btn">stop</button>
                <button onClick={() => addBlock("pable", "#55efc4")} className="pool-btn">pable</button>
                <button onClick={() => addBlock("xyz", "#dfe6e9")} className="pool-btn">xyz</button>
              </div>

              <div className="builder-area">
                <div className="target-shadow">UNSTOPPABLE</div>
                <div className="blocks-row">
                  {tokenBlocks.map(b => (
                    <motion.div 
                      key={b.id} 
                      className="token-block" 
                      style={{ background: b.color }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      {b.text}
                    </motion.div>
                  ))}
                </div>
              </div>

              {tokenBlocks.length >= 3 && tokenBlocks[0].text === "un" && (
                <div className="success-msg">
                  <CheckCircle color="#00b894" />
                  <span>You built it! You are a Token Master!</span>
                </div>
              )}

              <button className="finish-btn" onClick={handleComplete}>Graduation! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .tokens-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
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

        .sentence-display {
          padding: 20px 40px;
          background: #f1f2f6;
          border-radius: 20px;
          border: 2px dashed #6c5ce7;
        }

        .tokens-result { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; justify-content: center; }
        .token-chip {
          padding: 10px 20px;
          background: #6c5ce7;
          color: white;
          border-radius: 12px;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
        }

        .token-pool { display: flex; gap: 10px; margin-bottom: 20px; }
        .pool-btn {
          padding: 15px;
          border: none;
          border-radius: 12px;
          background: #f1f2f6;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pool-btn:hover { background: #dfe6e9; transform: translateY(-3px); }

        .builder-area {
          width: 100%;
          height: 120px;
          background: #f9f9f9;
          border-radius: 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .target-shadow {
          position: absolute;
          font-size: 40px;
          font-weight: 900;
          color: rgba(0,0,0,0.05);
          letter-spacing: 5px;
        }

        .blocks-row { display: flex; gap: 2px; position: relative; z-index: 2; }
        .token-block {
          padding: 20px;
          color: white;
          font-weight: 800;
          border-radius: 8px;
          box-shadow: inset 0 -4px 0 rgba(0,0,0,0.2);
        }

        .success-msg { display: flex; align-items: center; gap: 10px; color: #00b894; font-weight: bold; }

        .action-btn, .next-btn, .finish-btn {
          background: #6c5ce7;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 15px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};
