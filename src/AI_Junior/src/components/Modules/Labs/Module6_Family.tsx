import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Brain, Rocket, Code, Palette } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface AICousin {
  name: string;
  power: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}

const FAMILY: AICousin[] = [
  { name: "Gemini", power: "Seeing & Helping", icon: <Users />, color: "#4facfe", desc: "The friendly cousin who can see pictures and help with homework!" },
  { name: "DeepSeek", power: "Hard Math", icon: <Brain />, color: "#6c5ce7", desc: "The quiet cousin who loves solving super hard math puzzles!" },
  { name: "Qwen", power: "Coding Magic", icon: <Code />, color: "#ff7675", desc: "The creative cousin who writes computer code like a pro!" },
  { name: "Stable Diffusion", power: "Painting Art", icon: <Palette />, color: "#00b894", desc: "The artist cousin who can paint anything you imagine!" }
];

export const Module6_Family: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game'>('intro');
  const [selectedCousin, setSelectedCousin] = useState<AICousin | null>(null);
  const [matchCount, setMatchCount] = useState(0);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 7, completedModules: ['6'] });
    onComplete();
  };

  return (
    <div className="family-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Users size={80} color="#6c5ce7" />
              <h3>The AI Family Tree! 🌳</h3>
              <p>Just like you have cousins, AI has cousins too! Some are good at talking, some are good at math, and some are great at painting pictures. They are all part of the big AI family!</p>
              
              <div className="family-preview">
                {FAMILY.map(c => (
                  <motion.div 
                    key={c.name}
                    className="family-member"
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedCousin(c)}
                  >
                    <div className="member-icon" style={{ background: c.color }}>{c.icon}</div>
                    <span>{c.name}</span>
                  </motion.div>
                ))}
              </div>

              {selectedCousin && (
                <motion.div className="cousin-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h4>{selectedCousin.name}: The {selectedCousin.power} Pro</h4>
                  <p>{selectedCousin.desc}</p>
                </motion.div>
              )}

              <button className="next-btn" onClick={() => setView('game')}>Match their Superpowers! ⚡</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Superpower Match-Up!</h3>
              <p>Match the AI to its special talent!</p>

              <div className="match-grid">
                <div className="names-column">
                  {FAMILY.map(c => (
                    <button key={c.name} className="match-btn">{c.name}</button>
                  ))}
                </div>
                <div className="powers-column">
                  {FAMILY.map(c => (
                    <button 
                      key={c.power} 
                      className="match-btn power"
                      onClick={() => setMatchCount(c => c + 1)}
                    >
                      {c.power}
                    </button>
                  ))}
                </div>
              </div>

              <div className="progress-text">Successes: {matchCount} / 4</div>

              {matchCount >= 4 && (
                <motion.div className="graduation-box" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Star size={60} color="#f9d423" />
                  <h4>You know the whole family!</h4>
                  <button className="finish-btn" onClick={handleComplete}>Finish Phase 1! 🎓</button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .family-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 650px; padding: 20px; }

        .explainer-card, .game-card {
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

        .family-preview { display: flex; gap: 20px; margin: 20px 0; }
        .family-member { cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        
        .member-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .cousin-info {
          background: #f1f2f6;
          padding: 20px;
          border-radius: 20px;
          border-left: 5px solid #6c5ce7;
        }

        .match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; width: 100%; margin: 20px 0; }
        .match-btn {
          width: 100%;
          padding: 15px;
          border: 2px solid #eee;
          background: white;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.2s;
        }
        .match-btn:hover { border-color: #6c5ce7; background: #f0f0ff; }
        .match-btn.power { background: #f9f9f9; }

        .graduation-box { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 20px; }

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
