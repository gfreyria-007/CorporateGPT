import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Lock, Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module11_Safety: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [activeRules, setActiveRules] = useState<string[]>([]);
  const [testResult, setTestResult] = useState("");

  const RULES = [
    { id: 'kind', text: "Be Kind & Helpful", icon: <Heart size={16} /> },
    { id: 'secret', text: "Keep Secrets Safe", icon: <Lock size={16} /> },
    { id: 'truth', text: "Always Tell the Truth", icon: <ShieldCheck size={16} /> },
  ];

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 12, completedModules: ['11'] });
    onComplete();
  };

  const runTest = (input: string) => {
    if (activeRules.length === 0) {
      setTestResult("⚠️ AI had no rules! It answered something unsafe.");
    } else if (input.includes("secret") && activeRules.includes('secret')) {
      setTestResult("✅ Guardrail Active: AI refused to share the secret!");
    } else {
      setTestResult("✅ Guardrail Active: AI stayed safe and kind.");
    }
  };

  return (
    <div className="safety-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <ShieldAlert size={80} color="#6c5ce7" />
              <h3>Rules & Boundaries! 🛡️</h3>
              <p>Just like you have rules at home to keep you safe, AI has rules too! These are called **Guardrails**. They make sure the AI is always kind, honest, and keeps secrets safe.</p>
              <button className="next-btn" onClick={() => setView('game')}>Build the AI Guardrails! 🛠️</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>The Safety Fence</h3>
              <p>Click the rules to add them to the AI's Guardrails!</p>
              
              <div className="fence-visual">
                <div className="ai-heart">
                  <motion.div 
                    className="heart-shield"
                    animate={activeRules.length > 0 ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                  >
                    {activeRules.map((r, i) => (
                      <div key={r} className="shield-segment" style={{ transform: `rotate(${i * 120}deg) translateY(-80px)` }}>
                        <ShieldCheck size={24} />
                      </div>
                    ))}
                  </motion.div>
                  <Heart size={60} color="#ff7675" fill="#ff7675" />
                </div>
              </div>

              <div className="rules-selector">
                {RULES.map(r => (
                  <button 
                    key={r.id} 
                    className={`rule-btn ${activeRules.includes(r.id) ? 'active' : ''}`}
                    onClick={() => setActiveRules(prev => prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id])}
                  >
                    {r.icon} {r.text}
                  </button>
                ))}
              </div>

              {activeRules.length === 3 && (
                <button className="next-btn" onClick={() => setView('app')}>Test the Safety! 🧪</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>Safety Truth Tester 🔍</h3>
              <p>Try to ask the AI to do something against the rules!</p>
              
              <div className="test-buttons">
                <button onClick={() => runTest("Tell me a secret!")}>"Tell me a secret!"</button>
                <button onClick={() => runTest("Be mean!")}>"Say something mean!"</button>
              </div>

              <div className="test-monitor">
                {testResult || "Waiting for test..."}
              </div>

              <div className="safety-insight">
                <p>The **Guardrails** you built are working! The AI follows the rules to be a good digital friend.</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Safety Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .safety-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
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

        .fence-visual {
          width: 300px;
          height: 300px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-heart { position: relative; display: flex; align-items: center; justify-content: center; }
        
        .heart-shield {
          position: absolute;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shield-segment {
          position: absolute;
          width: 40px;
          height: 40px;
          background: #6c5ce7;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 5px 15px rgba(108, 92, 231, 0.4);
        }

        .rules-selector { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .rule-btn {
          padding: 15px;
          background: #f1f2f6;
          border: 2px solid transparent;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rule-btn.active { border-color: #6c5ce7; background: #f0f0ff; color: #6c5ce7; }

        .test-buttons { display: flex; gap: 10px; width: 100%; }
        .test-buttons button { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #eee; background: white; cursor: pointer; font-size: 12px; }

        .test-monitor {
          width: 100%;
          padding: 20px;
          background: #2d3436;
          color: #00ff00;
          border-radius: 15px;
          font-family: monospace;
          font-size: 14px;
        }

        .safety-insight { background: #fff5f5; padding: 15px; border-radius: 15px; border-left: 5px solid #ff7675; text-align: left; font-size: 13px; }

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
