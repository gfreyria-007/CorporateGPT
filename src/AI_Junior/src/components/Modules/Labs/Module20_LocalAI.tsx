import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudOff, Cpu, Laptop, ShieldCheck, Zap, MessageCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module20_LocalAI: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [isOnline, setIsOnline] = useState(true);
  const [petHappy, setPetHappy] = useState(50);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 21, completedModules: ['20'] });
    onComplete();
  };

  return (
    <div className="local-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Cpu size={80} color="#6c5ce7" />
              <h3>The Pet AI! 🐶</h3>
              <p>Most AI lives on giant computers far away in the "Cloud." But some AI can live right here on your computer! 
              This is called a **Local AI**. It's fast, private, and works even without the internet!</p>
              <button className="next-btn" onClick={() => setView('game')}>Adopt a Local AI! 💻</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Pet Care</h3>
              <p>Turn OFF the internet and see if your Local AI Pet stays awake!</p>
              
              <div className="pet-visual">
                <motion.div 
                  className="pet-box"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Cpu size={100} color={isOnline ? "#6c5ce7" : "#00b894"} />
                  <div className="pet-eyes">👀</div>
                </motion.div>
                
                <div className="status-bars">
                  <div className="status">Internet: {isOnline ? "🌐 ONLINE" : "❌ OFFLINE"}</div>
                  <div className="status">Power: ⚡️ 100%</div>
                </div>
              </div>

              <button 
                className={`toggle-btn ${!isOnline ? 'offline' : ''}`} 
                onClick={() => setIsOnline(!isOnline)}
              >
                {isOnline ? "Cut the Internet! ✂️" : "Internet is OFF!"}
              </button>

              {!isOnline && (
                <motion.div className="success-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ShieldCheck color="#00b894" />
                  <span>Look! The pet is still awake! It lives on your computer!</span>
                  <button className="next-btn" onClick={() => setView('app')}>Private Chat Time! 💬</button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The Private Pet Chat 💬</h3>
              <p>This chat stays 100% on this computer. No one else can see your secrets!</p>
              
              <div className="local-chat-window">
                <div className="status-tag">🔒 LOCAL MODE (ENCRYPTED)</div>
                <div className="chat-bubbles">
                  <div className="bubble ai">"Hello! I am your local pet AI. I don't need the internet to be your friend!"</div>
                  <div className="bubble user">"Is it true you stay only on my laptop?"</div>
                  <div className="bubble ai">"Yes! Your data stays right here in my digital house. 🏠"</div>
                </div>
              </div>

              <div className="privacy-perks">
                <div className="perk"><Zap size={20} /> <strong>Super Fast</strong></div>
                <div className="perk"><ShieldCheck size={20} /> <strong>100% Private</strong></div>
                <div className="perk"><CloudOff size={20} /> <strong>Works Offline</strong></div>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Local Hero! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .local-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .pet-visual { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 20px; }
        .pet-box { position: relative; width: 150px; height: 150px; background: #f1f2f6; border-radius: 30px; display: flex; align-items: center; justify-content: center; border: 4px solid #eee; }
        .pet-eyes { position: absolute; top: 40px; font-size: 20px; }

        .status-bars { display: flex; gap: 15px; font-weight: 800; font-size: 12px; }
        .status { background: #eee; padding: 5px 10px; border-radius: 10px; }

        .toggle-btn { background: #ff7675; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
        .toggle-btn.offline { background: #00b894; }

        .local-chat-window { width: 100%; height: 200px; background: #2d3436; border-radius: 20px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .status-tag { font-size: 10px; color: #00ff00; font-family: monospace; text-align: left; }
        .chat-bubbles { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
        .bubble { padding: 10px 15px; border-radius: 12px; font-size: 12px; max-width: 80%; }
        .bubble.ai { background: #6c5ce7; color: white; align-self: flex-start; text-align: left; }
        .bubble.user { background: #f1f2f6; color: #2d3436; align-self: flex-end; text-align: right; }

        .privacy-perks { display: flex; justify-content: space-between; width: 100%; }
        .perk { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 10px; color: #636e72; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
        .success-msg { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #00b894; font-weight: bold; }
      `}</style>
    </div>
  );
};
