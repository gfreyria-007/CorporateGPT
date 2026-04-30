import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Module, curriculum } from '../../data/curriculum';
import { 
  Rocket, Sparkles, Navigation2, 
  Orbit, Radio, Zap, Target,
  Compass, Globe, Satellite, MapPin, 
  ChevronRight, LayoutGrid, Terminal,
  Gamepad2, Joystick, Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfxHover, sfxClick } from '../../utils/sounds';

interface WorldMapProps {
  onSelectModule: (module: Module) => void;
  onConfigClick: () => void;
}

const LEVEL_ICONS: Record<string, any> = {
  'Forest': Gamepad2,
  'Ocean': Target,
  'SpaceStation': Joystick,
  'Portal': Sparkles,
  'Lab': Satellite,
};

export const WorldMap: React.FC<WorldMapProps> = ({ onSelectModule, onConfigClick }) => {
  const { progress, language } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeSidePanel, setActiveSidePanel] = useState(false);
  
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const springX = useSpring(dragX, { stiffness: 80, damping: 25 });
  const springY = useSpring(dragY, { stiffness: 80, damping: 25 });

  useEffect(() => {
    dragX.set(window.innerWidth / 2 - 550); 
    dragY.set(window.innerHeight / 2 - 350); 
  }, []);

  const centerOnModule = (module: Module) => {
    sfxClick();
    dragX.set(-module.x + window.innerWidth / 2);
    dragY.set(-module.y + window.innerHeight / 2);
  };

  return (
    <div className="arcade-world-map">
      {/* Retrowave Background */}
      <div className="retrowave-bg">
        <div className="arcade-stars" />
        <div className="arcade-grid-3d" />
        <div className="horizon-glow" />
      </div>

      <div className="crt-overlay" />

      {/* Draggable Level Canvas */}
      <motion.div 
        ref={mapRef}
        className="level-canvas"
        style={{ x: springX, y: springY }}
        drag
        dragConstraints={{ left: -300, right: 900, top: -200, bottom: 600 }}
      >
        {/* Neon Connection Routes */}
        <svg className="neon-routes" width="1200" height="800">
          <defs>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {curriculum.map((module, i) => {
            if (i === 0) return null;
            const prev = curriculum[i - 1];
            const isUnlocked = progress.unlockedLevel >= module.phase;
            return (
              <motion.line
                key={`route-${module.id}`}
                x1={prev.x} y1={prev.y}
                x2={module.x} y2={module.y}
                stroke={isUnlocked ? "#00ffff" : "rgba(255,255,255,0.05)"}
                strokeWidth={isUnlocked ? "3" : "1"}
                strokeDasharray={isUnlocked ? "0" : "10,10"}
                filter={isUnlocked ? "url(#neonGlow)" : "none"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
              />
            );
          })}
        </svg>

        {/* Level Nodes */}
        {curriculum.map((module) => {
          const Icon = LEVEL_ICONS[module.type] || Orbit;
          const isCompleted = progress.completedModules.includes(module.id.toString());
          const isUnlocked = progress.unlockedLevel >= module.phase;
          const isNext = progress.completedModules.length + 1 === module.id;

          return (
            <motion.div
              key={module.id}
              className={`level-node ${isUnlocked ? 'unlocked' : 'locked'} ${isNext ? 'active-level' : ''}`}
              style={{ left: module.x, top: module.y }}
              whileHover={isUnlocked ? { scale: 1.2, zIndex: 100 } : {}}
              onClick={() => isUnlocked && onSelectModule(module)}
            >
              <div className="node-wrapper">
                <div className="node-ring" />
                <div className="node-body">
                  <Icon size={20} />
                  {isCompleted && <Star className="completed-star" size={12} fill="#f9ca24" />}
                </div>
                {isNext && <div className="node-pulse" />}
              </div>
              
              <div className="node-info-pixel">
                <div className="node-id">LVL_0{module.id}</div>
                <div className="node-name">{module.title.toUpperCase()}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Arcade Level Log */}
      <div className={`level-log ${activeSidePanel ? 'open' : ''}`}>
        <button className="log-btn" onClick={() => { sfxClick(); setActiveSidePanel(!activeSidePanel); }}>
          <LayoutGrid size={20} />
          <span>{language === 'es' ? 'REGISTRO' : 'LOG'}</span>
        </button>
        
        <div className="log-panel">
          <div className="panel-header">
            <Terminal size={14} />
            <span>PLAYER_LOG_2099</span>
          </div>
          <div className="log-list">
            {curriculum.slice(0, progress.completedModules.length + 1).map((m) => (
              <div 
                key={m.id} 
                className={`log-item ${progress.completedModules.includes(m.id.toString()) ? 'done' : 'next'}`}
                onClick={() => centerOnModule(m)}
              >
                <div className="l-num">0{m.id}</div>
                <div className="l-title">{m.title}</div>
                <ChevronRight size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom HUD Bezel */}
      <div className="arcade-map-hud">
        <div className="hud-bezel left">
          <Navigation2 size={14} color="#ff00ff" />
          <span>SYSTEM_SCAN: ACTIVE</span>
        </div>
        
        <div className="hud-bezel right">
          <div className="map-progress">
            <div className="label">GLOBAL_PROGRESS</div>
            <div className="track">
              <div className="fill" style={{ width: `${(progress.completedModules.length / curriculum.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .arcade-world-map { width: 100vw; height: 100vh; overflow: hidden; background: #050510; position: relative; cursor: grab; font-family: 'Space Grotesk', sans-serif; }
        .arcade-world-map:active { cursor: grabbing; }

        .retrowave-bg { position: absolute; inset: 0; z-index: 0; }
        .arcade-stars { position: absolute; inset: 0; background-image: radial-gradient(circle, #fff 0.5px, transparent 0.5px); background-size: 50px 50px; opacity: 0.1; }
        .arcade-grid-3d { 
          position: absolute; width: 200%; height: 200%; bottom: -50%; left: -50%;
          background-image: linear-gradient(rgba(108, 92, 231, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(108, 92, 231, 0.1) 1px, transparent 1px);
          background-size: 80px 80px; transform: rotateX(60deg); opacity: 0.3;
        }
        .horizon-glow { position: absolute; bottom: 0; left: 0; right: 0; height: 300px; background: linear-gradient(to top, #ff00ff22, transparent); }

        .level-canvas { position: absolute; width: 1200px; height: 800px; z-index: 1; }
        .neon-routes { position: absolute; inset: 0; pointer-events: none; }

        .level-node { position: absolute; transform: translate(-50%, -50%); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; width: 120px; }
        .level-node.locked { filter: grayscale(1) opacity(0.2); pointer-events: none; }

        .node-wrapper { position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; }
        .node-ring { position: absolute; inset: -10px; border: 2px dashed rgba(0, 255, 255, 0.3); border-radius: 50%; }
        .node-body { width: 40px; height: 40px; background: #0a0a1f; border: 2px solid #00ffff; border-radius: 4px; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #00ffff; }
        .node-body svg { transform: rotate(-45deg); color: #00ffff; }
        
        .active-level .node-body { border-color: #ff00ff; box-shadow: 0 0 25px #ff00ff; }
        .active-level .node-body svg { color: #ff00ff; }
        .active-level .node-ring { border-color: #ff00ff; animation: rotate 10s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .node-pulse { position: absolute; inset: -15px; border: 2px solid #ff00ff; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }

        .completed-star { position: absolute; top: -15px; right: -15px; filter: drop-shadow(0 0 5px #f9ca24); transform: rotate(-45deg); }

        .node-info-pixel { text-align: center; pointer-events: none; }
        .node-id { font-size: 10px; font-weight: 900; color: #ff00ff; letter-spacing: 2px; font-family: monospace; }
        .node-name { font-size: 11px; font-weight: 900; color: white; margin-top: 4px; padding: 4px 8px; background: rgba(0,0,0,0.8); border: 1px solid #00ffff; border-radius: 2px; box-shadow: 4px 4px 0 #00ffff22; }

        .level-log { position: fixed; right: 20px; top: 100px; z-index: 200; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .log-btn { background: #0a0a1f; border: 2px solid #ff00ff; padding: 10px 20px; color: #ff00ff; font-weight: 900; font-size: 11px; cursor: pointer; border-radius: 4px; box-shadow: 5px 5px 0 #ff00ff22; display: flex; align-items: center; gap: 10px; }
        .log-panel { width: 280px; background: rgba(10,10,31,0.95); border: 2px solid #ff00ff; padding: 20px; border-radius: 4px; display: none; flex-direction: column; gap: 15px; box-shadow: 10px 10px 0 #000; }
        .level-log.open .log-panel { display: flex; }
        .panel-header { font-family: monospace; font-size: 12px; color: #ff00ff; border-bottom: 1px solid #ff00ff44; padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        .log-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
        .log-item { padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer; display: flex; align-items: center; gap: 15px; font-size: 12px; transition: 0.2s; }
        .log-item:hover { border-color: #00ffff; background: rgba(0,255,255,0.05); }
        .log-item.done { border-color: #00ffff; color: #00ffff; }
        .log-item.next { border-color: #ff00ff; color: #ff00ff; }
        .l-num { font-family: monospace; font-weight: 900; opacity: 0.5; }
        .l-title { flex: 1; font-weight: 800; }

        .arcade-map-hud { position: fixed; bottom: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; }
        .hud-bezel { background: #050510; border: 2px solid #00ffff; padding: 10px 20px; border-radius: 4px; pointer-events: auto; display: flex; align-items: center; gap: 15px; box-shadow: 6px 6px 0 #00ffff22; }
        .hud-bezel span { font-size: 10px; font-weight: 900; color: #00ffff; letter-spacing: 2px; font-family: monospace; }
        .map-progress { width: 200px; }
        .map-progress .label { font-size: 9px; font-weight: 900; color: #ff00ff; margin-bottom: 5px; font-family: monospace; }
        .map-progress .track { height: 4px; background: rgba(255,0,255,0.1); border-radius: 2px; overflow: hidden; }
        .map-progress .fill { height: 100%; background: #ff00ff; box-shadow: 0 0 10px #ff00ff; }

        .crt-overlay { position: fixed; inset: 0; z-index: 1000; pointer-events: none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%); background-size: 100% 4px; opacity: 0.5; }
      `}</style>
    </div>
  );
};

