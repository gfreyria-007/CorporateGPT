import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Package, AlertCircle, CheckCircle, Brain, ArrowUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module9_Context: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [backpack, setBackpack] = useState<string[]>([]);
  const [maxSize] = useState(5);
  const [memoryItems, setMemoryItems] = useState<{ id: number, text: string }[]>([]);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 10, completedModules: ['9'] });
    onComplete();
  };

  const addItem = (item: string) => {
    if (backpack.length >= maxSize) {
      // Shift out the oldest memory
      setBackpack([...backpack.slice(1), item]);
    } else {
      setBackpack([...backpack, item]);
    }
  };

  const addMemory = (text: string) => {
    const newItem = { id: Date.now(), text };
    setMemoryItems([...memoryItems, newItem]);
  };

  return (
    <div className="context-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Briefcase size={80} color="#6c5ce7" />
              <h3>The Memory Backpack! 🎒</h3>
              <p>AI has a "Backpack" of memory called a **Context Window**. It can only carry a certain amount of tokens. If the backpack gets too full, the AI starts to forget the oldest things!</p>
              <button className="next-btn" onClick={() => setView('game')}>Let's pack the backpack! 🎒</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Memory Tetris</h3>
              <p>Click items to pack them. Watch what happens when you reach 5!</p>
              
              <div className="backpack-visual">
                <div className="backpack-outline">
                  <AnimatePresence>
                    {backpack.map((item, i) => (
                      <motion.div 
                        key={`${item}-${i}`} 
                        className="packed-item"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="backpack-base"><Briefcase size={100} /></div>
              </div>

              <div className="items-selector">
                <button onClick={() => addItem("🍎 Apple")} className="item-btn">Apple</button>
                <button onClick={() => addItem("🐶 Dog")} className="item-btn">Dog</button>
                <button onClick={() => addItem("🚀 Rocket")} className="item-btn">Rocket</button>
                <button onClick={() => addItem("🍕 Pizza")} className="item-btn">Pizza</button>
                <button onClick={() => addItem("⭐️ Star")} className="item-btn">Star</button>
                <button onClick={() => addItem("🧸 Bear")} className="item-btn">Bear</button>
              </div>

              {backpack.length >= maxSize && (
                <div className="warning-note">
                  <AlertCircle color="#ff7675" />
                  <span>The backpack is full! The oldest item fell out!</span>
                </div>
              )}

              {backpack.length >= maxSize && (
                <button className="next-btn" onClick={() => setView('app')}>Test the AI Memory! 🧠</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The Memory Lab 🧪</h3>
              <p>Tell the AI secrets. If you tell too many, it will forget the first one!</p>
              
              <div className="memory-flow">
                <div className="input-group">
                  <input id="mem-input" type="text" placeholder="Tell a secret..." />
                  <button onClick={() => {
                    const input = document.getElementById('mem-input') as HTMLInputElement;
                    if (input.value) {
                      addMemory(input.value);
                      input.value = "";
                    }
                  }}>Remember! <ArrowUp size={16} /></button>
                </div>

                <div className="memories-list">
                  {memoryItems.map((m, i) => (
                    <motion.div 
                      key={m.id} 
                      className={`memory-node ${i === 0 && memoryItems.length > 5 ? 'fading' : ''}`}
                      layout
                    >
                      {m.text}
                      {i === 0 && memoryItems.length > 5 && <span className="forget-tag">Forgetting...</span>}
                    </motion.div>
                  ))}
                </div>
              </div>

              {memoryItems.length > 5 && (
                <div className="insight-box">
                  <Brain size={30} />
                  <p>See? The AI's context window is full. It's forgetting your first secret to make room for new ones!</p>
                </div>
              )}

              <button className="finish-btn" onClick={handleComplete}>Memory Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .context-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
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

        .backpack-visual {
          position: relative;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
        }

        .backpack-outline {
          width: 200px;
          height: 200px;
          border: 4px dashed #6c5ce7;
          border-radius: 20px;
          margin-bottom: -10px;
          display: flex;
          flex-direction: column-reverse;
          padding: 10px;
          gap: 5px;
          overflow: hidden;
          background: rgba(108, 92, 231, 0.05);
        }

        .packed-item {
          background: #6c5ce7;
          color: white;
          padding: 10px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 14px;
        }

        .backpack-base { color: #6c5ce7; opacity: 0.2; }

        .items-selector { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .item-btn {
          padding: 10px 15px;
          background: #f1f2f6;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
        }

        .warning-note { display: flex; align-items: center; gap: 10px; color: #ff7675; font-weight: bold; }

        .memory-flow { width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .input-group { display: flex; gap: 10px; }
        .input-group input { flex: 1; padding: 12px; border: 2px solid #eee; border-radius: 12px; }
        .input-group button { background: #6c5ce7; color: white; border: none; padding: 0 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }

        .memories-list { display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto; padding: 10px; background: #f9f9f9; border-radius: 15px; }
        .memory-node {
          padding: 12px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          text-align: left;
          position: relative;
        }

        .memory-node.fading { opacity: 0.4; filter: blur(1px); }
        .forget-tag { position: absolute; right: 10px; font-size: 10px; background: #ff7675; color: white; padding: 2px 6px; border-radius: 4px; }

        .insight-box { background: #f0f0ff; padding: 20px; border-radius: 20px; border: 1px solid #6c5ce7; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 14px; }

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
