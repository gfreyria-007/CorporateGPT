import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Star, Sparkles, Wand2, Rocket, Waves, Candy } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { callGemini } from '../../../services/gemini';

export const Module12_Boss: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, callProfessor } = useApp();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    narrator: '',
    setting: '',
    spark: ''
  });
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 13, completedModules: ['12'] });
    onComplete();
  };

  const generateStory = async () => {
    setLoading(true);
    const prompt = `Act as a ${config.narrator}. Write a short 3-sentence story for the student. 
    The story takes place in ${config.setting}. 
    The story must include a ${config.spark}. 
    Make it very fun and engaging!`;
    
    try {
      const resp = await callProfessor(prompt);
      setStory(resp);
      setStep(3);
    } catch (e) {
      setStory("Oh no! The storybook is stuck. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="boss-lab">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" className="boss-intro" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <Trophy size={100} color="#f9d423" />
            <h2>Phase 2 Boss Challenge!</h2>
            <p>You have learned the Magic Words (Prompts), the Word Legos (Tokens), and how to give AI a Costume (Roles). Now, use them all to build your first **Vibe App**: The Storybook Maker!</p>
            <button className="start-btn" onClick={() => setStep(1)}>Let's Build! 🚀</button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" className="step-card" initial={{ x: 100 }} animate={{ x: 0 }}>
            <h3>1. Pick your Narrator</h3>
            <div className="options-grid">
              <button onClick={() => { setConfig({...config, narrator: 'Grumpy Pirate'}); setStep(2); }} className="opt-btn">🏴‍☠️ Grumpy Pirate</button>
              <button onClick={() => { setConfig({...config, narrator: 'Magical Fairy'}); setStep(2); }} className="opt-btn">🧚‍♀️ Magical Fairy</button>
              <button onClick={() => { setConfig({...config, narrator: 'Space Robot'}); setStep(2); }} className="opt-btn">🤖 Space Robot</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" className="step-card" initial={{ x: 100 }} animate={{ x: 0 }}>
            <h3>2. Where does it happen?</h3>
            <div className="options-grid">
              <button onClick={() => setConfig({...config, setting: 'Mars'})} className={`opt-btn ${config.setting === 'Mars' ? 'active' : ''}`}><Rocket /> Mars</button>
              <button onClick={() => setConfig({...config, setting: 'Under the Sea'})} className={`opt-btn ${config.setting === 'Under the Sea' ? 'active' : ''}`}><Waves /> Under the Sea</button>
              <button onClick={() => setConfig({...config, setting: 'Candy Land'})} className={`opt-btn ${config.setting === 'Candy Land' ? 'active' : ''}`}><Candy /> Candy Land</button>
            </div>
            
            <div className="spark-input">
              <h3>3. The Magic Spark (One word)</h3>
              <input 
                type="text" 
                placeholder="Ex: Dragon, Ice Cream, Soccer Ball..." 
                onChange={(e) => setConfig({...config, spark: e.target.value})}
              />
            </div>

            <button 
              className="generate-btn" 
              disabled={!config.setting || !config.spark || loading}
              onClick={generateStory}
            >
              {loading ? "Magic in progress..." : "Generate My Vibe App! ✨"}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" className="result-card" initial={{ y: 50 }} animate={{ y: 0 }}>
            <div className="storybook">
              <div className="storybook-header">
                <BookOpen size={30} />
                <h3>Your Magic Story</h3>
              </div>
              <div className="story-content">
                <p>{story}</p>
              </div>
              <div className="story-badges">
                <span className="badge">Config: {config.narrator}</span>
                <span className="badge">Tokens: ~40</span>
              </div>
            </div>

            <div className="graduation-celebration">
              <Star size={40} className="spin-star" />
              <h4>Amazing! You built a Vibe App!</h4>
              <button className="finish-btn" onClick={handleComplete}>Finish Phase 2! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .boss-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .boss-intro, .step-card, .result-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 600px;
        }

        .options-grid { display: grid; grid-template-columns: 1fr; gap: 10px; width: 100%; }
        .opt-btn {
          padding: 15px;
          border: 2px solid #eee;
          background: white;
          border-radius: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .opt-btn:hover { border-color: #6c5ce7; background: #f0f0ff; }
        .opt-btn.active { border-color: #6c5ce7; background: #6c5ce7; color: white; }

        .spark-input { width: 100%; margin-top: 20px; }
        .spark-input input { width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #eee; font-size: 16px; text-align: center; }

        .storybook {
          width: 100%;
          background: #fffcf0;
          border: 8px solid #f9d423;
          border-radius: 20px;
          padding: 30px;
          position: relative;
          box-shadow: 0 10px 30px rgba(249, 212, 35, 0.2);
        }

        .storybook-header { display: flex; align-items: center; gap: 15px; color: #f39c12; margin-bottom: 20px; justify-content: center; }
        .story-content { font-size: 18px; line-height: 1.8; color: #2d3436; font-family: 'Outfit', sans-serif; text-align: left; }

        .story-badges { display: flex; gap: 10px; margin-top: 20px; }
        .badge { font-size: 10px; background: #eee; padding: 4px 10px; border-radius: 20px; color: #636e72; font-weight: bold; }

        .graduation-celebration { margin-top: 30px; }
        .spin-star { animation: spin 4s linear infinite; color: #f9d423; }

        .start-btn, .generate-btn, .finish-btn {
          background: #6c5ce7;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
