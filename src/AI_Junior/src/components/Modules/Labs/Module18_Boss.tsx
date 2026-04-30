import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Settings2, Laugh, Thermometer, Cloud, Siren } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module18_Boss: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor } = useApp();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    temp: 0.7,
    topK: 10,
    topP: 0.9,
    penalty: 0.5
  });
  const [joke, setJoke] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 19, completedModules: ['18'] });
    onComplete();
  };

  const generateJoke = async () => {
    setLoading(true);
    const prompt = `Tell me a very funny joke for a child. 
    Make it ${config.temp > 0.8 ? 'wild and surreal' : 'silly and simple'}. 
    Use creative words. Ensure it is very safe and kind.`;
    
    try {
      const resp = await callProfessor(prompt, {
        temperature: config.temp,
        topK: config.topK,
        topP: config.topP
      });
      setJoke(resp);
      setStep(3);
    } catch (e) {
      setJoke("The joke-o-matic slipped on a banana peel!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="boss-lab-3">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" className="boss-intro" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <Settings2 size={100} color="#6c5ce7" />
            <h2>Phase 3 Boss Challenge!</h2>
            <p>You have mastered all the hidden dials of the AI Brain! Temperature, Top-K, Top-P, and Stop Sequences. Now, combine them all to build the **Ultimate Joke-o-Matic**!</p>
            <button className="start-btn" onClick={() => setStep(1)}>Tune the Engine! 🎛️</button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" className="config-card" initial={{ x: 100 }} animate={{ x: 0 }}>
            <h3>1. The Creativity Dial</h3>
            <div className="control-box">
              <Thermometer color="#ff7675" />
              <input type="range" min="0" max="1" step="0.1" value={config.temp} onChange={(e) => setConfig({...config, temp: parseFloat(e.target.value)})} />
              <span>{config.temp < 0.5 ? "Serious" : "Silly!"}</span>
            </div>

            <h3>2. Word Choice (Top-K/P)</h3>
            <div className="control-box">
              <Cloud color="#4facfe" />
              <input type="range" min="1" max="40" step="5" value={config.topK} onChange={(e) => setConfig({...config, topK: parseInt(e.target.value)})} />
              <span>{config.topK < 10 ? "Simple" : "Fancy Words"}</span>
            </div>

            <button className="next-btn" onClick={() => setStep(2)}>Add Final Touches ✨</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" className="config-card" initial={{ x: 100 }} animate={{ x: 0 }}>
            <h3>3. Repeat Police</h3>
            <div className="control-box">
              <Siren color="#6c5ce7" />
              <input type="checkbox" checked={config.penalty > 0} onChange={(e) => setConfig({...config, penalty: e.target.checked ? 0.8 : 0})} />
              <span>{config.penalty > 0 ? "Police Active" : "No Police"}</span>
            </div>

            <button className="generate-btn" onClick={generateJoke} disabled={loading}>
              {loading ? "Tuning & Generating..." : "Build My Vibe App! 🎢"}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" className="result-card" initial={{ y: 50 }} animate={{ y: 0 }}>
            <div className="joke-machine">
              <div className="machine-header">
                <Laugh size={40} color="#6c5ce7" />
                <h3>Joke-o-Matic 3000</h3>
              </div>
              <div className="joke-content">
                <p>{joke}</p>
              </div>
              <div className="engine-specs">
                <span>Temp: {config.temp}</span>
                <span>K: {config.topK}</span>
                <span>Police: {config.penalty > 0 ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            <div className="boss-success">
              <Trophy size={60} color="#f9d423" />
              <h4>Engine Master!</h4>
              <button className="finish-btn" onClick={handleComplete}>Finish Phase 3! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .boss-lab-3 { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .boss-intro, .config-card, .result-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; max-width: 600px;
        }

        .control-box { width: 100%; display: flex; align-items: center; gap: 15px; background: #f8f9fa; padding: 15px; border-radius: 15px; }
        .control-box input { flex: 1; }
        .control-box span { font-weight: 800; font-size: 12px; min-width: 80px; }

        .joke-machine { width: 100%; background: #f0f0ff; border: 5px solid #6c5ce7; border-radius: 20px; padding: 30px; }
        .machine-header { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px; color: #6c5ce7; }
        .joke-content { font-size: 20px; font-weight: 800; color: #2d3436; line-height: 1.5; text-align: left; background: white; padding: 20px; border-radius: 12px; }
        
        .engine-specs { display: flex; gap: 10px; margin-top: 15px; justify-content: center; }
        .engine-specs span { font-size: 10px; background: #6c5ce7; color: white; padding: 4px 10px; border-radius: 10px; font-weight: bold; }

        .start-btn, .next-btn, .generate-btn, .finish-btn {
          background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer;
        }
        .generate-btn:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
};
