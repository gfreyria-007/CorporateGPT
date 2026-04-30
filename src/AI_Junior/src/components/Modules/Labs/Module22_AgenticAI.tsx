import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Wrench, Hammer, Map, Key, Terminal, Play, CheckCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module22_AgenticAI: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [inventory, setInventory] = useState<string[]>([]);
  const [agentStatus, setAgentStatus] = useState("Waiting for tools...");
  const [logs, setLogs] = useState<string[]>([]);

  const TOOLS = [
    { id: 'key', name: 'Magic Key', icon: <Key />, use: "Opening the Locked Gate" },
    { id: 'hammer', name: 'Nano Hammer', icon: <Hammer />, use: "Fixing the Broken Bridge" },
    { id: 'map', name: 'Global Map', icon: <Map />, use: "Finding the Secret Path" },
  ];

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 23, completedModules: ['22'] });
    onComplete();
  };

  const runAgent = async () => {
    setLogs(["[SYSTEM] Initializing Agent...", "[AGENT] Analyzing task: 'Reach the Treasure'"]);
    
    setTimeout(() => {
      if (inventory.includes('map')) {
        setLogs(prev => [...prev, "[AGENT] Using Global Map... Path found!", "[AGENT] Moving to the river..."]);
      } else {
        setLogs(prev => [...prev, "[AGENT] ERROR: I'm lost! I need a Map tool."]);
        return;
      }
    }, 1000);

    setTimeout(() => {
      if (inventory.includes('hammer')) {
        setLogs(prev => [...prev, "[AGENT] Using Nano Hammer... Bridge fixed!", "[AGENT] Crossing the river..."]);
      } else {
        setLogs(prev => [...prev, "[AGENT] ERROR: Bridge is broken. I need a Hammer tool."]);
        return;
      }
    }, 2500);

    setTimeout(() => {
      if (inventory.includes('key')) {
        setLogs(prev => [...prev, "[AGENT] Using Magic Key... Gate opened!", "[AGENT] MISSION COMPLETE: Treasure reached! 💎"]);
        setAgentStatus("Success!");
      } else {
        setLogs(prev => [...prev, "[AGENT] ERROR: Gate is locked. I need a Key tool."]);
      }
    }, 4000);
  };

  return (
    <div className="agent-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Bot size={80} color="#6c5ce7" />
              <h3>AI Agents: The Task Masters! 🤖🛠️</h3>
              <p>AI isn't just for talking anymore! An **Agent** is an AI that can use "Tools" to finish a job. 
              It's like giving a robot a toolbox so it can build a house or fix a car!</p>
              <button className="next-btn" onClick={() => setView('game')}>Give your Agent Tools! 🧰</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>Agent Toolbox</h3>
              <p>Select the tools your agent needs to reach the treasure!</p>
              
              <div className="tools-grid">
                {TOOLS.map(t => (
                  <motion.button 
                    key={t.id} 
                    className={`tool-card ${inventory.includes(t.id) ? 'active' : ''}`}
                    onClick={() => {
                      if (inventory.includes(t.id)) setInventory(inventory.filter(i => i !== t.id));
                      else setInventory([...inventory, t.id]);
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="tool-icon">{t.icon}</div>
                    <div className="tool-name">{t.name}</div>
                    <div className="tool-use">{t.use}</div>
                  </motion.button>
                ))}
              </div>

              <div className="agent-monitor">
                <div className="monitor-header">
                  <Terminal size={16} /> <span>AGENT_LOGS.EXE</span>
                </div>
                <div className="logs">
                  {logs.map((l, i) => (
                    <div key={i} className="log-line">{l}</div>
                  ))}
                  {logs.length === 0 && <div className="placeholder">Ready to execute mission...</div>}
                </div>
              </div>

              <button 
                className="run-btn" 
                onClick={runAgent} 
                disabled={inventory.length === 0 || agentStatus === "Success!"}
              >
                <Play size={20} /> Run Mission
              </button>

              {agentStatus === "Success!" && (
                <button className="next-btn" onClick={() => setView('app')}>Visit the AI Office! 🏢</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The AI Assistant Office 🏢</h3>
              <p>In the future, agents will help you with everything. Ask your agent to plan a party!</p>
              
              <div className="assistant-ui">
                <div className="task-bubble">
                  "Agent, help me plan a space-themed birthday party!"
                </div>

                <div className="agent-thinking">
                  <div className="agent-avatar">🤖</div>
                  <div className="plan-steps">
                    <div className="step-item done"><CheckCircle size={16} /> Searching for venues (Tool: WebSearch)</div>
                    <div className="step-item done"><CheckCircle size={16} /> Calculating costs (Tool: Calculator)</div>
                    <div className="step-item done"><CheckCircle size={16} /> Creating invitations (Tool: ImageGen)</div>
                  </div>
                </div>

                <div className="final-output">
                  "Plan Ready! I found a Planetarium, calculated a $100 budget, and designed 20 moon invitations for you! 🌙"
                </div>
              </div>

              <div className="concept-box">
                <Wrench size={20} color="#6c5ce7" />
                <p>An Agent = AI Brain + Tools + A Goal!</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Agent Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .agent-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 650px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; width: 100%; }
        .tool-card {
          background: #f8f9fa; border: 2px solid #eee; padding: 15px; border-radius: 20px; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .tool-card.active { border-color: #6c5ce7; background: #f0f0ff; }
        .tool-icon { color: #6c5ce7; }
        .tool-name { font-weight: 800; font-size: 12px; }
        .tool-use { font-size: 10px; color: #636e72; line-height: 1.2; }

        .agent-monitor { width: 100%; background: #2d3436; border-radius: 15px; padding: 15px; text-align: left; margin-top: 10px; }
        .monitor-header { display: flex; align-items: center; gap: 8px; color: #636e72; font-size: 10px; font-family: monospace; border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 10px; }
        .logs { height: 120px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 11px; color: #00ff00; line-height: 1.5; }
        .placeholder { color: #636e72; }

        .run-btn { background: #00b894; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .assistant-ui { width: 100%; display: flex; flex-direction: column; gap: 15px; }
        .task-bubble { background: #f1f2f6; padding: 15px; border-radius: 15px; font-weight: 800; font-size: 14px; text-align: left; }
        .agent-thinking { display: flex; gap: 15px; align-items: flex-start; padding: 10px; background: #f9f9f9; border-radius: 15px; }
        .agent-avatar { font-size: 24px; }
        .plan-steps { display: flex; flex-direction: column; gap: 5px; text-align: left; font-size: 12px; color: #636e72; }
        .step-item.done { color: #00b894; font-weight: bold; display: flex; align-items: center; gap: 5px; }
        .final-output { background: #6c5ce7; color: white; padding: 15px; border-radius: 15px; font-size: 13px; text-align: left; }

        .concept-box { background: #f0f0ff; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 13px; border: 1px solid #dcdde1; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
      `}</style>
    </div>
  );
};
