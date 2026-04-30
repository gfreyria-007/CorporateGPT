import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Target, Map as MapIcon, ShieldCheck, Box, Search, Compass } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sfxScan, sfxCorrect, sfxAchievement } from '../../../utils/sounds';

export const Module3_Vision: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, t, language } = useApp();
  const [step, setStep] = useState(1);
  const [scannedObjects, setScannedObjects] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  const objectsToFind = [
    { id: 'temple', name: 'Ancient Temple', x: 70, y: 30 },
    { id: 'forest', name: 'Biolume Forest', x: 20, y: 60 },
    { id: 'crater', name: 'Ion Crater', x: 50, y: 80 },
  ];

  const handleScan = (objId: string) => {
    if (!scannedObjects.includes(objId)) {
      sfxScan();
      setScannedObjects([...scannedObjects, objId]);
      if (scannedObjects.length + 1 === objectsToFind.length) {
        sfxAchievement();
        setTimeout(() => setStep(3), 1000);
      }
    }
  };

  const finishMission = () => {
    updateProgress({ unlockedLevel: 4, completedModules: ['3'], energyCores: 15 });
    onComplete();
  };

  return (
    <div className="vision-lab">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" className="lab-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="discovery-header">
              <Eye className="pulse-icon" size={40} color="#a29bfe" />
              <h2>{language === 'es' ? 'Reconocimiento Satelital' : 'Satellite Reconnaissance'}</h2>
            </div>
            
            <div className="briefing-card">
              <Compass size={24} color="#00d1b2" />
              <p>{language === 'es' ? 'La IA no ve imágenes como nosotros. Divide la imagen en píxeles y busca formas geométricas para identificar objetos. ¡Ayúdala a encontrar el Templo AI!' : 'AI doesn’t see images like we do. It breaks the image into pixels and looks for geometric shapes to identify objects. Help it find the AI Temple!'}</p>
            </div>

            <div className="pixel-zoom-viz">
              <div className="grid-bg" />
              <motion.div 
                className="pixel-box" 
                animate={{ scale: [1, 2, 1] }} 
                transition={{ repeat: Infinity, duration: 3 }}
              >
                {[...Array(9)].map((_, i) => <div key={i} className="pixel" style={{ opacity: Math.random() }} />)}
              </motion.div>
              <span>{language === 'es' ? 'ANALIZANDO PÍXELES...' : 'ANALYZING PIXELS...'}</span>
            </div>

            <button className="mission-btn" onClick={() => setStep(2)}>{language === 'es' ? 'Iniciar Escaneo' : 'Start Scanning'}</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" className="lab-step" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="satellite-viewport">
              <img src="/ai_satellite_feed_planet_1776894125925.png" alt="Planet Surface" className="planet-img" />
              <div className="hud-overlay">
                <div className="crosshair" />
                <div className="scanning-line" />
                
                {objectsToFind.map(obj => (
                  <motion.div 
                    key={obj.id}
                    className={`target-zone ${scannedObjects.includes(obj.id) ? 'active' : ''}`}
                    style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
                    onClick={() => handleScan(obj.id)}
                    whileHover={{ scale: 1.5 }}
                  >
                    <Box size={20} />
                    {scannedObjects.includes(obj.id) && <span className="label">{obj.name}</span>}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mission-progress">
              <div className="checklist">
                {objectsToFind.map(obj => (
                  <div key={obj.id} className={`check-item ${scannedObjects.includes(obj.id) ? 'done' : ''}`}>
                    {scannedObjects.includes(obj.id) ? <ShieldCheck size={16} /> : <Target size={16} />}
                    <span>{obj.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" className="lab-step success" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="discovery-reveal">
              <div className="glow-circle" />
              <Target size={80} color="#00d1b2" />
            </div>
            <h2>{language === 'es' ? '¡Descubrimiento Confirmado!' : 'Discovery Confirmed!'}</h2>
            <p>{language === 'es' ? 'Has enseñado a la IA a distinguir entre la naturaleza y las estructuras metálicas.' : 'You’ve taught the AI to distinguish between nature and metallic structures.'}</p>
            <div className="reward-summary">
              <div className="reward-pill"><Search size={14} /> +15 XP</div>
              <div className="reward-pill"><Box size={14} /> {language === 'es' ? 'Insignia Visión' : 'Vision Badge'}</div>
            </div>
            <button className="mission-btn" onClick={finishMission}>{language === 'es' ? 'Siguiente Misión' : 'Next Mission'}</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .vision-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .lab-step { width: 100%; max-width: 900px; display: flex; flex-direction: column; align-items: center; gap: 30px; text-align: center; }
        
        .discovery-header h2 { font-size: 32px; font-weight: 800; background: linear-gradient(90deg, #fff, #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pulse-icon { animation: pulse-ring 2s infinite; }

        .briefing-card { background: rgba(0, 209, 178, 0.05); border: 1px solid rgba(0, 209, 178, 0.2); padding: 25px; border-radius: 20px; max-width: 600px; display: flex; gap: 20px; align-items: center; text-align: left; }
        .briefing-card p { margin: 0; font-size: 15px; line-height: 1.5; color: rgba(255,255,255,0.8); }

        .pixel-zoom-viz { background: #000; padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .pixel-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; width: 60px; height: 60px; }
        .pixel { background: #6c5ce7; border-radius: 2px; }
        .pixel-zoom-viz span { font-size: 10px; font-weight: 900; color: #a29bfe; letter-spacing: 3px; }

        .satellite-viewport { 
          position: relative; width: 100%; height: 500px; border-radius: 40px; overflow: hidden; 
          border: 4px solid #1a1a2e; box-shadow: 0 0 50px rgba(0,0,0,0.5); background: #000;
        }
        .planet-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; filter: contrast(1.2) brightness(0.8); }
        
        .hud-overlay { position: absolute; inset: 0; pointer-events: none; }
        .scanning-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0, 209, 178, 0.5); box-shadow: 0 0 10px #00d1b2; animation: scanline 4s linear infinite; }
        .crosshair { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100px; height: 100px; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; }
        .crosshair::before, .crosshair::after { content: ''; position: absolute; background: rgba(255,255,255,0.2); }
        .crosshair::before { width: 100%; height: 1px; top: 50%; left: 0; }
        .crosshair::after { height: 100%; width: 1px; left: 50%; top: 0; }

        .target-zone { 
          position: absolute; width: 40px; height: 40px; background: rgba(108, 92, 231, 0.2); border: 2px solid #6c5ce7; border-radius: 8px; 
          display: flex; align-items: center; justify-content: center; color: #a29bfe; pointer-events: auto; cursor: crosshair; transition: all 0.3s;
        }
        .target-zone.active { background: rgba(0, 209, 178, 0.4); border-color: #00d1b2; color: #fff; box-shadow: 0 0 20px rgba(0, 209, 178, 0.5); }
        .target-zone .label { position: absolute; bottom: -25px; font-size: 10px; font-weight: 800; white-space: nowrap; background: #00d1b2; padding: 2px 8px; border-radius: 4px; }

        .mission-progress { width: 100%; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 20px; }
        .checklist { display: flex; justify-content: center; gap: 30px; }
        .check-item { display: flex; align-items: center; gap: 10px; opacity: 0.3; transition: all 0.5s; font-size: 13px; font-weight: 700; }
        .check-item.done { opacity: 1; color: #00d1b2; }

        .reward-summary { display: flex; gap: 15px; margin: 20px 0; }
        .reward-pill { background: rgba(255, 255, 255, 0.05); padding: 10px 20px; border-radius: 100px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 8px; }

        .mission-btn { background: #6c5ce7; color: white; border: none; padding: 18px 48px; border-radius: 18px; font-size: 18px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3); }
        .mission-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(108, 92, 231, 0.4); }

        @keyframes scanline { from { top: 0; } to { top: 100%; } }

        @media (max-width: 768px) {
          .satellite-viewport { height: 300px; border-radius: 20px; }
          .briefing-card { flex-direction: column; text-align: center; padding: 20px; }
          .checklist { flex-direction: column; gap: 10px; align-items: center; }
          .target-zone { width: 50px; height: 50px; }
          .crosshair { width: 60px; height: 60px; }
          .mission-btn { width: 100%; max-width: 300px; padding: 16px; font-size: 16px; }
          .discovery-header h2 { font-size: 24px; }
          .reward-summary { flex-direction: column; align-items: center; }
        }
      `}</style>
    </div>
  );
};
