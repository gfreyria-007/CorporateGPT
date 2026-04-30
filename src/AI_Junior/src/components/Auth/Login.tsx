import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from '../../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { LogIn, ShieldCheck, Terminal, Zap, Gamepad2, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfxClick, sfxHover, sfxNav } from '../../utils/sounds';

export const Login: React.FC = () => {
  const { guestSignIn } = useApp();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    sfxClick();
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      setError(error.message || "LOGIN_FAILURE_RETRY_LATER");
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    sfxClick();
    setIsGuestLoading(true);
    setError(null);
    try {
      await guestSignIn();
    } catch (error: any) {
      setError("GUEST_ACCESS_DENIED");
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="arcade-login">
      {/* Immersive Background */}
      <div className="login-visuals">
        <div className="stars-parallax" />
        <div className="retrowave-grid-infinite" />
        <div className="nebula-glow" />
      </div>

      <div className="crt-noise" />

      <motion.div 
        className="arcade-terminal-container"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="terminal-shell">
          <div className="terminal-header">
            <div className="system-tag">
              <Terminal size={14} />
              <span>AI_ACADEMY_GATEWAY // v2.0.99</span>
            </div>
            <div className="header-indicators">
              <div className="indicator pulse-green" />
              <div className="indicator pulse-blue" />
              <div className="indicator pulse-red" />
            </div>
          </div>

          <div className="terminal-body">
            <div className="branding-section">
              <motion.div 
                className="logo-emblem"
                animate={{ 
                  boxShadow: ["0 0 20px #00ffff44", "0 0 40px #00ffff88", "0 0 20px #00ffff44"],
                  borderColor: ["#00ffff", "#ff00ff", "#00ffff"]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Gamepad2 size={56} className="icon-main" />
              </motion.div>
              <h1 className="glitch-title" data-text="AI ACADEMY">AI ACADEMY</h1>
              <div className="version-badge">FUTURE_ARCHITECTS_CORE</div>
            </div>

            <div className="auth-actions">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    className="error-log"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <AlertCircle size={14} />
                    <span>SYS_ERR: {error.toUpperCase()}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleLogin} 
                className={`auth-btn primary ${isLoggingIn ? 'loading' : ''}`}
                disabled={isLoggingIn || isGuestLoading}
                onMouseEnter={sfxHover}
              >
                {isLoggingIn ? (
                  <Loader2 className="spinner" />
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>SECURE_LOGIN [GOOGLE]</span>
                  </>
                )}
              </button>

              <div className="action-divider">
                <div className="line" />
                <span>OR</span>
                <div className="line" />
              </div>

              <button 
                onClick={handleGuestLogin} 
                className={`auth-btn secondary ${isGuestLoading ? 'loading' : ''}`}
                disabled={isLoggingIn || isGuestLoading}
                onMouseEnter={sfxHover}
              >
                {isGuestLoading ? (
                  <Loader2 className="spinner" />
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>GUEST_ACCESS_MODE</span>
                  </>
                )}
              </button>
            </div>

            <div className="system-specs">
              <div className="spec">
                <ShieldCheck size={14} />
                <span>AES_256_ACTIVE</span>
              </div>
              <div className="spec">
                <Zap size={14} />
                <span>P2P_SYNC_READY</span>
              </div>
            </div>
          </div>

          <div className="terminal-footer">
            <div className="power-status">
              <span className="label">CORE_VOLTAGE:</span>
              <span className="value">1.21 GW</span>
            </div>
            <div className="legal-notice">BY_LOGGING_IN_YOU_ACCEPT_PROTOCOL_88</div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .arcade-login {
          width: 100vw;
          height: 100vh;
          background: #02020a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* Responsive Container */
        .arcade-terminal-container {
          width: 95%;
          max-width: clamp(450px, 60vw, 850px);
          min-height: 600px;
          z-index: 50;
          perspective: 1500px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* Large Screen Side Panels */
        @media (min-width: 1400px) {
          .arcade-terminal-container::before,
          .arcade-terminal-container::after {
            content: '';
            position: absolute;
            width: 300px;
            height: 400px;
            background: rgba(0, 255, 255, 0.02);
            border: 1px solid rgba(0, 255, 255, 0.1);
            backdrop-filter: blur(5px);
            z-index: -1;
          }
          .arcade-terminal-container::before { left: -340px; transform: rotateY(30deg); }
          .arcade-terminal-container::after { right: -340px; transform: rotateY(-30deg); }
        }

        /* Terminal Styling */
        .terminal-shell {
          width: 100%;
          background: rgba(10, 10, 25, 0.95);
          border: 1px solid rgba(0, 255, 255, 0.4);
          border-radius: 12px;
          backdrop-filter: blur(30px);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 255, 255, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: terminalFloat 8s ease-in-out infinite;
        }

        @keyframes terminalFloat {
          0%, 100% { transform: translateY(0) rotateX(2deg); }
          50% { transform: translateY(-20px) rotateX(-2deg); }
        }

        .terminal-header {
          background: #000;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0, 255, 255, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .system-tag {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #00ffff;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 3px;
          text-shadow: 0 0 15px #00ffff66;
        }

        .header-indicators { display: flex; gap: 10px; }
        .indicator { width: 10px; height: 10px; border-radius: 50%; }
        .pulse-green { background: #00ff00; box-shadow: 0 0 15px #00ff00; animation: blink 1.5s infinite; }
        .pulse-blue { background: #00ffff; box-shadow: 0 0 15px #00ffff; animation: blink 2s infinite; }
        .pulse-red { background: #ff00ff; box-shadow: 0 0 15px #ff00ff; animation: blink 2.5s infinite; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .terminal-body {
          padding: 80px 60px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .branding-section { text-align: center; margin-bottom: 60px; }
        .logo-emblem {
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
          border: 3px solid #00ffff;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 255, 0.08);
          color: #00ffff;
          transform: rotate(5deg);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
        }
        .icon-main { width: 64px; height: 64px; }

        .glitch-title {
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 900;
          letter-spacing: -3px;
          margin: 0;
          text-transform: uppercase;
          background: linear-gradient(to bottom, #fff, #00ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.3));
        }

        .version-badge {
          display: inline-block;
          margin-top: 15px;
          padding: 6px 16px;
          background: rgba(255, 0, 255, 0.15);
          border: 1px solid #ff00ff66;
          color: #ff00ff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 3px;
          border-radius: 4px;
          text-shadow: 0 0 10px #ff00ff44;
        }

        .auth-actions { width: 100%; max-width: 400px; }

        .auth-btn {
          width: 100%;
          padding: 22px;
          border-radius: 8px;
          border: none;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          letter-spacing: 2px;
        }

        .auth-btn.primary {
          background: #00ffff;
          color: #000;
          box-shadow: 0 15px 40px rgba(0, 255, 255, 0.4), 0 0 0 3px rgba(0, 255, 255, 0.6);
        }

        .auth-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffffcc;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 15px;
        }

        .auth-btn:hover:not(:disabled) {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 25px 60px rgba(0, 255, 255, 0.5);
        }

        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner { width: 24px; height: 24px; animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .action-divider {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 35px 0;
          color: rgba(255, 255, 255, 0.3);
          font-size: 12px;
          font-weight: 900;
        }
        .action-divider .line { flex: 1; height: 2px; background: rgba(255, 255, 255, 0.1); }

        .error-log {
          background: rgba(255, 0, 0, 0.15);
          border: 1px solid rgba(255, 0, 0, 0.4);
          color: #ff4757;
          padding: 15px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.1);
        }

        .system-specs {
          margin-top: 60px;
          display: flex;
          gap: 40px;
        }

        .spec {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 2px;
        }

        .terminal-footer {
          background: #000;
          padding: 20px 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .power-status { font-size: 11px; font-weight: 900; }
        .power-status .label { color: rgba(255, 255, 255, 0.4); margin-right: 8px; }
        .power-status .value { color: #00ff00; text-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
        .legal-notice { font-size: 10px; color: rgba(255, 255, 255, 0.15); font-weight: 900; }

        /* Background Visuals */
        .login-visuals { position: absolute; inset: 0; z-index: 1; }
        .stars-parallax {
          position: absolute; inset: 0;
          background-image: radial-gradient(white 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
          animation: starMove 100s linear infinite;
        }
        @keyframes starMove { from { background-position: 0 0; } to { background-position: 1000px 1000px; } }

        .retrowave-grid-infinite {
          position: absolute; width: 200%; height: 100%; bottom: 0; left: -50%;
          background: linear-gradient(transparent 0%, #ff00ff22 100%),
                      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 100% 100%, 80px 80px, 80px 80px;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: bottom;
          opacity: 0.5;
        }

        .nebula-glow {
          position: absolute; top: 40%; left: 50%;
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(108, 92, 231, 0.15), transparent 70%);
          transform: translate(-50%, -50%);
          filter: blur(80px);
        }

        .crt-noise {
          position: fixed; inset: 0; z-index: 1000; pointer-events: none;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%),
                      rgba(18, 16, 16, 0.1);
          background-size: 100% 4px, 100% 100%;
          opacity: 0.15;
        }

        @media (max-width: 600px) {
          .terminal-body { padding: 40px 24px; }
          .glitch-title { font-size: 32px; }
        }
      `}</style>
    </div>
  );
};
