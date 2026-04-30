import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Lightbulb, CheckCircle, ArrowRight, TrainFront } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module21_ChainOfThought: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [activeStep, setActiveStep] = useState(0);
  const [thoughts, setThoughts] = useState<string[]>([]);

  const STEPS = [
    { text: "1. Read the Question", icon: <Search /> },
    { text: "2. Think of a Plan", icon: <Brain /> },
    { text: "3. Double Check", icon: <Lightbulb /> },
    { text: "4. Final Answer!", icon: <CheckCircle /> },
  ];

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 22, completedModules: ['21'] });
    onComplete();
  };

  const simulateThinking = () => {
    setThoughts([]);
    setTimeout(() => setThoughts(prev => [...prev, "I see 3 red apples and 2 green ones..."]), 500);
    setTimeout(() => setThoughts(prev => [...prev, "Wait, 3 + 2 is... let me count..."]), 1500);
    setTimeout(() => setThoughts(prev => [...prev, "Yes, it's 5! Checking again..."]), 2500);
    setTimeout(() => setThoughts(prev => [...prev, "FINAL ANSWER: There are 5 apples! 🍎"]), 3500);
  };

  return (
    <div className="thought-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Brain size={80} color="#6c5ce7" />
              <h3>The Chain of Thought! 🧠🔗</h3>
              <p>For very hard puzzles, AI can't just guess. It needs to slow down and think step-by-step. 
              This is like "showing your work" in school! It helps the AI avoid mistakes.</p>
              <button className="next-btn" onClick={() => setView('game')}>Start the Logic Train! 🚂</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>The Logic Train</h3>
              <p>Click the train cars in order to help the AI solve the bridge puzzle!</p>
              
              <div className="train-track">
                {STEPS.map((s, i) => (
                  <motion.div 
                    key={i}
                    className={`train-car ${activeStep >= i ? 'active' : ''}`}
                    onClick={() => i === activeStep && setActiveStep(i + 1)}
                    whileHover={i === activeStep ? { scale: 1.1 } : {}}
                  >
                    <div className="car-icon">{s.icon}</div>
                    <div className="car-text">{s.text}</div>
                  </motion.div>
                ))}
              </div>

              <div className="track-status">
                <TrainFront size={40} color="#6c5ce7" />
                <span>{activeStep < 4 ? "Build the train of thoughts..." : "Train is ready to go!"}</span>
              </div>

              {activeStep === 4 && (
                <button className="next-btn" onClick={() => setView('app')}>Try the Math Detective! 🔍</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The Math Detective 🕵️‍♂️</h3>
              <p>Ask the AI a hard question and watch its "Inner Thoughts"!</p>
              
              <div className="detective-ui">
                <div className="problem-bubble">
                  "If I have 3 apples and you give me 2 more, how many do I have?"
                </div>

                <button className="think-btn" onClick={simulateThinking}>Solve Step-by-Step!</button>

                <div className="thoughts-list">
                  <AnimatePresence>
                    {thoughts.map((t, i) => (
                      <motion.div 
                        key={i} 
                        className={`thought-bubble ${i === thoughts.length - 1 ? 'latest' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="bubble-icon">💭</div>
                        <div className="bubble-text">{t}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {thoughts.length === 4 && (
                <div className="insight-box">
                  <Lightbulb size={20} color="#f9d423" />
                  <p>Thinking step-by-step makes the AI much smarter and less likely to mess up!</p>
                </div>
              )}

              <button className="finish-btn" onClick={handleComplete}>Logic Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .thought-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .train-track { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .train-car { 
          padding: 15px; background: #f8f9fa; border: 2px solid #eee; border-radius: 15px; 
          display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.2s;
        }
        .train-car.active { border-color: #6c5ce7; background: #f0f0ff; color: #6c5ce7; }
        .car-icon { color: #6c5ce7; }
        .car-text { font-weight: 800; font-size: 14px; }

        .track-status { display: flex; align-items: center; gap: 15px; font-weight: bold; color: #6c5ce7; }

        .detective-ui { width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .problem-bubble { background: #f1f2f6; padding: 20px; border-radius: 20px; font-weight: 800; font-size: 16px; border: 2px dashed #ccc; }
        .think-btn { background: #6c5ce7; color: white; border: none; padding: 15px; border-radius: 15px; font-weight: bold; cursor: pointer; }

        .thoughts-list { display: flex; flex-direction: column; gap: 10px; min-height: 200px; background: #f9f9f9; padding: 20px; border-radius: 20px; text-align: left; }
        .thought-bubble { display: flex; gap: 10px; font-size: 13px; color: #636e72; padding: 10px; background: white; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .thought-bubble.latest { background: #f0f0ff; color: #6c5ce7; font-weight: bold; }

        .insight-box { background: #fffbe6; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 13px; border: 1px solid #ffe58f; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
      `}</style>
    </div>
  );
};
