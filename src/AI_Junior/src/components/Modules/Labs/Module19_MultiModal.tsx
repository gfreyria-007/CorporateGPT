import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Music, Eye, Headphones, Sparkles, CheckCircle, Camera } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module19_MultiModal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [activeMode, setActiveMode] = useState<'image' | 'audio'>('image');
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 20, completedModules: ['19'] });
    onComplete();
  };

  const simulateGeneration = () => {
    // Using Unsplash as a "Simulation" of image generation for kids
    if (activeMode === 'image') {
      const keyword = prompt.split(' ').pop() || 'robot';
      setResultUrl(`https://source.unsplash.com/featured/?cartoon,${keyword}`);
    } else {
      setResultUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    }
  };

  return (
    <div className="multimodal-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="explainer-card">
              <Sparkles size={80} color="#6c5ce7" />
              <h3>Multi-Modal Magic! ✨</h3>
              <p>AI isn't just for chatting! It can **SEE** pictures and **HEAR** music. 
              "Multi-modal" means the AI can use its eyes and ears, not just its brain for words!</p>
              <button className="next-btn" onClick={() => setView('game')}>Explore the Senses! 👁️👂</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }}>
            <div className="game-card">
              <h3>The AI Senses</h3>
              <p>Click a sense to see how the AI uses it!</p>
              
              <div className="senses-grid">
                <button className={`sense-btn ${activeMode === 'image' ? 'active' : ''}`} onClick={() => setActiveMode('image')}>
                  <Eye size={40} />
                  <span>Eyes (Vision)</span>
                </button>
                <button className={`sense-btn ${activeMode === 'audio' ? 'active' : ''}`} onClick={() => setActiveMode('audio')}>
                  <Headphones size={40} />
                  <span>Ears (Audio)</span>
                </button>
              </div>

              <div className="sense-demo">
                {activeMode === 'image' ? (
                  <motion.div className="vision-demo" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <div className="demo-canvas">
                      <Palette size={50} color="#eee" />
                      <p>Describe a picture...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div className="audio-demo" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <div className="audio-wave">
                      {[1,2,3,4,5].map(i => <motion.div key={i} animate={{ height: [10, 40, 10] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.1 }} />)}
                    </div>
                    <p>Listen to the vibes...</p>
                  </motion.div>
                )}
              </div>

              <button className="next-btn" onClick={() => setView('app')}>Be an AI Artist! 🎨</button>
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>The AI Creator 🪄</h3>
              <p>Tell the AI what to create! (Hint: Type "Dragon" or "Space")</p>
              
              <div className="creator-ui">
                <div className="mode-toggle">
                  <button className={activeMode === 'image' ? 'active' : ''} onClick={() => {setActiveMode('image'); setResultUrl("");}}>🖼️ Image</button>
                  <button className={activeMode === 'audio' ? 'active' : ''} onClick={() => {setActiveMode('audio'); setResultUrl("");}}>🎵 Music</button>
                </div>

                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder={activeMode === 'image' ? "A cute robot..." : "Happy lo-fi..."} 
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button onClick={simulateGeneration}>Create! ✨</button>
                </div>

                <div className="result-viewer">
                  {resultUrl ? (
                    activeMode === 'image' ? (
                      <motion.img src={resultUrl} alt="AI Result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={resultUrl} />
                    ) : (
                      <div className="audio-player">
                        <Music size={40} color="#6c5ce7" />
                        <p>Simulating AI Music track...</p>
                        <audio controls src={resultUrl}></audio>
                      </div>
                    )
                  ) : (
                    <div className="placeholder">
                      <Camera size={50} color="#eee" />
                    </div>
                  )}
                </div>
              </div>

              <div className="insight-box">
                <CheckCircle size={20} color="#00b894" />
                <p>AI can turn your words into anything you can imagine!</p>
              </div>

              <button className="finish-btn" onClick={handleComplete}>Magic Master! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .multimodal-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white; padding: 40px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px;
        }

        .senses-grid { display: flex; gap: 20px; width: 100%; }
        .sense-btn { flex: 1; padding: 20px; background: #f8f9fa; border: 2px solid #eee; border-radius: 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; font-weight: 800; }
        .sense-btn.active { border-color: #6c5ce7; background: #f0f0ff; color: #6c5ce7; }

        .sense-demo { width: 100%; height: 150px; background: #f1f2f6; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
        .audio-wave { display: flex; gap: 5px; align-items: center; height: 50px; }
        .audio-wave div { width: 10px; background: #6c5ce7; border-radius: 5px; }

        .creator-ui { width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .mode-toggle { display: flex; gap: 10px; }
        .mode-toggle button { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #eee; background: white; cursor: pointer; font-weight: bold; }
        .mode-toggle button.active { background: #6c5ce7; color: white; border-color: #6c5ce7; }

        .input-group { display: flex; gap: 10px; }
        .input-group input { flex: 1; padding: 12px; border: 2px solid #eee; border-radius: 12px; }
        .input-group button { background: #6c5ce7; color: white; border: none; padding: 0 20px; border-radius: 12px; cursor: pointer; font-weight: bold; }

        .result-viewer { width: 100%; height: 250px; background: #f9f9f9; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .result-viewer img { width: 100%; height: 100%; object-fit: cover; }
        .audio-player { display: flex; flex-direction: column; align-items: center; gap: 10px; }

        .insight-box { background: #f0fcf9; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; text-align: left; font-size: 13px; border: 1px solid #c6f6d5; }

        .next-btn, .finish-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 15px; font-weight: bold; cursor: pointer; }
      `}</style>
    </div>
  );
};
