/**
 * 🔊 Space Academy Sound Effects Engine
 * Uses Web Audio API to synthesize sounds directly — no external files needed.
 * All sounds are kid-friendly, sci-fi themed, and lightweight.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

const getCtx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const setMuted = (muted: boolean) => { isMuted = muted; };
export const getMuted = () => isMuted;

// ─── Core synthesizer ───
const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail — audio is non-critical
  }
};

// ─── Public Sound Effects ───

/** Click / button tap — short blip */
export const sfxClick = () => playTone(880, 0.08, 'sine', 0.1);

/** Navigation / menu open — rising tone */
export const sfxNav = () => {
  playTone(440, 0.15, 'sine', 0.08);
  setTimeout(() => playTone(660, 0.15, 'sine', 0.08), 80);
};

/** Module unlock — triumphant chord */
export const sfxUnlock = () => {
  playTone(523, 0.3, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.3, 'sine', 0.12), 100);
  setTimeout(() => playTone(784, 0.4, 'sine', 0.12), 200);
};

/** Achievement / badge earned — celebratory arpeggio */
export const sfxAchievement = () => {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, 'sine', 0.1), i * 120);
  });
};

/** Error / wrong answer — low buzz */
export const sfxError = () => playTone(180, 0.2, 'square', 0.06);

/** Correct answer — bright ping */
export const sfxCorrect = () => {
  playTone(880, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.1), 100);
};

/** Hover over planet/node — subtle blip */
export const sfxHover = () => playTone(1200, 0.05, 'sine', 0.04);

/** Scan / discovery — sweeping tone */
export const sfxScan = () => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

/** Typing / terminal character — micro tick */
export const sfxType = () => playTone(2400, 0.02, 'square', 0.03);

/** Warp / teleport — descending sweep */
export const sfxWarp = () => {
  if (isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
};
