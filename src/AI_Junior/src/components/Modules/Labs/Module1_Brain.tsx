import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Cpu, Zap, Microscope, Network, CheckCircle2, 
  ArrowRight, Activity, SlidersHorizontal, Layers, 
  Target, Eye, Database, Info, Volume2, AlertCircle, 
  Sparkles, Terminal, ShieldAlert, Rocket, Cat, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sfxClick, sfxAchievement, sfxError, sfxCorrect } from '../../../utils/sounds';

export const Module1_Brain: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { progress, updateProgress, language, speak } = useApp();
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [showQuirk, setShowQuirk] = useState<string | null>(null);
  
  // State for interactive parts
  const [activeNeuron, setActiveNeuron] = useState<null | 'bio' | 'ai'>(null);
  const [pixelGrid, setPixelGrid] = useState<number[]>(new Array(16).fill(0));
  const [foundFeatures, setFoundFeatures] = useState<string[]>([]);
  const [weights, setWeights] = useState({ ears: 0.5, nose: 0.5, body: 0.5 });

  const QUIRKS: Record<number, { title: string, text: string }> = {
    1: { 
      title: language === 'es' ? "¡Dato Loco!" : "Crazy Fact!", 
      text: language === 'es' ? "Tu cerebro consume la misma energía que una bombilla de 20 vatios. ¡Eres súper eficiente!" : "Your brain uses the same energy as a 20-watt light bulb. You're super efficient!" 
    },
    2: { 
      title: language === 'es' ? "Hack de Datos" : "Data Hack", 
      text: language === 'es' ? "Para una IA, el color 'Rojo' es solo el número 255. ¡Todo es matemáticas en su mundo!" : "For an AI, the color 'Red' is just the number 255. Everything is math in its world!" 
    },
    3: { 
      title: language === 'es' ? "¿Sabías que...?" : "Did you know...?", 
      text: language === 'es' ? "Las capas ocultas se llaman así porque no vemos qué números están calculando, ¡solo vemos el resultado final!" : "Hidden layers are called that because we don't see what numbers they are calculating, only the result!" 
    },
    4: { 
      title: language === 'es' ? "Modo Pro" : "Pro Mode", 
      text: language === 'es' ? "Los ingenieros reales ajustan MILES de pesos a la vez. ¡Tú lo estás haciendo manualmente como un jefe!" : "Real engineers adjust THOUSANDS of weights at once. You're doing it manually like a boss!" 
    }
  };

  const AUDIO_NOTES: Record<number, string> = {
    1: language === 'es' ? "Bienvenido al laboratorio. Compara las neuronas para entender la diferencia entre la bio-electricidad y los pesos digitales." : "Welcome to the lab. Compare neurons to understand the difference between bio-electricity and digital weights.",
    2: language === 'es' ? "Dibuja una L. Mira cómo transformamos tu arte en un array de datos puros. Así es como la IA empieza a digerir el mundo." : "Draw an L. See how we transform your art into a pure data array. This is how AI starts digesting the world.",
    3: language === 'es' ? "Usa el escáner para encontrar rasgos. En las capas ocultas, la IA busca bordes y texturas para saber qué está viendo." : "Use the scanner to find features. In hidden layers, AI looks for edges and textures to know what it's seeing.",
    4: language === 'es' ? "Es hora del entrenamiento final. Ajusta los pesos con precisión para detectar la Estación Espacial. ¡No te pases del límite!" : "Time for final training. Adjust weights with precision to detect the Space Station. Don't let the noise win!"
  };

  const playNote = (id: number) => {
    sfxClick();
    speak(AUDIO_NOTES[id]);
  };

  const playQuirk = (id: number) => {
    sfxClick();
    setShowQuirk(`q${id}`);
    speak(QUIRKS[id].text);
  };

  const nextStep = () => {
    sfxClick();
    setStep(prev => prev + 1);
    setShowQuirk(null);
  };

  const finishModule = () => {
    updateProgress({ 
      unlockedLevel: Math.max(progress.unlockedLevel, 2), 
      completedModules: [...new Set([...progress.completedModules, '1'])],
      energyCores: (progress.energyCores || 0) + 75 // Even higher reward for full pro module
    });
    onComplete();
  };

  return (
    <div className="neural-diploma v2">
      <div className="background-elements">
        <div className="floating-blob p1" />
        <div className="floating-blob p2" />
        <div className="grid-overlay" />
      </div>

      <AnimatePresence mode="wait">
        
        {/* PHASE 1: THE DISCOVERY */}
        {step === 1 && (
          <motion.div key="p1" className="diploma-stage" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <div className="stage-top-bar">
              <div className="diploma-tag"><Terminal size={12} /> ARCHITECT_FOUNDATIONS_V2</div>
              <button className="audio-note-btn" onClick={() => playNote(1)}>
                <Volume2 size={18} /> {language === 'es' ? 'Escuchar Instrucciones' : 'Hear Instructions'}
              </button>
            </div>

            <div className="stage-header main">
              <h2>{language === 'es' ? 'Cerebro Bio vs IA' : 'Bio Brain vs AI'}</h2>
              <p className="subtitle">{language === 'es' ? 'Toca las neuronas para analizar su arquitectura secreta.' : 'Tap the neurons to analyze their secret architecture.'}</p>
            </div>

            <div className="neuron-arena">
              <motion.div 
                className={`neuron-pod ${activeNeuron === 'bio' ? 'active' : ''}`}
                onClick={() => { setActiveNeuron('bio'); sfxClick(); }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="pod-icon bio"><Brain size={40} /></div>
                <h3>{language === 'es' ? 'SISTEMA BIOLÓGICO' : 'BIOLOGICAL SYSTEM'}</h3>
                <div className="stats-list">
                  <div className="stat-item"><Activity size={14} /> <span>86B Neuronas</span></div>
                  <div className="stat-item"><Zap size={14} /> <span>Bio-Electricidad</span></div>
                </div>
                {activeNeuron === 'bio' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pod-details">
                    {language === 'es' ? 'Se comunican soltando químicos. ¡Es lento pero súper inteligente!' : 'They talk via chemicals. It is slow but super smart!'}
                  </motion.div>
                )}
              </motion.div>

              <div className="bridge-text">VS</div>

              <motion.div 
                className={`neuron-pod ai ${activeNeuron === 'ai' ? 'active' : ''}`}
                onClick={() => { setActiveNeuron('ai'); sfxClick(); }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="pod-icon ai"><Cpu size={40} /></div>
                <h3>{language === 'es' ? 'SISTEMA DIGITAL' : 'DIGITAL SYSTEM'}</h3>
                <div className="stats-list">
                  <div className="stat-item"><Layers size={14} /> <span>Capas Matemáticas</span></div>
                  <div className="stat-item"><SlidersHorizontal size={14} /> <span>Pesos Numéricos</span></div>
                </div>
                {activeNeuron === 'ai' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pod-details">
                    {language === 'es' ? 'No tiene químicos, usa multiplicaciones para aprender. ¡Es pura lógica!' : 'No chemicals, it uses multiplications to learn. Pure logic!'}
                  </motion.div>
                )}
              </motion.div>
            </div>

            <div className="action-footer">
              <button className={`modern-btn ${activeNeuron ? 'glow' : 'disabled'}`} onClick={activeNeuron ? nextStep : undefined}>
                <span>{language === 'es' ? 'PROCEDER A DATOS' : 'PROCEED TO DATA'}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: PIXEL DIGESTION */}
        {step === 2 && (
          <motion.div key="p2" className="diploma-stage" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="stage-top-bar">
              <div className="diploma-tag"><Database size={12} /> PROTOCOL_02: SPATIAL_SAMPLING</div>
              <button className="audio-note-btn" onClick={() => playNote(2)}>
                <Volume2 size={18} /> {language === 'es' ? 'Escuchar' : 'Listen'}
              </button>
            </div>

            <div className="stage-header">
              <h2>{language === 'es' ? 'Muestreo Espacial' : 'Spatial Sampling'}</h2>
              <p className="subtitle">{language === 'es' ? 'La IA no ve "formas", ve una matriz de intensidades.' : 'The AI doesn\'t see "shapes"; it sees a matrix of intensities.'}</p>
            </div>

            <div className="interactive-layout glass-wrap">
              <div className="pixel-terminal">
                <div className="grid-bezel">
                  {pixelGrid.map((p, i) => (
                    <motion.div 
                      key={i} 
                      className={`grid-cell ${p === 1 ? 'active' : ''}`} 
                      onClick={() => { sfxClick(); const g = [...pixelGrid]; g[i] = g[i] === 0 ? 1 : 0; setPixelGrid(g); }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {p === 1 && <span className="cell-addr">[{Math.floor(i/4)},{i%4}]</span>}
                    </motion.div>
                  ))}
                </div>
                <div className="pixel-theory">
                  <div className="theory-icon"><Terminal size={14} /></div>
                  <p>{language === 'es' 
                    ? 'Cada pixel tiene una DIRECCIÓN de memoria. Estamos convirtiendo luz en una MATRIZ MATEMÁTICA.' 
                    : 'Each pixel has a memory ADDRESS. We are converting light into a MATHEMATICAL MATRIX.'}
                  </p>
                </div>
              </div>

              <div className="data-visualizer glass-panel">
                <div className="viz-header">{language === 'es' ? 'MEMORIA VOLÁTIL' : 'VOLATILE MEMORY'}</div>
                <div className="binary-scroll">
                  {pixelGrid.map((p, i) => (
                    <motion.span 
                      key={i} 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className={`bit-unit ${p === 1 ? 'high' : ''}`}
                    >
                      {p === 1 ? '0xFF' : '0x00'}
                    </motion.span>
                  ))}
                </div>
                <div className="teacher-insight-box">
                  <div className="insight-header">
                    <Info size={14} />
                    <span>{language === 'es' ? 'CONCEPTO MAESTRO' : 'MASTER CONCEPT'}</span>
                  </div>
                  <p>{language === 'es' 
                    ? 'En el cerebro de la IA, este "Gato" es solo una lista de números (0 a 255). El primer paso de toda IA es la DIGITALIZACIÓN: convertir el caos del mundo en el orden de los números.' 
                    : 'In the AI\'s brain, this "Cat" is just a list of numbers (0 to 255). The first step of any AI is DIGITALIZATION: turning the world\'s chaos into the order of numbers.'}
                  </p>
                </div>
              </div>
            </div>

            <button className={`modern-btn ${pixelGrid.filter(p => p === 1).length >= 4 ? 'glow' : 'disabled'}`} onClick={nextStep}>
              <span>{language === 'es' ? 'CONSOLIDAR MATRIZ' : 'CONSOLIDATE MATRIX'}</span>
              <Zap size={20} />
            </button>
          </motion.div>
        )}

        {/* PHASE 3: HIDDEN LAYER FEATURE SCANNER */}
        {step === 3 && (
          <motion.div key="p3" className="diploma-stage">
            <div className="stage-top-bar">
              <div className="diploma-tag"><Layers size={12} /> PROTOCOL_03: FEATURE_EXTRACTION</div>
              <button className="audio-note-btn" onClick={() => playNote(3)}>
                <Volume2 size={18} />
              </button>
            </div>

            <div className="stage-header">
              <h2>{language === 'es' ? 'El Ojo del Arquitecto' : 'The Architect\'s Eye'}</h2>
              <p className="subtitle">{language === 'es' ? 'Escanea al sujeto para encontrar los 3 rasgos (Features) que definen su identidad.' : 'Scan the subject to find the 3 features that define its identity.'}</p>
            </div>

            <div className="scanner-container glass-wrap">
              <div className="image-hologram glass-panel">
                <img src="/cyber_cat_lab_feature_extraction_1776958514319.png" alt="Scanner Subject" className="subject-img" />
                <div className="scan-line-v" />
                
                <motion.div 
                  className={`target ears ${foundFeatures.includes('ears') ? 'found' : ''}`} 
                  onClick={() => !foundFeatures.includes('ears') && (setFoundFeatures([...foundFeatures, 'ears']), sfxCorrect())}
                  whileHover={{ scale: 1.2 }}
                >
                  {foundFeatures.includes('ears') ? <CheckCircle2 size={16} /> : <Eye size={20} />}
                </motion.div>
                <motion.div 
                  className={`target nose ${foundFeatures.includes('nose') ? 'found' : ''}`} 
                  onClick={() => !foundFeatures.includes('nose') && (setFoundFeatures([...foundFeatures, 'nose']), sfxCorrect())}
                  whileHover={{ scale: 1.2 }}
                >
                  {foundFeatures.includes('nose') ? <CheckCircle2 size={16} /> : <Eye size={20} />}
                </motion.div>
                <motion.div 
                  className={`target body ${foundFeatures.includes('body') ? 'found' : ''}`} 
                  onClick={() => !foundFeatures.includes('body') && (setFoundFeatures([...foundFeatures, 'body']), sfxCorrect())}
                  whileHover={{ scale: 1.2 }}
                >
                  {foundFeatures.includes('body') ? <CheckCircle2 size={16} /> : <Eye size={20} />}
                </motion.div>
              </div>

              <div className="feature-checklist glass-panel">
                <div className="list-title">{language === 'es' ? 'RASGOS DETECTADOS' : 'FEATURES DETECTED'}</div>
                <div className="checklist-items">
                  <div className={`check-item-v2 ${foundFeatures.includes('ears') ? 'done' : ''}`}>
                    <div className="check-dot" />
                    <div className="check-text">
                      <strong>{language === 'es' ? 'Curvatura de Orejas' : 'Ear Curvature'}</strong>
                      <p>{language === 'es' ? 'Identifica siluetas triangulares de depredadores.' : 'Identifies triangular silhouettes of predators.'}</p>
                    </div>
                  </div>
                  <div className={`check-item-v2 ${foundFeatures.includes('nose') ? 'done' : ''}`}>
                    <div className="check-dot" />
                    <div className="check-text">
                      <strong>{language === 'es' ? 'Vibrisas y Nariz' : 'Whiskers & Nose'}</strong>
                      <p>{language === 'es' ? 'Líneas finas críticas para el reconocimiento de especie.' : 'Fine lines critical for species recognition.'}</p>
                    </div>
                  </div>
                  <div className={`check-item-v2 ${foundFeatures.includes('body') ? 'done' : ''}`}>
                    <div className="check-dot" />
                    <div className="check-text">
                      <strong>{language === 'es' ? 'Densidad de Pelaje' : 'Fur Density'}</strong>
                      <p>{language === 'es' ? 'Texturas repetitivas que confirman materia orgánica.' : 'Repetitive textures confirming organic matter.'}</p>
                    </div>
                  </div>
                </div>

                <div className="architect-insight-panel">
                  <Brain size={20} className="insight-icon" />
                  <div className="insight-content">
                    <strong>{language === 'es' ? 'Insight del Arquitecto:' : 'Architect Insight:'}</strong>
                    <p>{language === 'es' 
                      ? 'La IA no ve un "Gato" de golpe. Primero detecta bordes, luego texturas y finalmente combina todo en un concepto.' 
                      : 'The AI doesn\'t see a "Cat" all at once. It first detects edges, then textures, and finally combines everything into a concept.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button className={`modern-btn ${foundFeatures.length === 3 ? 'glow' : 'disabled'}`} onClick={nextStep}>
              <span>{language === 'es' ? 'CALIBRAR PESOS' : 'CALIBRATE WEIGHTS'}</span>
              <Activity size={20} />
            </button>
          </motion.div>
        )}

        {/* PHASE 4: WEIGHT CALIBRATION */}
        {step === 4 && (
          <motion.div key="p4" className="diploma-stage" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="stage-top-bar">
              <div className="diploma-tag"><Activity size={12} /> PROTOCOL_04: SYNAPTIC_WEIGHTS</div>
              <button className="audio-note-btn" onClick={() => playNote(4)}>
                <Volume2 size={18} />
              </button>
            </div>

            <div className="stage-header">
              <h2>{language === 'es' ? 'Calibración de Pesos' : 'Weight Calibration'}</h2>
              <p className="subtitle">{language === 'es' ? '¿Qué importancia tiene cada rasgo? Ajusta los pesos para que la neurona se active.' : 'How important is each feature? Adjust the weights to activate the neuron.'}</p>
            </div>

            <div className="boss-arena glass-wrap">
              <div className="controls-panel glass-panel">
                <div className="weight-control">
                  <div className="label-row">
                    <label>{language === 'es' ? 'PESO_OREJAS' : 'EAR_WEIGHT'}</label>
                    <span>w1 = {weights.ears.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.ears} onChange={(e) => setWeights({...weights, ears: parseFloat(e.target.value)})} />
                </div>
                <div className="weight-control">
                  <div className="label-row">
                    <label>{language === 'es' ? 'PESO_NARIZ' : 'NOSE_WEIGHT'}</label>
                    <span>w2 = {weights.nose.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.nose} onChange={(e) => setWeights({...weights, nose: parseFloat(e.target.value)})} />
                </div>
                <div className="weight-control">
                  <div className="label-row">
                    <label>{language === 'es' ? 'PESO_TEXTURA' : 'FUR_WEIGHT'}</label>
                    <span>w3 = {weights.body.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={weights.body} onChange={(e) => setWeights({...weights, body: parseFloat(e.target.value)})} />
                </div>
                
                <div className="neural-summation">
                  <div className="sum-formula">Σ (w * x) + b</div>
                  <div className="sum-readout">
                    {(weights.ears + weights.nose + weights.body).toFixed(2)} / 2.10
                  </div>
                  <div className={`sum-status ${(weights.ears + weights.nose + weights.body) >= 2.1 ? 'active' : ''}`}>
                    {(weights.ears + weights.nose + weights.body) >= 2.1 
                      ? (language === 'es' ? 'UMBRAL ALCANZADO' : 'THRESHOLD REACHED') 
                      : (language === 'es' ? 'CALIBRANDO...' : 'CALIBRATING...')
                    }
                  </div>
                </div>
              </div>

              <div className="prediction-hud">
                <div className="hud-bezel">
                  <div className="radar">
                    <div className="radar-sweep" />
                    <Cat className={`ship-icon ${(weights.ears + weights.nose + weights.body) >= 2.1 ? 'aligned' : ''}`} />
                  </div>
                  <div className="prediction-label">
                    {(weights.ears + weights.nose + weights.body) >= 2.1 
                      ? (language === 'es' ? 'DETECCIÓN: GATO_DOMÉSTICO (98%)' : 'DETECTION: DOMESTIC_CAT (98%)') 
                      : (language === 'es' ? 'ANALIZANDO PATRONES...' : 'ANALYZING PATTERNS...')
                    }
                  </div>
                </div>
                <div className="architect-insight-panel mini">
                   <p>{language === 'es' 
                     ? 'Los PESOS son la inteligencia. Si el peso es alto, la IA "confía" más en ese rasgo.' 
                     : 'WEIGHTS are the intelligence. If the weight is high, the AI "trusts" that feature more.'}
                   </p>
                </div>
              </div>
            </div>

            <button className={`modern-btn ${(weights.ears + weights.nose + weights.body) >= 2.1 ? 'glow' : 'disabled'}`} onClick={nextStep}>
              <span>{language === 'es' ? 'ACTIVAR NEURONA' : 'ACTIVATE NEURON'}</span>
              <Rocket size={20} />
            </button>
          </motion.div>
        )}

        {/* PHASE 5: NETWORK SCALING */}
        {step === 5 && (
          <motion.div key="p5" className="diploma-stage" initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="stage-top-bar">
              <div className="diploma-tag"><Network size={12} /> PROTOCOL_05: NETWORK_EXPANSION</div>
            </div>

            <div className="stage-header">
              <h2>{language === 'es' ? 'Expansión de Red' : 'Network Expansion'}</h2>
              <p className="subtitle">{language === 'es' ? 'Una neurona detecta un rasgo. MILLONES de ellas crean un CEREBRO.' : 'One neuron detects a feature. MILLIONS of them create a BRAIN.'}</p>
            </div>

            <div className="scaling-arena glass-wrap">
              <motion.div 
                className="neural-tree"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`tree-node node-${i}`} />
                ))}
                <div className="tree-center"><Brain size={60} /></div>
              </motion.div>
              
              <div className="architecture-box glass-panel">
                <h4>{language === 'es' ? 'ESTRUCTURA FINAL' : 'FINAL STRUCTURE'}</h4>
                <ul>
                  <li>{language === 'es' ? 'Neuronas de Entrada: 1,024' : 'Input Neurons: 1,024'}</li>
                  <li>{language === 'es' ? 'Capas Ocultas: 24' : 'Hidden Layers: 24'}</li>
                  <li>{language === 'es' ? 'Clasificación Final: GATO' : 'Final Classification: CAT'}</li>
                </ul>
                <div className="teacher-insight-box">
                  <p>{language === 'es' 
                    ? '¡Felicidades! Has construido la base de un sistema de visión. Esta misma lógica se usa para detectar rostros en tu celular o carros autónomos.' 
                    : 'Congratulations! You have built the foundation of a vision system. This same logic is used to detect faces in your phone or autonomous cars.'}
                  </p>
                </div>
              </div>
            </div>

            <button className="modern-btn large glow" onClick={() => { sfxAchievement(); nextStep(); }}>
              <span>{language === 'es' ? 'CERTIFICAR CONOCIMIENTO' : 'CERTIFY KNOWLEDGE'}</span>
              <CheckCircle2 size={24} />
            </button>
          </motion.div>
        )}

        {/* PHASE 6: KNOWLEDGE BRIDGE */}
        {step === 6 && (
          <motion.div key="p6" className="diploma-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="stage-top-bar">
              <div className="diploma-tag"><ShieldCheck size={12} /> PROTOCOL_06: KNOWLEDGE_BRIDGE</div>
            </div>
            
            <div className="stage-header">
              <h2>{language === 'es' ? 'Puente de Conocimiento' : 'Knowledge Bridge'}</h2>
              <p className="subtitle">{language === 'es' ? 'Demuestra que has dominado la arquitectura neural.' : 'Demonstrate that you have mastered neural architecture.'}</p>
            </div>

            <div className="bridge-arena glass-wrap">
              <div className="quiz-card glass-panel">
                <div className="quiz-question">
                  {language === 'es' 
                    ? 'Si quisiéramos detectar un PERRO, ¿qué "Feature" sería más importante que en un gato?' 
                    : 'If we wanted to detect a DOG, which "Feature" would be more important than in a cat?'}
                </div>
                <div className="quiz-options">
                  <button className="option-btn" onClick={() => sfxClick()}>
                    {language === 'es' ? 'A) Curvatura de orejas puntiagudas' : 'A) Pointy ear curvature'}
                  </button>
                  <button className="option-btn correct" onClick={() => { sfxCorrect(); nextStep(); }}>
                    {language === 'es' ? 'B) Longitud del hocico' : 'B) Muzzle/Snout length'}
                  </button>
                  <button className="option-btn" onClick={() => sfxClick()}>
                    {language === 'es' ? 'C) Color de los ojos' : 'C) Eye color'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 7: BADGE ACHIEVEMENT */}
        {step === 7 && (
          <motion.div key="p7" className="diploma-stage grad" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="certificate-glow" />
            <div className="badge-reward">
              <div className="badge-ring">
                <div className="badge-inner">
                  <Brain size={60} />
                </div>
              </div>
              <div className="reward-text">
                <h3>{language === 'es' ? '¡Insignia Desbloqueada!' : 'Badge Unlocked!'}</h3>
                <h2>{language === 'es' ? 'ARQUITECTO DE NEURONAS' : 'NEURON ARCHITECT'}</h2>
                <p>{language === 'es' ? 'Has completado la Misión 01 con éxito. Has dominado la base de la Inteligencia Artificial.' : 'You have successfully completed Mission 01. You have mastered the foundation of Artificial Intelligence.'}</p>
              </div>
              <div className="reward-stats">
                <div className="r-stat">
                  <Zap size={16} />
                  <span>+100 XP</span>
                </div>
                <div className="r-stat">
                  <Target size={16} />
                  <span>MASTER LEVEL</span>
                </div>
              </div>
            </div>
            <button className="finish-mission-btn" onClick={finishModule}>
              {language === 'es' ? 'VOLVER AL MAPA' : 'RETURN TO MAP'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quirk Popups */}
      <AnimatePresence>
        {showQuirk && (
          <motion.div 
            className="quirk-modal" 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            onClick={() => setShowQuirk(null)}
          >
            <div className="quirk-card">
              <div className="quirk-icon"><Sparkles size={20} /></div>
              <h4>{QUIRKS[parseInt(showQuirk.replace('q',''))]?.title}</h4>
              <p>{QUIRKS[parseInt(showQuirk.replace('q',''))]?.text}</p>
              <div className="tap-to-close">{language === 'es' ? 'Toca para cerrar' : 'Tap to close'}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .neural-diploma.v2 { 
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: #02020a;
          font-family: 'Outfit', sans-serif;
        }
        .background-elements { position: absolute; inset: 0; pointer-events: none; }
        .floating-blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.2; }
        .p1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #6c5ce7; }
        .p2 { bottom: -10%; right: -10%; width: 600px; height: 600px; background: #00d1b2; }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; }

        .diploma-stage { width: 100%; max-width: 1000px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; position: relative; z-index: 10; padding: 40px; }
        
        .stage-top-bar { width: 100%; display: flex; justify-content: space-between; align-items: center; }
        .diploma-tag { background: rgba(108, 92, 231, 0.1); border: 1px solid rgba(108, 92, 231, 0.3); padding: 6px 15px; border-radius: 100px; font-size: 10px; font-weight: 900; color: #a29bfe; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
        .audio-note-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 100px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; transition: all 0.2s; }
        .audio-note-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }

        .stage-header { text-align: center; }
        .stage-header h2 { font-size: 48px; font-weight: 900; margin: 0; background: linear-gradient(to right, #fff, #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #a29bfe; font-size: 18px; opacity: 0.8; margin-top: 10px; }

        .neuron-arena { display: flex; align-items: center; gap: 40px; width: 100%; }
        .neuron-pod { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 40px; cursor: pointer; text-align: center; transition: all 0.3s; position: relative; overflow: hidden; }
        .neuron-pod:hover { background: rgba(255,255,255,0.05); transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .neuron-pod.active { border-color: #6c5ce7; background: rgba(108, 92, 231, 0.1); box-shadow: 0 0 50px rgba(108, 92, 231, 0.2); }
        .pod-icon { width: 80px; height: 80px; border-radius: 24px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
        .pod-icon.bio { background: linear-gradient(135deg, #ff7675, #d63031); box-shadow: 0 10px 30px rgba(214, 48, 49, 0.4); }
        .pod-icon.ai { background: linear-gradient(135deg, #6c5ce7, #00d1b2); box-shadow: 0 10px 30px rgba(108, 92, 231, 0.4); }
        .neuron-pod h3 { font-size: 14px; font-weight: 900; letter-spacing: 1px; color: rgba(255,255,255,0.5); margin-bottom: 20px; }
        .stats-list { display: flex; flex-direction: column; gap: 10px; }
        .stat-item { background: rgba(0,0,0,0.3); padding: 8px 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: white; }
        .pod-details { margin-top: 20px; font-size: 13px; color: #a29bfe; line-height: 1.5; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
        .bridge-text { font-size: 24px; font-weight: 900; color: #fff; opacity: 0.2; }

        .interactive-layout { display: flex; gap: 40px; align-items: center; width: 100%; }
        .grid-bezel { background: #0a0a14; border: 4px solid #1a1a2e; padding: 20px; border-radius: 24px; display: grid; grid-template-columns: repeat(4, 70px); grid-template-rows: repeat(4, 70px); gap: 10px; box-shadow: 0 0 40px rgba(0,0,0,0.5); }
        .grid-cell { background: #151525; border-radius: 12px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
        .grid-cell.active { background: #00d1b2; box-shadow: 0 0 20px #00d1b2; border-color: #fff; }
        .data-visualizer { flex: 1; background: rgba(0,0,0,0.4); border-radius: 24px; padding: 30px; border: 1px solid rgba(255,255,255,0.05); height: 340px; display: flex; flex-direction: column; }
        .viz-header { font-size: 10px; font-weight: 900; color: #6c5ce7; letter-spacing: 2px; margin-bottom: 20px; }
        .binary-scroll { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-family: monospace; font-size: 24px; overflow-y: auto; }
        .binary-scroll span { color: rgba(255,255,255,0.1); text-align: center; }
        .binary-scroll span.high { color: #00d1b2; font-weight: 900; text-shadow: 0 0 10px #00d1b2; }

        .scanner-container { display: flex; gap: 50px; align-items: center; width: 100%; }
        .image-hologram { position: relative; width: 400px; height: 400px; border-radius: 32px; overflow: hidden; border: 2px solid #6c5ce7; box-shadow: 0 0 50px rgba(108, 92, 231, 0.3); }
        .image-hologram img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
        .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #00d1b2; box-shadow: 0 0 20px #00d1b2; animation: scanH 4s infinite linear; }
        @keyframes scanH { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        .target { position: absolute; width: 50px; height: 50px; border: 2px dashed #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.1); color: white; transition: all 0.2s; }
        .target:hover { transform: scale(1.2); background: #6c5ce7; }
        .target.found { background: #00d1b2; border-style: solid; border-color: #fff; }
        .target.ears { top: 20%; left: 30%; } .target.nose { top: 50%; left: 55%; } .target.body { bottom: 25%; left: 45%; }
        .feature-checklist { flex: 1; background: rgba(0,0,0,0.3); border-radius: 24px; padding: 40px; border: 1px solid rgba(255,255,255,0.05); }
        .check-item { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 700; color: rgba(255,255,255,0.2); transition: all 0.3s; }
        .check-item.done { color: #00d1b2; }

        .boss-arena { display: flex; gap: 40px; width: 100%; }
        .controls-panel { flex: 1; background: #0a0a14; padding: 40px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 30px; }
        .weight-control { display: flex; flex-direction: column; gap: 10px; }
        .label-row { display: flex; justify-content: space-between; font-family: monospace; font-size: 12px; font-weight: 800; }
        .label-row label { color: #6c5ce7; }
        .label-row span { color: #00d1b2; }
        .weight-control input { appearance: none; height: 10px; background: #1a1a2e; border-radius: 5px; cursor: pointer; }
        .weight-control input::-webkit-slider-thumb { appearance: none; width: 24px; height: 24px; background: #6c5ce7; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px #6c5ce7; }

        .prediction-hud { width: 340px; display: flex; flex-direction: column; gap: 20px; }
        .hud-bezel { flex: 1; background: #000; border: 2px solid #1a1a2e; border-radius: 32px; padding: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; box-shadow: inset 0 0 40px rgba(0,209,178,0.1); }
        .radar { position: relative; width: 150px; height: 150px; border: 2px solid rgba(0,209,178,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .radar-sweep { position: absolute; inset: 0; background: conic-gradient(from 0deg, #00d1b244, transparent); border-radius: 50%; animation: rotate 3s linear infinite; }
        .ship-icon { width: 50px; height: 50px; color: rgba(255,255,255,0.1); transition: all 0.3s; z-index: 5; }
        .ship-icon.aligned { color: #00d1b2; filter: drop-shadow(0 0 10px #00d1b2); transform: scale(1.5); }
        .prediction-label { font-family: monospace; font-size: 14px; font-weight: 900; color: #00d1b2; text-align: center; height: 40px; display: flex; align-items: center; }

        .modern-btn { background: #6c5ce7; color: white; border: none; padding: 15px 30px; border-radius: 16px; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 15px; transition: all 0.3s; box-shadow: 0 10px 30px rgba(108, 92, 231, 0.3); }
        .modern-btn.glow { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 20px rgba(108, 92, 231, 0.4); } 50% { box-shadow: 0 0 50px rgba(108, 92, 231, 0.8); } 100% { box-shadow: 0 0 20px rgba(108, 92, 231, 0.4); } }
        .modern-btn.disabled { opacity: 0.1; cursor: not-allowed; filter: grayscale(1); }

        .quirk-trigger { background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 100px; font-size: 12px; font-weight: 800; color: #a29bfe; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; border: 1px dashed rgba(108, 92, 231, 0.3); margin-top: 10px; }
        .quirk-trigger:hover { background: rgba(108, 92, 231, 0.1); transform: scale(1.05); }

        .quirk-modal { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .quirk-card { background: #151525; border: 2px solid #6c5ce7; border-radius: 32px; padding: 40px; max-width: 400px; text-align: center; box-shadow: 0 0 100px rgba(108,92,231,0.3); }
        .quirk-icon { width: 60px; height: 60px; background: #6c5ce7; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; }
        .quirk-card h4 { font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #fff; }
        .quirk-card p { font-size: 16px; line-height: 1.6; color: #a29bfe; }
        .tap-to-close { margin-top: 30px; font-size: 10px; font-weight: 900; opacity: 0.3; letter-spacing: 2px; }

        .badge-reward { background: rgba(0,0,0,0.4); border: 2px solid #6c5ce7; padding: 50px; border-radius: 40px; display: flex; flex-direction: column; align-items: center; gap: 30px; position: relative; box-shadow: 0 0 60px rgba(108, 92, 231, 0.2); backdrop-filter: blur(20px); }
        .badge-ring { width: 120px; height: 120px; border: 4px solid #6c5ce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 0 30px #6c5ce7; animation: pulseGlow 2s infinite; }
        .badge-inner { width: 90px; height: 90px; background: #6c5ce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
        .reward-text h3 { font-size: 14px; font-weight: 900; color: #00d1b2; letter-spacing: 2px; margin: 0; }
        .reward-text h2 { font-size: 32px; font-weight: 900; color: white; margin: 10px 0; }
        .reward-text p { font-size: 14px; color: rgba(255,255,255,0.5); max-width: 300px; }
        .reward-stats { display: flex; gap: 20px; }
        .r-stat { background: rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 100px; display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 800; color: #a29bfe; }

        .glass-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 40px; padding: 30px; }
        .glass-panel { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; backdrop-filter: blur(10px); }
        
        .pixel-theory { margin-top: 20px; display: flex; gap: 15px; background: rgba(108, 92, 231, 0.05); padding: 15px 25px; border-radius: 20px; border: 1px dashed rgba(108, 92, 231, 0.3); }
        .theory-icon { color: #6c5ce7; flex-shrink: 0; }
        .pixel-theory p { font-size: 13px; color: #a29bfe; margin: 0; line-height: 1.4; font-weight: 600; }

        .bit-unit { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: rgba(255,255,255,0.1); text-align: center; font-weight: 300; }
        .bit-unit.high { color: #00d1b2; font-weight: 900; text-shadow: 0 0 15px #00d1b2; }

        .teacher-insight-box { margin-top: auto; background: rgba(0, 209, 178, 0.05); border: 1px solid rgba(0, 209, 178, 0.2); border-radius: 20px; padding: 20px; }
        .insight-header { display: flex; align-items: center; gap: 10px; color: #00d1b2; font-size: 10px; font-weight: 900; letter-spacing: 1px; margin-bottom: 10px; }
        .teacher-insight-box p { font-size: 13px; color: #fff; opacity: 0.8; margin: 0; line-height: 1.5; }

        .subject-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .scan-line-v { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,255,255,0.2) 50%, transparent 60%); background-size: 100% 200%; animation: scanV 4s infinite linear; pointer-events: none; }
        @keyframes scanV { from { background-position: 0% 0%; } to { background-position: 0% 100%; } }

        .checklist-items { display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px; }
        .check-item-v2 { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 20px; display: flex; gap: 20px; transition: 0.3s; }
        .check-item-v2.done { border-color: #00d1b2; background: rgba(0, 209, 178, 0.05); }
        .check-dot { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .check-item-v2.done .check-dot { background: #00d1b2; border-color: #fff; box-shadow: 0 0 10px #00d1b2; }
        .check-text strong { font-size: 14px; color: #fff; display: block; }
        .check-text p { font-size: 12px; color: rgba(255,255,255,0.4); margin: 5px 0 0; }
        .check-item-v2.done .check-text strong { color: #00d1b2; }

        .cell-addr { position: absolute; font-size: 6px; color: rgba(255,255,255,0.3); bottom: 2px; right: 2px; font-family: monospace; }
        
        .neural-summation { background: #000; border: 1px solid #6c5ce7; border-radius: 20px; padding: 20px; text-align: center; }
        .sum-formula { font-size: 10px; color: #6c5ce7; font-weight: 900; letter-spacing: 2px; margin-bottom: 10px; }
        .sum-readout { font-size: 24px; font-weight: 900; color: #fff; font-family: monospace; }
        .sum-status { font-size: 10px; font-weight: 900; margin-top: 10px; color: #ffffff22; letter-spacing: 1px; }
        .sum-status.active { color: #00d1b2; text-shadow: 0 0 10px #00d1b2; }

        .bridge-arena { width: 100%; display: flex; justify-content: center; padding: 40px; }
        .quiz-card { max-width: 600px; width: 100%; padding: 40px; text-align: center; }
        .quiz-question { font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 30px; line-height: 1.4; }
        .quiz-options { display: flex; flex-direction: column; gap: 15px; }
        .option-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 15px 25px; border-radius: 12px; color: #a29bfe; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; text-align: left; }
        .option-btn:hover { background: rgba(255,255,255,0.05); border-color: #6c5ce7; color: #fff; }
        .option-btn.correct:hover { border-color: #00d1b2; box-shadow: 0 0 20px rgba(0, 209, 178, 0.2); }

        .architect-insight-panel.mini { padding: 15px; margin-top: 20px; }
        .architect-insight-panel.mini p { font-size: 12px; }

        .finish-mission-btn { margin-top: 20px; background: #6c5ce7; color: white; border: none; padding: 15px 40px; border-radius: 16px; font-size: 16px; font-weight: 900; cursor: pointer; transition: all 0.3s; }
        .finish-mission-btn:hover { transform: scale(1.05); box-shadow: 0 0 40px rgba(108, 92, 231, 0.5); }
      `}</style>
    </div>
  );
};
