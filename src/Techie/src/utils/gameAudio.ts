
let audioContext: AudioContext | null = null;
let isMuted = false;

export const setMuted = (muted: boolean) => {
    isMuted = muted;
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
  }
  return audioContext;
};

const playNote = (freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); 
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

// --- General Sounds ---
export const playEatSound = () => playNote(880, 0.05, 'square');
export const playGameOverSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  // Sweep down
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1);
};
export const playLevelUpSound = () => {
    playNote(523.25, 0.1, 'square', 0.2); 
    setTimeout(() => playNote(659.25, 0.1, 'square', 0.2), 100); 
    setTimeout(() => playNote(783.99, 0.1, 'square', 0.2), 200); 
    setTimeout(() => playNote(1046.50, 0.4, 'square', 0.2), 300); 
};

// --- Tetris Sounds ---
export const playRotateSound = () => playNote(1500, 0.03, 'square', 0.1);
export const playLineClearSound = () => {
    playNote(1046.50, 0.1, 'sine'); 
    setTimeout(() => playNote(1318.51, 0.2, 'sine'), 100); 
};
export const playTetrisGameOverSound = () => {
    playNote(200, 0.15, 'sawtooth');
    setTimeout(() => playNote(150, 0.15, 'sawtooth'), 150);
};

// --- Space Aliens Retro Sounds ---

export const playShootSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    // Pew pew effect (high pitch to low pitch fast)
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
};

export const playExplosionSound = () => {
    // White noise approximation using low freq sawtooth chaos
    playNote(60, 0.2, 'sawtooth', 0.2); 
    setTimeout(() => playNote(40, 0.2, 'square', 0.2), 50);
};

export const playUfoSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    // Warble effect
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
};

export const playUfoHitSound = () => {
    playNote(800, 0.1, 'sawtooth', 0.3);
    setTimeout(() => playNote(400, 0.2, 'sawtooth', 0.3), 100);
};

// The classic 4-note march
const MARCH_NOTES = [174, 164, 155, 146]; // Low frequencies
export const playInvaderStep = (index: number) => {
    const freq = MARCH_NOTES[index % 4];
    playNote(freq, 0.05, 'square', 0.1);
};
