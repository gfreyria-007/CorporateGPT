import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Rocket, Cpu, MessageSquare, Terminal, Save, Play } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module23_FinalProject: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor, userName } = useApp();
  const [view, setView] = useState<'intro' | 'build' | 'test'>('intro');
  const [config, setConfig] = useState({
    name: '',
    role: 'A friendly robot',
    temp: 0.7,
  });
  const [chat, setChat] = useState<{ role: string, text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 24, completedModules: ['23'] });
    onComplete();
  };

  const testAI = async (msg: string) => {
    setLoading(true);
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    
    try {
      const prompt = `You are an AI named ${config.name}. Your role is: ${config.role}. 
      The person talking to you is ${userName}.
      Behave exactly like your role describes!`;
      
      const resp = await callProfessor(`${prompt}\n\nUser says: ${msg}`, { temperature: config.temp });
      setChat(prev => [...prev, { role: 'ai', text: resp }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'ai', text: "Beep boop! My brain is still warming up." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="final-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Rocket size={80} color="#6c5ce7" />
              <h3>The Final Project! 🚀</h3>
              <p>You have learned all the secrets of AI! Now it's time for the ultimate test. 
              You are going to build **Your Very Own AI App** from scratch!</p>
              <button className="next-btn" onClick={() => setView('build')}>Enter the Lab! 🧪</button>
            </div>
          </motion.div>
        )}

        {view === 'build' && (
          <motion.div key="build" className="step-container" initial={{ y: 50 }} animate={{ y: 0 }}>
            <div className="build-card">
              <h3>Vibe Coding Studio 🎨</h3>
              <p>Configure your AI's brain and personality!</p>
              
              <div className="config-form">
                <div className="form-item">
                  <label>Name your AI</label>
                  <input 
                    type="text" 
                    placeholder="Ex: RoboHelper, MagicPanda..." 
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>

                <div className="form-item">
                  <label>Give it a Role ( Costume )</label>
                  <textarea 
                    placeholder="Ex: A master chef who loves pizza, or a space cat..."
                    value={config.role}
                    onChange={(e) => setConfig({...config, role: e.target.value})}
                  />
                </div>

                <div className="form-item">
                  <label>Creativity ( Temperature )</label>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={config.temp}
                    onChange={(e) => setConfig({...config, temp: parseFloat(e.target.value)})}
                  />
                  <div className="temp-val">{config.temp === 0 ? "Predictable ❄️" : config.temp === 1 ? "Wild! 🔥" : "Balanced ⚖️"}</div>
                </div>
              </div>

              <button 
                className="build-btn" 
                disabled={!config.name || !config.role}
                onClick={() => setView('test')}
              >
                Assemble AI! <Cpu size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {view === 'test' && (
          <motion.div key="test" className="step-container" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <div className="test-card">
              <div className="test-header">
                <div className="ai-status">🟢 {config.name} is ONLINE</div>
                <button className="back-btn" onClick={() => setView('build')}>Edit Config</button>
              </div>

              <div className="chat-area">
                {chat.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.role}`}>
                    {m.text}
                  </div>
                ))}
                {loading && <div className="chat-bubble ai loading">...</div>}
                {chat.length === 0 && <div className="placeholder">Say hello to your new creation!</div>}
              </div>

              <div className="chat-input-bar">
                <input 
                  type="text" 
                  placeholder="Type something..." 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      testAI((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
              </div>

              {chat.length >= 2 && (
                <motion.div className="completion-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Sparkles size={30} color="#f9d423" />
                  <p>Congratulations! You just built an AI App!</p>
                  <button className="finish-btn" onClick={handleComplete}>Finish Project! 🎓</button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .final-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .build-card, .test-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .config-form { width: 100%; display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .form-item label { display: block; font-weight: 800; color: #636e72; font-size: 12px; margin-bottom: 8px; }
        .form-item input[type="text"], .form-item textarea {
          width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-size: 16px;
        }
        .form-item textarea { height: 80px; resize: none; }
        .temp-val { text-align: center; font-size: 12px; font-weight: bold; color: #6c5ce7; margin-top: 5px; }

        .build-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; }
        .build-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .test-card { width: 100%; max-width: 500px; height: 600px; padding: 20px; display: flex; flex-direction: column; }
        .test-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .ai-status { font-family: monospace; font-size: 12px; color: #00b894; font-weight: bold; }
        .back-btn { background: none; border: none; color: #6c5ce7; font-size: 12px; font-weight: bold; cursor: pointer; }

        .chat-area { flex: 1; width: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 10px; background: #f9f9f9; border-radius: 20px; margin-bottom: 15px; }
        .chat-bubble { padding: 12px 18px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.4; text-align: left; }
        .chat-bubble.user { align-self: flex-end; background: #dfe6e9; color: #2d3436; }
        .chat-bubble.ai { align-self: flex-start; background: #6c5ce7; color: white; }
        .chat-bubble.loading { opacity: 0.5; }

        .chat-input-bar { width: 100%; }
        .chat-input-bar input { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #eee; }

        .completion-area { margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; color: #6c5ce7; font-weight: bold; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
      `}</style>
    </div>
  );
};
