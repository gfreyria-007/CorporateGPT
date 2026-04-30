import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  type: 'star' | 'circle' | 'spark';
}

const COLORS = ['#6c5ce7', '#a29bfe', '#00d1b2', '#f9ca24', '#ff7675', '#fd79a8', '#55efc4'];

export const useConfetti = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const fire = (originX?: number, originY?: number) => {
    const cx = originX ?? window.innerWidth / 2;
    const cy = originY ?? window.innerHeight / 2;
    
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      x: cx,
      y: cy,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      speed: 200 + Math.random() * 400,
      type: (['star', 'circle', 'spark'] as const)[Math.floor(Math.random() * 3)],
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 2000);
  };

  return { particles, fire };
};

export const ConfettiLayer: React.FC<{ particles: Particle[] }> = ({ particles }) => {
  if (particles.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              opacity: 1, 
              scale: 1,
              rotate: 0 
            }}
            animate={{ 
              x: p.x + Math.cos(p.angle) * p.speed,
              y: p.y + Math.sin(p.angle) * p.speed + 200,
              opacity: 0,
              scale: 0.3,
              rotate: Math.random() * 720 - 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.type === 'circle' ? '50%' : p.type === 'star' ? '2px' : '1px',
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/** Floating stars background for immersive deep-space feel */
export const StarfieldBackground: React.FC = () => {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {stars.map(s => (
        <motion.div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#fff',
            borderRadius: '50%',
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ 
            repeat: Infinity, 
            duration: s.duration, 
            delay: s.delay,
            ease: 'easeInOut' 
          }}
        />
      ))}
      
      {/* Subtle shooting star every few seconds */}
      <motion.div
        style={{
          position: 'absolute',
          width: 60,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #a29bfe, transparent)',
          top: '20%',
          left: '-10%',
          transform: 'rotate(-30deg)',
        }}
        animate={{ 
          left: ['0%', '110%'],
          top: ['15%', '45%'],
          opacity: [0, 1, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          repeatDelay: 8,
          ease: 'easeIn' 
        }}
      />
    </div>
  );
};
