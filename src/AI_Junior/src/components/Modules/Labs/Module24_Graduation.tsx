import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Download, Share2, Sparkles, PartyPopper, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module24_Graduation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { userName, userAge, progress } = useApp();
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    // Trigger confetti effect (simulated with timeout)
    const timer = setTimeout(() => setShowCertificate(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getRank = () => {
    if (userAge <= 10) return "Junior AI Explorer";
    if (userAge <= 13) return "Master AI Navigator";
    return "AI Architect Elite";
  };

  return (
    <div className="graduation-lab">
      <AnimatePresence>
        {!showCertificate ? (
          <motion.div 
            key="celebration"
            className="celebration-intro"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
          >
            <PartyPopper size={120} color="#f9d423" />
            <motion.h1
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              CONGRATULATIONS, {userName}!
            </motion.h1>
            <p>You have successfully completed the AI Innovators Academy!</p>
            <div className="confetti-sim">
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="confetti-piece"
                  initial={{ y: -100, x: Math.random() * 400 - 200, opacity: 1 }}
                  animate={{ y: 500, rotate: 360, opacity: 0 }}
                  transition={{ duration: 3, delay: Math.random() * 2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="certificate"
            className="certificate-container"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="certificate-card">
              <div className="cert-border">
                <div className="cert-content">
                  <div className="cert-header">
                    <Award size={60} color="#f9d423" />
                    <h2>OFFICIAL DIPLOMA</h2>
                    <p>AI INNOVATORS ACADEMY</p>
                  </div>

                  <div className="cert-body">
                    <span>This certifies that</span>
                    <h1 className="student-name">{userName}</h1>
                    <span>has mastered the 24 levels of AI Science and is now a</span>
                    <h3 className="student-rank">{getRank()}</h3>
                  </div>

                  <div className="cert-footer">
                    <div className="signature">
                      <div className="sig-line"></div>
                      <span>The AI Professor</span>
                    </div>
                    <div className="date">
                      <div className="sig-line"></div>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="badge-preview">
                    {progress.badges.slice(0, 5).map((b, i) => (
                      <div key={i} className="mini-badge">🏆</div>
                    ))}
                    <div className="badge-count">+{progress.badges.length} Badges</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cert-actions">
              <button className="action-btn download"><Download size={20} /> Download PDF</button>
              <button className="action-btn share"><Share2 size={20} /> Share Success</button>
            </div>

            <button className="final-btn" onClick={onComplete}>Back to World Map 🌍</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .graduation-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #0f0f1b; }
        .celebration-intro { text-align: center; color: white; }
        .celebration-intro h1 { font-size: 60px; margin: 20px 0; background: linear-gradient(to right, #f9d423, #ff4e50); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .confetti-sim { position: absolute; top: 0; left: 50%; }
        .confetti-piece { width: 10px; height: 10px; background: #6c5ce7; position: absolute; }
        .confetti-piece:nth-child(2n) { background: #f9d423; }
        .confetti-piece:nth-child(3n) { background: #ff4e50; }

        .certificate-container { display: flex; flex-direction: column; align-items: center; gap: 30px; width: 100%; padding: 20px; }
        
        .certificate-card {
          width: 100%;
          max-width: 800px;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }

        .cert-border { border: 15px double #f9d423; padding: 40px; background: #fffdf5; }
        .cert-content { text-align: center; font-family: 'Outfit', serif; border: 2px solid #f9d423; padding: 40px; position: relative; }
        
        .cert-header h2 { font-size: 40px; margin: 10px 0; color: #1a1a2e; letter-spacing: 5px; }
        .cert-header p { font-weight: bold; color: #6c5ce7; font-size: 14px; }

        .cert-body { margin: 40px 0; }
        .cert-body span { font-style: italic; color: #636e72; }
        .student-name { font-size: 50px; color: #6c5ce7; margin: 10px 0; font-family: 'Playfair Display', serif; }
        .student-rank { font-size: 24px; color: #1a1a2e; text-transform: uppercase; margin-top: 10px; }

        .cert-footer { display: flex; justify-content: space-around; margin-top: 60px; }
        .sig-line { width: 150px; height: 2px; background: #2d3436; margin-bottom: 5px; }
        .cert-footer span { font-size: 12px; font-weight: bold; color: #636e72; }

        .badge-preview { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; }
        .mini-badge { font-size: 20px; }
        .badge-count { font-size: 12px; font-weight: bold; color: #b2bec3; }

        .cert-actions { display: flex; gap: 20px; }
        .action-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 25px; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: bold; transition: all 0.2s; }
        .action-btn:hover { background: rgba(255,255,255,0.2); }
        .action-btn.download { background: #6c5ce7; border: none; }

        .final-btn { background: none; border: none; color: rgba(255,255,255,0.5); font-weight: bold; cursor: pointer; margin-top: 20px; text-decoration: underline; }
      `}</style>
    </div>
  );
};
