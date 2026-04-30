import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Key, ExternalLink, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const KeySetup: React.FC = () => {
  const { setGeminiKey } = useApp();
  const [keyInput, setKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVerify = async () => {
    setIsTesting(true);
    // Simulate a key verification call
    setTimeout(() => {
      if (keyInput.startsWith('AIza')) {
        setGeminiKey(keyInput);
        setIsSuccess(true);
      } else {
        alert("Oops! That doesn't look like a valid Google AI Key. It should start with 'AIza'.");
      }
      setIsTesting(false);
    }, 1500);
  };

  return (
    <div className="key-setup-page">
      <motion.div 
        className="setup-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="setup-header">
          <div className="icon-box"><Zap size={40} color="#f9d423" /></div>
          <h2>Power Up Your AI!</h2>
          <p>To start learning, we need to connect your AI brain.</p>
        </div>

        <div className="instructions">
          <div className="step">
            <span className="step-num">1</span>
            <p>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio <ExternalLink size={14} /></a></p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <p>Click <strong>"Create API Key"</strong> (It's free!)</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <p>Copy the key and paste it below.</p>
          </div>
        </div>

        <div className="input-group">
          <label><Key size={16} /> Your Secret API Key</label>
          <input 
            type="password" 
            placeholder="AIza..." 
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
        </div>

        {!isSuccess ? (
          <button 
            className="verify-btn" 
            disabled={keyInput.length < 20 || isTesting}
            onClick={handleVerify}
          >
            {isTesting ? "Testing Brain..." : "Connect AI Brain 🚀"}
          </button>
        ) : (
          <motion.div className="success-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CheckCircle2 color="#00b894" size={40} />
            <h3>Connection Successful!</h3>
            <p>Your AI is now powered by your own free Google quota.</p>
          </motion.div>
        )}

        <div className="privacy-note">
          <ShieldCheck size={14} />
          <span>We never store your key on our servers. It stays 100% on your device.</span>
        </div>
      </motion.div>

      <style>{`
        .key-setup-page {
          width: 100vw;
          height: 100vh;
          background: #0f0f1b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .setup-card {
          background: white;
          padding: 50px;
          border-radius: 40px;
          width: 100%;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }

        .setup-header h2 { margin: 15px 0 5px; color: #1a1a2e; }
        .setup-header p { color: #636e72; font-size: 14px; }
        .icon-box { width: 80px; height: 80px; background: #fff9db; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }

        .instructions { background: #f8f9fa; padding: 25px; border-radius: 20px; margin: 30px 0; text-align: left; }
        .step { display: flex; align-items: center; gap: 15px; margin-bottom: 12px; }
        .step:last-child { margin-bottom: 0; }
        .step-num { width: 24px; height: 24px; background: #6c5ce7; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; }
        .step p { margin: 0; font-size: 14px; color: #2d3436; }
        .step a { color: #6c5ce7; text-decoration: underline; font-weight: bold; }

        .input-group { text-align: left; margin-bottom: 30px; }
        .input-group label { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #636e72; margin-bottom: 10px; font-size: 14px; }
        .input-group input { width: 100%; padding: 15px; border: 2px solid #eee; border-radius: 15px; font-size: 16px; outline: none; }
        .input-group input:focus { border-color: #6c5ce7; }

        .verify-btn {
          width: 100%;
          padding: 18px;
          background: #6c5ce7;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .verify-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(108, 92, 231, 0.3); }

        .success-msg { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #00b894; }
        .success-msg h3 { margin: 0; }
        .success-msg p { margin: 0; font-size: 14px; color: #636e72; }

        .privacy-note { margin-top: 30px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #b2bec3; font-size: 11px; }
      `}</style>
    </div>
  );
};
