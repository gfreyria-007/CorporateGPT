import React, { useState, useEffect, useRef } from 'react';
import * as gameAudio from '../utils/gameAudio';

// --- Constants & Config ---
const PLAYER_Y = 88; // Player vertical position (%)
const ALIEN_START_Y = 10; 
const GAME_SPEED_BASE = 700; // ms per tick

// Dimensions in %
const PLAYER_WIDTH = 7; 
const PLAYER_HEIGHT = 4;
const ALIEN_WIDTH = 5.5; 
const ALIEN_HEIGHT = 4;
const BULLET_WIDTH = 1;
const BULLET_HEIGHT = 2;

interface Projectile {
  id: number;
  x: number; // center x %
  y: number; // center y %
  fromPlayer: boolean;
}

interface Alien {
  id: number;
  r: number; // row index
  c: number; // col index
  x: number; // center x %
  y: number; // center y %
  type: 'squid' | 'crab' | 'octopus';
}

interface BarrierPixel {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    life: number;
    vx: number;
    vy: number;
}

const SpaceAliensGame: React.FC<{ onClose: () => void, onAwardBadge?: (id: string, name: string, desc: string, icon: string) => void }> = ({ onClose, onAwardBadge }) => {
  // --- State for Rendering ---
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(5000);
  const [lives, setLives] = useState(3);
  
  const [playerX, setPlayerX] = useState(50);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [barriers, setBarriers] = useState<BarrierPixel[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<{top: number, left: number, size: number, opacity: number}[]>([]);
  
  const [ufo, setUfo] = useState<{ x: number, active: boolean, direction: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0); 

  // --- Refs for Game Logic (Avoid Stale Closures) ---
  const playerXRef = useRef(playerX);
  const projectilesRef = useRef(projectiles);
  const aliensRef = useRef(aliens);
  const barriersRef = useRef(barriers);
  
  // Game Loop Logic Refs
  const alienDirectionRef = useRef(1); // 1 = right, -1 = left
  const gameOverRef = useRef(false);
  const lastShotTime = useRef(0);
  const alienMoveTimer = useRef(0);
  const alienSpeedRef = useRef(GAME_SPEED_BASE);

  // Sync refs with state for rendering
  useEffect(() => { playerXRef.current = playerX; }, [playerX]);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);
  useEffect(() => { aliensRef.current = aliens; }, [aliens]);
  useEffect(() => { barriersRef.current = barriers; }, [barriers]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  // --- Initialization ---
  
  useEffect(() => {
    // Generate Stars
    const newStars = Array.from({ length: 50 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random()
    }));
    setStars(newStars);

    startLevel(1);
    initBarriers();
    
    const loop = setInterval(gameTick, 33); // ~30 FPS loop
    return () => clearInterval(loop);
  }, []);

  const startLevel = (lvl: number) => {
      setLevel(lvl);
      initAliens(lvl);
      setProjectiles([]);
      alienDirectionRef.current = 1;
      // Speed increases with level
      alienSpeedRef.current = Math.max(100, GAME_SPEED_BASE - ((lvl - 1) * 80));
  };

  const initAliens = (lvl: number) => {
      const rows = 5;
      const cols = 11;
      const newAliens: Alien[] = [];
      const startY = ALIEN_START_Y + (Math.min(lvl, 5) * 2); 

      for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
              let type: 'squid' | 'crab' | 'octopus' = 'octopus';
              if (r === 0) type = 'squid';
              else if (r === 1 || r === 2) type = 'crab';
              else type = 'octopus';
              
              newAliens.push({
                  id: r * cols + c,
                  r,
                  c,
                  x: 10 + (c * 7.0), // Spacing
                  y: startY + (r * 6.5),
                  type
              });
          }
      }
      setAliens(newAliens);
  };

  const initBarriers = () => {
    const barrierCount = 4;
    const barrierWidth = 14; 
    const barrierHeight = 6;
    const startY = 70;
    const gap = (100 - (barrierWidth * barrierCount)) / (barrierCount + 1);

    const newBarriers: BarrierPixel[] = [];

    // Simple pixel block shape for bunkers
    for (let b = 0; b < barrierCount; b++) {
        const startX = gap + (b * (barrierWidth + gap));
        
        // 4 rows of pixels
        for(let r=0; r<6; r++) {
            for(let c=0; c<10; c++) {
                // Cutout for arch logic
                if (r > 3 && (c > 3 && c < 6)) continue; 
                // Corner rounding
                if (r === 0 && (c === 0 || c === 9)) continue;

                newBarriers.push({
                    id: `b${b}-${r}-${c}`,
                    x: startX + (c * (barrierWidth/10)),
                    y: startY + (r * (barrierHeight/6)),
                    w: barrierWidth/10 + 0.1, // +0.1 to avoid gaps
                    h: barrierHeight/6 + 0.1,
                    color: '#22c55e'
                });
            }
        }
    }
    setBarriers(newBarriers);
  };

  const spawnExplosion = (x: number, y: number, color: string) => {
      const parts: Particle[] = [];
      for(let i=0; i<8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          const speed = Math.random() * 0.5 + 0.2;
          parts.push({
              id: Math.random(),
              x, y,
              color,
              life: 1.0,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed
          });
      }
      setParticles(prev => [...prev, ...parts]);
  };

  const fireProjectile = () => {
      if (gameOverRef.current || lives <= 0) return;
      const now = Date.now();
      
      // Increased fire rate settings
      if (now - lastShotTime.current < 120) return; // Reduced cooldown to 120ms
      if (projectilesRef.current.filter(p => p.fromPlayer).length >= 3) return; // Allow 3 shots on screen

      setProjectiles(prev => [
          ...prev, 
          { 
              id: now, 
              x: playerXRef.current, 
              y: PLAYER_Y - 4, 
              fromPlayer: true 
          }
      ]);
      gameAudio.playShootSound();
      lastShotTime.current = now;
  };

  // --- Main Game Tick ---
  const gameTick = () => {
      if (gameOverRef.current) return;

      // 1. Projectiles
      setProjectiles(prev => {
          const next: Projectile[] = [];
          prev.forEach(p => {
              const speed = p.fromPlayer ? -2.5 : 1.0; 
              const newY = p.y + speed;
              if (newY > -5 && newY < 105) {
                  next.push({ ...p, y: newY });
              }
          });
          return next;
      });

      // 2. Particles
      setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.08
      })).filter(p => p.life > 0));

      // 3. UFO
      setUfo(curr => {
          if (!curr || !curr.active) {
              // 0.2% chance per tick to spawn UFO
              if (Math.random() < 0.002) { 
                 const dir = Math.random() > 0.5 ? 1 : -1;
                 gameAudio.playUfoSound(); 
                 return { x: dir === 1 ? -10 : 110, active: true, direction: dir };
              }
              return null;
          }
          // UFO Move Speed increased to 1.5 (was 0.5)
          const nextX = curr.x + (curr.direction * 1.5); 
          if (nextX < -15 || nextX > 115) return null;
          if (Math.random() < 0.05) gameAudio.playUfoSound();
          return { ...curr, x: nextX };
      });

      // 4. Collisions
      handleCollisions();

      // 5. Alien Movement (March)
      const now = Date.now();
      if (now - alienMoveTimer.current > alienSpeedRef.current) {
          updateAliens();
          alienMoveTimer.current = now;
      }
  };

  const handleCollisions = () => {
      const currentAliens = [...aliensRef.current];
      const currentBarriers = [...barriersRef.current];
      let projectilesToRemove = new Set<number>();
      let aliensChanged = false;
      let barriersChanged = false;
      let ufoHit = false;
      let playerHit = false;

      // Check Player Projectiles
      projectilesRef.current.filter(p => p.fromPlayer).forEach(p => {
          if (projectilesToRemove.has(p.id)) return;

          // Alien Collision
          let hitAlien = false;
          for (let i = currentAliens.length - 1; i >= 0; i--) {
              const a = currentAliens[i];
              // Improved hit box
              if (Math.abs(a.x - p.x) < ALIEN_WIDTH/1.5 && Math.abs(a.y - p.y) < ALIEN_HEIGHT/1.5) {
                  const type = a.type;
                  currentAliens.splice(i, 1);
                  aliensChanged = true;
                  hitAlien = true;
                  
                  let pts = 10;
                  if (type === 'squid') pts = 30;
                  else if (type === 'crab') pts = 20;
                  
                  setScore(s => {
                      const next = s + pts;
                      if (next >= 1000 && s < 1000 && onAwardBadge) {
                          onAwardBadge('alien_hunter_1000', 'Defensor Galáctico', 'Llegaste a 1000 puntos en Space Aliens', '🛸');
                      } else if (next >= 5000 && s < 5000 && onAwardBadge) {
                          onAwardBadge('alien_hero_5000', 'Héroe de las Estrellas', '¡Increíble! Superaste los 5000 puntos.', '🌌');
                      }
                      return next;
                  });
                  
                  spawnExplosion(a.x, a.y, '#fff');
                  gameAudio.playExplosionSound();
                  
                  // Speed up logic based on % killed
                  const totalStart = 55; 
                  const percentLeft = currentAliens.length / totalStart;
                  // Max speed is very fast (50ms)
                  alienSpeedRef.current = Math.max(50, (percentLeft * (GAME_SPEED_BASE - 100)) + 50);
                  break; 
              }
          }
          if(hitAlien) {
             projectilesToRemove.add(p.id);
             return;
          }

          // UFO Collision
          if (ufo && ufo.active && !projectilesToRemove.has(p.id)) {
               // Hitbox adjusted for smaller size (width 5%) and position (top 7%)
               // X threshold: 3.5 (radius 2.5 + margin)
               // Y threshold: 3 (centered around 8)
               if (Math.abs(ufo.x - p.x) < 3.5 && Math.abs(8 - p.y) < 3) {
                   ufoHit = true;
                   projectilesToRemove.add(p.id);
                   const bonus = 2000; // Fixed 2000 points
                   setScore(s => s + bonus);
                   setLives(l => l + 1); // Extra life granted
                   spawnExplosion(ufo.x, 8, '#f00'); 
                   gameAudio.playUfoHitSound();
               }
          }

          // Barrier Collision (Granular)
          if (!projectilesToRemove.has(p.id)) {
              for (let i = currentBarriers.length - 1; i >= 0; i--) {
                  const b = currentBarriers[i];
                  // Strict rectangle collision for pixels
                  if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
                      currentBarriers.splice(i, 1);
                      // Explosion radius for barrier damage
                      // Remove neighbors to simulate explosion
                       for (let j = currentBarriers.length - 1; j >= 0; j--) {
                           const nb = currentBarriers[j];
                           const dist = Math.sqrt(Math.pow(nb.x - b.x, 2) + Math.pow(nb.y - b.y, 2));
                           if (dist < 1.5) currentBarriers.splice(j, 1);
                       }

                      barriersChanged = true;
                      projectilesToRemove.add(p.id);
                      spawnExplosion(p.x, p.y, '#22c55e'); 
                      break;
                  }
              }
          }
      });

      // Check Alien Projectiles
      projectilesRef.current.filter(p => !p.fromPlayer).forEach(p => {
          if (projectilesToRemove.has(p.id)) return;

          // Player Hit
          if (Math.abs(p.x - playerXRef.current) < 3.5 && Math.abs(p.y - PLAYER_Y) < 2.5) {
              playerHit = true;
              projectilesToRemove.add(p.id);
              return;
          }

          // Barrier Hit
          for (let i = currentBarriers.length - 1; i >= 0; i--) {
              const b = currentBarriers[i];
              if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
                    currentBarriers.splice(i, 1);
                     // Bigger explosion for alien bombs
                     for (let j = currentBarriers.length - 1; j >= 0; j--) {
                        const nb = currentBarriers[j];
                        const dist = Math.sqrt(Math.pow(nb.x - b.x, 2) + Math.pow(nb.y - b.y, 2));
                        if (dist < 2.5) currentBarriers.splice(j, 1);
                    }
                    barriersChanged = true;
                    projectilesToRemove.add(p.id);
                    spawnExplosion(p.x, p.y, '#22c55e');
                    break;
              }
          }
          
          // Floor Hit
          if (p.y > 95) {
               projectilesToRemove.add(p.id);
               spawnExplosion(p.x, 95, '#ef4444');
          }
      });

      if (aliensChanged) {
          setAliens(currentAliens);
          if (currentAliens.length === 0) {
              gameAudio.playLevelUpSound();
              if (level === 5 && onAwardBadge) {
                  onAwardBadge('system_conqueror_5', 'Conquistador de Sistemas', 'Limpiaste el sistema de aliens en el Nivel 5', '💎');
              }
              setTimeout(() => startLevel(level + 1), 1500);
          }
      }
      if (barriersChanged) setBarriers(currentBarriers);
      if (ufoHit) setUfo(null);
      if (projectilesToRemove.size > 0) {
          setProjectiles(prev => prev.filter(p => !projectilesToRemove.has(p.id)));
      }

      if (playerHit) {
          handlePlayerDeath();
      }
  };

  const handlePlayerDeath = () => {
      spawnExplosion(playerXRef.current, PLAYER_Y, '#00ff00');
      gameAudio.playExplosionSound();
      
      if (lives > 1) {
          setLives(l => l - 1);
          setProjectiles([]); 
          // Center player
          setPlayerX(50);
      } else {
          setLives(0);
          setGameOver(true);
          gameAudio.playGameOverSound();
      }
  };

  const updateAliens = () => {
      const currentAliens = aliensRef.current;
      if (currentAliens.length === 0) return;

      setAnimationFrame(prev => (prev + 1) % 2); 
      gameAudio.playInvaderStep(Math.floor(Date.now() / 100)); 

      let moveDown = false;
      let dir = alienDirectionRef.current; 
      
      // Calculate group bounds
      const minX = Math.min(...currentAliens.map(a => a.x));
      const maxX = Math.max(...currentAliens.map(a => a.x));

      // Check wall hit
      if ((maxX > 92 && dir === 1) || (minX < 8 && dir === -1)) {
          moveDown = true;
          dir = -dir;
          alienDirectionRef.current = dir; 
      }

      const nextAliens = currentAliens.map(a => ({
          ...a,
          x: moveDown ? a.x : a.x + (dir * 2.5), 
          y: moveDown ? a.y + 4 : a.y 
      }));

      // Check Invasion (too low) or Barrier overlap
      const nextBarriers = [...barriersRef.current];
      let barriersChanged = false;

      nextAliens.forEach(a => {
          if (a.y >= PLAYER_Y - 3) {
              setGameOver(true);
              setLives(0);
              gameAudio.playGameOverSound();
          }
          
          // Aliens eat barriers
          for (let i = nextBarriers.length - 1; i >= 0; i--) {
              const b = nextBarriers[i];
              if (Math.abs(a.x - b.x) < 3 && Math.abs(a.y - b.y) < 3) {
                  nextBarriers.splice(i, 1);
                  barriersChanged = true;
              }
          }
      });
      
      if (barriersChanged) setBarriers(nextBarriers);
      setAliens(nextAliens);

      // Alien Shooting Logic
      // Only bottom-most alien in each column shoots
      const cols = new Set(nextAliens.map(a => a.c));
      const shooters: Alien[] = [];
      cols.forEach(c => {
          const colAliens = nextAliens.filter(a => a.c === c);
          // Sort by Y desc to find bottom one
          colAliens.sort((a,b) => b.y - a.y);
          shooters.push(colAliens[0]);
      });

      // Fire chance increases slightly with level
      if (Math.random() < (0.04 + (level * 0.01))) {
          if (shooters.length > 0) {
              const shooter = shooters[Math.floor(Math.random() * shooters.length)];
              setProjectiles(prev => [...prev, {
                  id: Date.now() + Math.random(),
                  x: shooter.x,
                  y: shooter.y + 4,
                  fromPlayer: false
              }]);
          }
      }
  };

  // --- Input ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') {
        setPlayerX(prev => Math.max(5, prev - 3));
      } else if (e.key === 'ArrowRight') {
        setPlayerX(prev => Math.min(95, prev + 3));
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault(); 
        fireProjectile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, lives]);

  // Asset paths
  const getAlienPath = (type: string, frame: number) => {
      // Squid (Top row)
      if (type === 'squid') {
          return frame === 0 
            ? "M4 0h3v1h-3zM3 1h5v1h-5zM2 2h7v1h-7zM1 3h2v1h-2zM4 3h3v1h-3zM8 3h2v1h-2zM0 4h11v1h-11zM0 5h1v1h-1zM2 5h7v1h-7zM10 5h1v1h-1zM0 6h1v1h-1zM2 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM3 7h2v1h-2zM6 7h2v1h-2z"
            : "M4 0h3v1h-3zM3 1h5v1h-5zM2 2h7v1h-7zM1 3h2v1h-2zM4 3h3v1h-3zM8 3h2v1h-2zM0 4h11v1h-11zM0 5h1v1h-1zM2 5h7v1h-7zM10 5h1v1h-1zM0 6h1v1h-1zM2 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM1 7h2v1h-2zM8 7h2v1h-2z";
      } 
      // Crab (Middle rows)
      else if (type === 'crab') {
          return frame === 0
            ? "M2 0h1v1h-1zM8 0h1v1h-1zM0 1h1v1h-1zM3 1h5v1h-5zM10 1h1v1h-1zM0 2h1v1h-1zM2 2h7v1h-7zM10 2h1v1h-1zM0 3h3v1h-3zM4 3h3v1h-3zM8 3h3v1h-3zM0 4h11v1h-11zM1 5h9v1h-9zM2 6h1v1h-1zM8 6h1v1h-1zM1 7h1v1h-1zM9 7h1v1h-1z"
            : "M2 0h1v1h-1zM8 0h1v1h-1zM3 1h5v1h-5zM2 2h7v1h-7zM0 3h3v1h-3zM4 3h3v1h-3zM8 3h3v1h-3zM0 4h11v1h-11zM1 5h9v1h-9zM2 6h1v1h-1zM8 6h1v1h-1zM0 7h1v1h-1zM10 7h1v1h-1z";
      } 
      // Octopus (Bottom rows)
      else { 
          return frame === 0
            ? "M4 0h4v1h-4zM1 1h10v1h-10zM0 2h12v1h-12zM0 3h3v1h-3zM5 3h2v1h-2zM9 3h3v1h-3zM0 4h12v1h-12zM2 5h3v1h-3zM7 5h3v1h-3zM1 6h2v1h-2zM5 6h2v1h-2zM9 6h2v1h-2zM2 7h2v1h-2zM8 7h2v1h-2z"
            : "M4 0h4v1h-4zM1 1h10v1h-10zM0 2h12v1h-12zM0 3h3v1h-3zM5 3h2v1h-2zM9 3h3v1h-3zM0 4h12v1h-12zM2 5h3v1h-3zM7 5h3v1h-3zM1 6h2v1h-2zM5 6h2v1h-2zM9 6h2v1h-2zM0 7h2v1h-2zM10 7h2v1h-2z";
      }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-0 sm:p-4 font-mono select-none">
      <div className="bg-black border-4 border-gray-800 rounded-xl shadow-2xl w-full max-w-lg h-full sm:h-auto sm:aspect-[3/4] relative overflow-hidden flex flex-col">
          
          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none z-30 opacity-10" style={{
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
              backgroundSize: '100% 3px, 3px 100%'
          }}></div>

          {/* HUD */}
          <div className="flex justify-between items-end p-4 border-b-2 border-green-900 bg-black z-40">
              <div className="flex flex-col">
                  <span className="text-white text-xs font-bold tracking-widest uppercase mb-1">SCORE</span>
                  <span className="text-white text-xl font-bold leading-none">{score.toString().padStart(4, '0')}</span>
              </div>
              <div className="flex flex-col items-center">
                  <span className="text-red-500 text-xs font-bold tracking-widest uppercase mb-1">HI-SCORE</span>
                  <span className="text-white text-xl font-bold leading-none">{Math.max(score, hiScore).toString().padStart(4, '0')}</span>
              </div>
          </div>

           <button onClick={onClose} className="absolute top-4 right-4 z-50 text-gray-500 hover:text-red-500 bg-black/50 rounded-full p-2 border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex-1 bg-black overflow-hidden mx-1">
             {/* Starfield */}
             {stars.map((s, i) => (
                 <div key={i} className="absolute bg-white rounded-full" style={{
                     top: `${s.top}%`, left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity
                 }}></div>
             ))}

             {/* UFO */}
             {ufo && ufo.active && (
                 <div className="absolute text-red-500 transform -translate-x-1/2 transition-transform duration-100" style={{ left: `${ufo.x}%`, top: `7%`, width: `5%` }}>
                     <svg viewBox="0 0 16 7" className="fill-current drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] w-full h-auto">
                        <path d="M5 1h6v1H5z M2 2h12v1H2z M1 3h14v1H1z M0 4h16v1H0z M2 5h12v1H2z M4 6h8v1H4z" />
                     </svg>
                 </div>
             )}

             {/* Aliens */}
             {aliens.map(a => (
                 <div key={a.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${ALIEN_WIDTH}%` }}>
                     <svg viewBox={a.type === 'octopus' ? "0 0 12 8" : a.type === 'crab' ? "0 0 11 8" : "0 0 11 8"} className={`fill-current w-full h-auto ${a.type === 'squid' ? 'text-white' : a.type === 'crab' ? 'text-green-400' : 'text-cyan-400'}`}>
                         <path d={getAlienPath(a.type, animationFrame)} />
                     </svg>
                 </div>
             ))}

             {/* Barriers */}
             {barriers.map(b => (
                 <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, backgroundColor: b.color }}></div>
             ))}

             {/* Player */}
             <div className="absolute text-green-500 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75" style={{ left: `${playerX}%`, top: `${PLAYER_Y}%`, width: `${PLAYER_WIDTH}%` }}>
                 <svg viewBox="0 0 13 8" className="fill-current w-full h-auto">
                    <path d="M6 0h1v1H6z M5 1h3v1H5z M5 2h3v1H5z M1 3h11v1H1z M0 4h13v4H0z" />
                 </svg>
             </div>

             {/* Projectiles */}
             {projectiles.map(p => (
                 <div key={p.id} className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${p.fromPlayer ? 'bg-white' : 'bg-red-400'}`} style={{ 
                     left: `${p.x}%`, 
                     top: `${p.y}%`, 
                     width: `${BULLET_WIDTH}%`, 
                     height: `${BULLET_HEIGHT}%`, 
                     boxShadow: p.fromPlayer ? '0 0 10px white' : '0 0 10px #f87171',
                     borderRadius: '1px'
                 }}>
                     {!p.fromPlayer && (
                         <div className="w-full h-full flex flex-col justify-between">
                            <div className="h-1/3 bg-white/80 animate-pulse"></div>
                         </div>
                     )}
                 </div>
             ))}

             {/* Particles */}
             {particles.map(p => (
                 <div key={p.id} className="absolute w-1 h-1 rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: p.color, opacity: p.life }}></div>
             ))}

             {/* Floor */}
             <div className="absolute bottom-1 left-0 w-full h-0.5 bg-green-900 shadow-[0_0_10px_#0f0]"></div>
             
             {/* Lives */}
             <div className="absolute bottom-2 left-4 flex gap-2">
                 <span className="text-white text-[10px] font-bold uppercase tracking-widest pt-1">LIVES</span>
                 {Array.from({length: Math.max(0, lives)}).map((_, i) => (
                    <div key={i} className="text-green-500 w-5">
                        <svg viewBox="0 0 13 8" className="fill-current w-full h-auto"><path d="M6 0h1v1H6z M5 1h3v1H5z M5 2h3v1H5z M1 3h11v1H1z M0 4h13v4H0z" /></svg>
                    </div>
                 ))}
             </div>

             {/* Game Over Modal */}
             {gameOver && (
                 <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-red-500 z-50">
                     <h2 className="text-5xl font-bold mb-4 tracking-widest font-mono text-center drop-shadow-[0_0_10px_red]">GAME<br/>OVER</h2>
                     <button onClick={onClose} className="mt-8 px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-black uppercase tracking-wider font-bold transition-colors">MENU</button>
                 </div>
             )}

             {/* Level Start Overlay */}
             {aliens.length === 0 && !gameOver && (
                 <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-green-500 z-50">
                     <h2 className="text-3xl font-bold mb-2 tracking-widest font-mono animate-pulse">LEVEL {level}</h2>
                     <p className="text-xs text-green-700">PREPARE FOR BATTLE</p>
                 </div>
             )}
          </div>

          {/* Controls */}
          <div className="p-6 bg-black border-t-2 border-green-900 text-center select-none relative z-40">
              <div className="flex justify-center gap-8 max-w-[320px] mx-auto items-center">
                   <button 
                      className="w-16 h-16 bg-gray-900 rounded-full active:bg-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-lg"
                      onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.max(5, x - 4)); }}
                      onClick={() => setPlayerX(x => Math.max(5, x - 4))}
                   >
                       <span className="text-2xl text-white">◀</span>
                   </button>
                   
                   <button 
                      className="w-20 h-20 bg-red-900 rounded-full active:bg-red-800 border-4 border-red-700 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.5)] transform active:scale-95 transition-transform"
                      onTouchStart={(e) => { e.preventDefault(); fireProjectile(); }}
                      onClick={() => fireProjectile()}
                   >
                       <span className="text-xs font-bold text-white uppercase tracking-widest">FIRE</span>
                   </button>
                   
                   <button 
                      className="w-16 h-16 bg-gray-900 rounded-full active:bg-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-lg"
                      onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.min(95, x + 4)); }}
                      onClick={() => setPlayerX(x => Math.min(95, x + 4))}
                   >
                       <span className="text-2xl text-white">▶</span>
                   </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SpaceAliensGame;
