import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Sword, Stethoscope, Rocket, MessageCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { callGemini } from '../../../services/gemini';

export const Module10_Roles: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [selectedRole, setSelectedRole] = useState<{ id: string, name: string, icon: any, prompt: string } | null>(null);
  const [chatResp, setChatResp] = useState("");
  const [loading, setLoading] = useState(false);

  const ROLES = [
    { id: 'pirate', name: 'Salty Pirate', icon: <Sword />, prompt: "Act like a friendly pirate who says 'Arrgh' and talks about treasure." },
    { id: 'doctor', name: 'Kind Doctor', icon: <Stethoscope />, prompt: "Act like a very kind doctor who cares about health and hygiene." },
    { id: 'astronaut', name: 'Space Explorer', icon: <Rocket />, prompt: "Act like an astronaut who is currently on Mars and loves stars." },
  ];

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 11, completedModules: ['10'] });
    onComplete();
  };

  const testRole = async (userMsg: string) => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const resp = await callProfessor(
        `${selectedRole.prompt} Answer this: ${userMsg}`
      );
      setChatResp(resp);
    } catch (e) {
      setChatResp("Oops! The role-playing magic got tangled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="roles-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <UserCircle size={80} color="#6c5ce7" />
              <h3>The AI Costume Party! 🎭</h3>
              <p>Did you know you can tell the AI to act like someone else? It's like giving it a costume! You can tell it to be a Pirate, a Scientist, or even a Talking Cat!</p>
              <button className="next-btn" onClick={() => setView('game')}>Choose a costume! 🎩</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Role Dress-Up</h3>
              <p>Pick a costume for the AI and see its "Role Instructions"!</p>
              
              <div className="roles-grid">
                {ROLES.map(r => (
                  <motion.button 
                    key={r.id} 
                    className={`role-card ${selectedRole?.id === r.id ? 'active' : ''}`}
                    onClick={() => setSelectedRole(r)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="role-icon">{r.icon}</div>
                    <span>{r.name}</span>
                  </motion.button>
                ))}
              </div>

              {selectedRole && (
                <motion.div className="role-preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h4>Current System Role:</h4>
                  <p>"{selectedRole.prompt}"</p>
                  <button className="next-btn" onClick={() => setView('app')}>Chat with the {selectedRole.name}! 💬</button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The Role Chat 💬</h3>
              <p>Ask the <strong>{selectedRole?.name}</strong> anything!</p>
              
              <div className="chat-window">
                <div className="ai-message">
                  <div className="avatar">{selectedRole?.icon}</div>
                  <div className="text-bubble">
                    {loading ? "..." : chatResp || `Arrgh! Hello there, young matey! (or whatever a ${selectedRole?.name} says!)`}
                  </div>
                </div>
              </div>

              <div className="chat-input-group">
                <input 
                  type="text" 
                  placeholder={`Say hi to the ${selectedRole?.name}...`} 
                  onKeyPress={(e) => e.key === 'Enter' && testRole((e.target as HTMLInputElement).value)}
                />
                <button onClick={() => testRole("Hello!")}><MessageCircle size={20} /></button>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Role Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .roles-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
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

        .roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; width: 100%; }
        .role-card {
          padding: 20px;
          background: #f8f9fa;
          border: 2px solid #eee;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          color: #2d3436;
        }
        .role-card.active { border-color: #6c5ce7; background: #f0f0ff; color: #6c5ce7; }
        .role-icon { color: #6c5ce7; }

        .role-preview { background: #f1f2f6; padding: 20px; border-radius: 20px; border-left: 5px solid #6c5ce7; text-align: left; }
        .role-preview h4 { margin-top: 0; color: #636e72; font-size: 12px; }
        .role-preview p { font-style: italic; color: #2d3436; font-size: 14px; }

        .chat-window { width: 100%; height: 150px; background: #f9f9f9; border-radius: 20px; padding: 20px; overflow-y: auto; }
        .ai-message { display: flex; gap: 15px; }
        .avatar { width: 40px; height: 40px; background: #6c5ce7; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .text-bubble { background: white; padding: 15px; border-radius: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); flex: 1; text-align: left; font-size: 14px; }

        .chat-input-group { display: flex; width: 100%; gap: 10px; margin-top: 10px; }
        .chat-input-group input { flex: 1; padding: 12px; border: 2px solid #eee; border-radius: 12px; }
        .chat-input-group button { background: #6c5ce7; color: white; border: none; padding: 0 15px; border-radius: 12px; cursor: pointer; }

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
