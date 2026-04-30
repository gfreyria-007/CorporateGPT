import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Brain, Rocket, Sparkles, Globe, Lock, GraduationCap, 
  ChevronRight, Star, Heart, Zap, CheckCircle2, 
  Terminal, Database, Network, MessageSquare, Cpu, ArrowRight,
  Layers, MousePointer2, Volume2, ShieldAlert, Binary, Search, Eye,
  Gamepad2, Joystick, Coins, Target, Activity, Power, Code, Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sfxClick, sfxHover, sfxAchievement } from '../../utils/sounds';
import { StarfieldBackground } from '../../utils/particles';

interface LandingPageProps {
  onStart: () => void;
}

const LiveNeuralMatrix = () => {
  const [nodes, setNodes] = useState([...Array(15)].map((_, i) => ({ id: i, active: false })));
  
  const toggleNode = (id: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
    sfxHover();
  };

  return (
    <div className="neural-matrix-game">
      <div className="matrix-nodes">
        {nodes.map(n => (
          <motion.div 
            key={n.id}
            className={`node ${n.active ? 'active' : ''}`}
            whileHover={{ scale: 1.2 }}
            onClick={() => toggleNode(n.id)}
            animate={n.active ? { boxShadow: '0 0 20px #00ffff', borderColor: '#00ffff' } : {}}
          >
            <Zap size={10} />
          </motion.div>
        ))}
      </div>
      <div className="matrix-connections">
        <svg width="100%" height="100%">
          {nodes.filter(n => n.active).map((n, i, arr) => (
            arr[i+1] && (
              <motion.line 
                key={i}
                x1={`${(n.id % 5) * 20 + 10}%`} y1={`${Math.floor(n.id / 5) * 33 + 15}%`}
                x2={`${(arr[i+1].id % 5) * 20 + 10}%`} y2={`${Math.floor(arr[i+1].id / 5) * 33 + 15}%`}
                stroke="#00ffff" strokeWidth="1" strokeDasharray="5,5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              />
            )
          ))}
        </svg>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { language, setLanguage } = useApp();
  const [time, setTime] = useState(new Date());
  const [fontScale, setFontScale] = useState(1);

  const increaseFont = () => setFontScale(prev => Math.min(prev + 0.1, 1.4));
  const decreaseFont = () => setFontScale(prev => Math.max(prev - 0.1, 0.8));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const missions = [
    {
      id: 1,
      title: language === 'es' ? 'TACTICA_KINETICA' : 'KINETIC_TACTICS',
      subtitle: language === 'es' ? 'NEURAL_CORE' : 'NEURAL_CORE',
      desc: language === 'es' 
        ? '¡Entrena a tu bot para la victoria! Aprende cómo las neuronas artificiales procesan la realidad.' 
        : 'Train your bot for victory! Learn how artificial neurons process reality.',
      img: '/arcade_2099/battle_bot.png',
      color: '#ff007f',
      tag: 'LEVEL_01'
    },
    {
      id: 2,
      title: language === 'es' ? 'VISION_SINTETICA' : 'SYNTH_VISION',
      subtitle: language === 'es' ? 'ESCANEO_TACTICO' : 'TACTICAL_SCAN',
      desc: language === 'es' 
        ? 'Hackea las cámaras para ver como una IA. ¡Identifica objetos y hackea la realidad!' 
        : 'Hack the cameras to see like an AI. Identify objects and hack reality!',
      img: '/arcade_2099/vision_scan.png',
      color: '#00f2ff',
      tag: 'LEVEL_02'
    },
    {
      id: 3,
      title: language === 'es' ? 'NEXO_ORACULO' : 'ORACLE_NEXUS',
      subtitle: language === 'es' ? 'GEMINI_LINK' : 'GEMINI_LINK',
      desc: language === 'es' 
        ? 'Conéctate con la inteligencia suprema. Domina el arte de los comandos avanzados.' 
        : 'Connect with supreme intelligence. Master the art of advanced commands.',
      img: '/arcade_2099/neural_oracle.png',
      color: '#faff00',
      tag: 'LEVEL_03'
    },
    {
      id: 4,
      title: language === 'es' ? 'SISTEMA_MAESTRO' : 'CORE_SYSTEM',
      subtitle: language === 'es' ? 'ARQUITECTURA_IA' : 'AI_ARCHITECTURE',
      desc: language === 'es' 
        ? '¡Toma el control total! Diseña tu propio sistema de inteligencia artificial desde cero.' 
        : 'Take total control! Design your own artificial intelligence system from scratch.',
      img: '/arcade_2099/neural_lab.png',
      color: '#7d5fff',
      tag: 'LEVEL_04'
    }
  ];

  const neuralCoreLevels = [
    { id: 1, icon: <Database size={18} />, en: 'DATA', es: 'DATOS', desc_es: 'Recolecta y clasifica información vital.', desc_en: 'Collect and classify vital information.', img: 'data_miner.png', badge: 'DATA_INIT' },
    { id: 2, icon: <Network size={18} />, en: 'SYNAPSE', es: 'SINAPSIS', desc_es: 'Crea conexiones entre nodos de datos.', desc_en: 'Create connections between data nodes.', img: 'neural_lab.png', badge: 'NODE_LINK' },
    { id: 3, icon: <Activity size={18} />, en: 'FIRE', es: 'ACTIVAR', desc_es: 'Dispara señales a través de la red.', desc_en: 'Fire signals across the network.', img: 'data_miner.png', badge: 'SPARK_GEN' },
    { id: 4, icon: <Layers size={18} />, en: 'LAYERS', es: 'CAPAS', desc_es: 'Apila capas para aprendizaje profundo.', desc_en: 'Stack layers for deep learning.', img: 'lab_preview.png', badge: 'DEEP_DIVER' },
    { id: 5, icon: <Rocket size={18} />, en: 'TRAIN', es: 'ENTRENAR', desc_es: 'Inicia la secuencia de entrenamiento.', desc_en: 'Initiate training sequence.', img: 'neural_lab.png', badge: 'WEIGHT_OPT' },
    { id: 6, icon: <Brain size={18} />, en: 'CORE', es: 'NÚCLEO', desc_es: 'Desbloquea el núcleo cognitivo.', desc_en: 'Unlock the cognitive core.', img: 'lab_preview.png', badge: 'BRAIN_HACKER' }
  ];

  const logicFlowLevels = [
    { id: 7, icon: <Terminal size={18} />, en: 'SYNTAX', es: 'SINTAXIS', desc_es: 'Escribe tus primeras líneas de código.', desc_en: 'Write your first lines of code.', img: 'hero.png', badge: 'SYNTAX_101' },
    { id: 8, icon: <Binary size={18} />, en: 'LOGIC', es: 'LÓGICA', desc_es: 'Comprende el flujo de verdadero y falso.', desc_en: 'Understand true and false flows.', img: 'battle_bot.png', badge: 'BOOL_MASTER' },
    { id: 9, icon: <Cpu size={18} />, en: 'LOOPS', es: 'BUCLES', desc_es: 'Automatiza tareas repetitivas.', desc_en: 'Automate repetitive tasks.', img: 'hero.png', badge: 'LOOP_RIDER' },
    { id: 10, icon: <Gamepad2 size={18} />, en: 'EVENTS', es: 'EVENTOS', desc_es: 'Reacciona a las acciones del usuario.', desc_en: 'React to user actions.', img: 'battle_bot.png', badge: 'EVENT_CATCH' },
    { id: 11, icon: <Target size={18} />, en: 'FUNCS', es: 'FUNCIONES', desc_es: 'Empaqueta lógica en módulos reusables.', desc_en: 'Package logic into reusable modules.', img: 'hero.png', badge: 'MOD_BUILDER' },
    { id: 12, icon: <Code size={18} />, en: 'ALGO', es: 'ALGORITMO', desc_es: 'Construye algoritmos complejos.', desc_en: 'Build complex algorithms.', img: 'battle_bot.png', badge: 'ALGO_ARCHITECT' }
  ];

  const synthVisionLevels = [
    { id: 13, icon: <Eye size={18} />, en: 'PIXELS', es: 'PÍXELES', desc_es: 'Analiza la matriz de imágenes.', desc_en: 'Analyze the image matrix.', img: 'vision_scan.png', badge: 'PIXEL_PEEPER' },
    { id: 14, icon: <Search size={18} />, en: 'FILTERS', es: 'FILTROS', desc_es: 'Aplica filtros de visión artificial.', desc_en: 'Apply computer vision filters.', img: 'xray_vision.png', badge: 'FILTER_PRO' },
    { id: 15, icon: <Target size={18} />, en: 'DETECT', es: 'DETECTAR', desc_es: 'Identifica objetos en tiempo real.', desc_en: 'Identify objects in real time.', img: 'vision_scan.png', badge: 'OBJ_HUNTER' },
    { id: 16, icon: <Layers size={18} />, en: 'CONV', es: 'CONV', desc_es: 'Redes neuronales convolucionales.', desc_en: 'Convolutional neural networks.', img: 'xray_vision.png', badge: 'CONV_NINJA' },
    { id: 17, icon: <Gamepad2 size={18} />, en: 'TRACK', es: 'RASTREO', desc_es: 'Rastrea movimiento cuadro por cuadro.', desc_en: 'Track motion frame by frame.', img: 'vision_scan.png', badge: 'MOTION_TRACK' },
    { id: 18, icon: <Sparkles size={18} />, en: 'GEN', es: 'VIS_GEN', desc_es: 'Genera nuevas realidades visuales.', desc_en: 'Generate new visual realities.', img: 'xray_vision.png', badge: 'GEN_ARTIST' }
  ];

  const oracleLevels = [
    { id: 19, icon: <MessageSquare size={18} />, en: 'PROMPT', es: 'PROMPT', desc_es: 'Domina el arte de las instrucciones.', desc_en: 'Master the art of instructions.', img: 'oracle_link.png', badge: 'PROMPT_JEDI' },
    { id: 20, icon: <Sparkles size={18} />, en: 'CONTEXT', es: 'CONTEXTO', desc_es: 'Maneja ventanas de contexto masivas.', desc_en: 'Handle massive context windows.', img: 'neural_oracle.png', badge: 'CONTEXT_EXP' },
    { id: 21, icon: <Database size={18} />, en: 'RAG', es: 'RAG', desc_es: 'Conecta bases de datos al oráculo.', desc_en: 'Connect databases to the oracle.', img: 'oracle_link.png', badge: 'RAG_SCHOLAR' },
    { id: 22, icon: <Lock size={18} />, en: 'SAFETY', es: 'SEGURIDAD', desc_es: 'Alineación y seguridad en IA.', desc_en: 'AI alignment and safety.', img: 'neural_oracle.png', badge: 'SAFETY_SHIELD' },
    { id: 23, icon: <Zap size={18} />, en: 'AGENTS', es: 'AGENTES', desc_es: 'Crea agentes autónomos.', desc_en: 'Create autonomous agents.', img: 'oracle_link.png', badge: 'AGENT_SMITH' },
    { id: 24, icon: <Globe size={18} />, en: 'ORACLE', es: 'ORÁCULO', desc_es: 'Despliega tu sistema al mundo.', desc_en: 'Deploy your system to the world.', img: 'neural_oracle.png', badge: 'ORACLE_PRIME' }
  ];

  return (
    <div className="arcade-2099-landing" style={{ '--font-scale': fontScale } as React.CSSProperties}>
      <StarfieldBackground />
      <div className="crt-overlay" />
      
      <div className="retrowave-grid-container">
        <div className="retrowave-grid" />
        <div className="grid-horizon" />
      </div>

      <nav className="arcade-nav">
        <div className="nav-wrap">
          <div className="nav-logo">
            <Zap size={20} fill="#00ffff" />
            <span>AI_JUNIOR_OS_v2.1</span>
          </div>
          <div className="nav-metrics">
            <div className="metric"><Activity size={14} /> <span>PLAYER_READY</span></div>
            <div className="metric"><Power size={14} /> <span>ENERGY: 100%</span></div>
            <div className="metric-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            
            <div className="font-controls">
              <button onClick={decreaseFont}>A-</button>
              <button onClick={increaseFont}>A+</button>
            </div>

            <div className="lang-toggle">
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
              <button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      <header className="hero-arcade">
        <div className="container">
          <div className="hero-main-content">
            <div className="hero-text-block">
              <motion.div 
                className="insert-coin"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                INSERT TOKEN TO START // SYSTEM_READY
              </motion.div>
              <h1 className="arcade-title">
                AI<br/><span>JUNIOR</span>
              </h1>
              <p className="hero-desc">
                {language === 'es' 
                  ? '¡No solo uses la IA, crea la tuya! Juega, entrena robots y descubre los secretos de la inteligencia artificial en el laboratorio más divertido del mundo.' 
                  : 'Don\'t just use AI, build your own! Play games, train robots, and discover the secrets of artificial intelligence in the world\'s coolest lab.'}
              </p>
              <div className="hero-actions">
                <button className="btn-start" onClick={() => { sfxClick(); onStart(); }}>
                  {language === 'es' ? '¡EMPEZAR AHORA!' : 'PRESS START'}
                </button>
                <div className="high-score-marker">
                  <Star size={16} fill="#faff00" />
                  <span>TOP_PLAYER: @KID_GENIUS</span>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="arcade-cabinet-frame">
                <img src="/arcade_2099/hero.png" alt="Arcade 2099" className="cabinet-img" />
                <div className="floating-elements">
                  <motion.div className="f-box b1" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}><Brain size={20} /></motion.div>
                  <motion.div className="f-box b2" animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}><Target size={20} /></motion.div>
                  <motion.div className="f-box b3" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }}><Cpu size={20} /></motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="training-overview-section">
        <div className="container">
          <div className="section-header centered">
            <div className="pre-title">MISSION_PROTOCOL</div>
            <h2 className="section-title">THE_TRAINING_MATRIX</h2>
            <p className="section-subtitle">24 Levels. 4 Dimensions of Intelligence. 1 Ultimate Goal.</p>
            <div className="separator" />
          </div>

          <div className="roadmap-grid">
            <div className="dimension-col" style={{ '--accent': '#ff007f' } as any}>
              <div className="dim-header">
                <Brain size={32} />
                <span>NEURAL_CORE</span>
              </div>
              <div className="dim-content">
                {neuralCoreLevels.map((level, i) => (
                  <div key={level.id} className={`level-dot ${i < 2 ? 'active' : ''}`}>
                    {level.icon}
                    <span>{language === 'es' ? level.es : level.en}</span>
                    <div className="level-tooltip">
                      <div className="tooltip-hologram">
                        <div className="holo-bg" style={{ background: `repeating-linear-gradient(${level.id * 15}deg, var(--accent) 0, var(--accent) 2px, transparent 2px, transparent 8px)` }} />
                        <div className="holo-icon">
                          {React.cloneElement(level.icon as any, { size: 42 })}
                        </div>
                        <div className="holo-scanline" />
                        <div className="badge-overlay">
                          <Award size={12} /> {level.badge}
                        </div>
                      </div>
                      <div className="tooltip-header">
                        <span className="lvl-num">LVL {level.id}</span>
                        <h4>{language === 'es' ? level.es : level.en}</h4>
                      </div>
                      <p>{language === 'es' ? level.desc_es : level.desc_en}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="dim-desc">{language === 'es' ? 'Explora la arquitectura de los cerebros digitales.' : 'Explore the architecture of digital brains.'}</p>
            </div>

            <div className="dimension-col" style={{ '--accent': '#00f2ff' } as any}>
              <div className="dim-header">
                <Activity size={32} />
                <span>LOGIC_FLOW</span>
              </div>
              <div className="dim-content">
                {logicFlowLevels.map((level, i) => (
                  <div key={level.id} className="level-dot">
                    {level.icon}
                    <span>{language === 'es' ? level.es : level.en}</span>
                    <div className="level-tooltip">
                      <div className="tooltip-hologram">
                        <div className="holo-bg" style={{ background: `repeating-linear-gradient(${level.id * 15}deg, var(--accent) 0, var(--accent) 2px, transparent 2px, transparent 8px)` }} />
                        <div className="holo-icon">
                          {React.cloneElement(level.icon as any, { size: 42 })}
                        </div>
                        <div className="holo-scanline" />
                        <div className="badge-overlay">
                          <Award size={12} /> {level.badge}
                        </div>
                      </div>
                      <div className="tooltip-header">
                        <span className="lvl-num">LVL {level.id}</span>
                        <h4>{language === 'es' ? level.es : level.en}</h4>
                      </div>
                      <p>{language === 'es' ? level.desc_es : level.desc_en}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="dim-desc">{language === 'es' ? 'Conecta algoritmos para resolver misiones complejas.' : 'Connect algorithms to solve complex missions.'}</p>
            </div>

            <div className="dimension-col" style={{ '--accent': '#faff00' } as any}>
              <div className="dim-header">
                <Eye size={32} />
                <span>SYNTH_VISION</span>
              </div>
              <div className="dim-content">
                {synthVisionLevels.map((level, i) => (
                  <div key={level.id} className="level-dot">
                    {level.icon}
                    <span>{language === 'es' ? level.es : level.en}</span>
                    <div className="level-tooltip">
                      <div className="tooltip-hologram">
                        <div className="holo-bg" style={{ background: `repeating-linear-gradient(${level.id * 15}deg, var(--accent) 0, var(--accent) 2px, transparent 2px, transparent 8px)` }} />
                        <div className="holo-icon">
                          {React.cloneElement(level.icon as any, { size: 42 })}
                        </div>
                        <div className="holo-scanline" />
                        <div className="badge-overlay">
                          <Award size={12} /> {level.badge}
                        </div>
                      </div>
                      <div className="tooltip-header">
                        <span className="lvl-num">LVL {level.id}</span>
                        <h4>{language === 'es' ? level.es : level.en}</h4>
                      </div>
                      <p>{language === 'es' ? level.desc_es : level.desc_en}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="dim-desc">{language === 'es' ? 'Domina la visión por computadora y reconocimiento.' : 'Master computer vision and recognition.'}</p>
            </div>

            <div className="dimension-col" style={{ '--accent': '#7d5fff' } as any}>
              <div className="dim-header">
                <Rocket size={32} />
                <span>ORACLE_INTERFACE</span>
              </div>
              <div className="dim-content">
                {oracleLevels.map((level, i) => (
                  <div key={level.id} className="level-dot">
                    {level.icon}
                    <span>{language === 'es' ? level.es : level.en}</span>
                    <div className="level-tooltip">
                      <div className="tooltip-hologram">
                        <div className="holo-bg" style={{ background: `repeating-linear-gradient(${level.id * 15}deg, var(--accent) 0, var(--accent) 2px, transparent 2px, transparent 8px)` }} />
                        <div className="holo-icon">
                          {React.cloneElement(level.icon as any, { size: 42 })}
                        </div>
                        <div className="holo-scanline" />
                        <div className="badge-overlay">
                          <Award size={12} /> {level.badge}
                        </div>
                      </div>
                      <div className="tooltip-header">
                        <span className="lvl-num">LVL {level.id}</span>
                        <h4>{language === 'es' ? level.es : level.en}</h4>
                      </div>
                      <p>{language === 'es' ? level.desc_es : level.desc_en}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="dim-desc">{language === 'es' ? 'Ingeniería de prompts para el Oráculo Gemini.' : 'Prompt engineering for the Gemini Oracle.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="visual-showcase-section">
        <div className="container">
          <div className="section-header centered">
            <div className="pre-title">LAB_PREVIEWS</div>
            <h2 className="section-title">IN_ENGINE_FOOTAGE</h2>
            <p className="section-subtitle">Real-time simulation snapshots from the Academy Core.</p>
          </div>

          <div className="showcase-carousel">
            <motion.div 
              className="showcase-item"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="showcase-img-wrap">
                <img src="/arcade_2099/neural_lab.png" alt="Neural Lab" />
                <div className="img-overlay" />
                <div className="tech-specs">
                  <div className="spec"><span>PROTOCOL:</span> NEURAL_SYNC_v4</div>
                  <div className="spec"><span>SYNC:</span> 144Hz</div>
                  <div className="spec"><span>LATENCY:</span> 0.02ms</div>
                </div>
              </div>
              <div className="showcase-info">
                <h3>{language === 'es' ? 'LABORATORIO DE SINAPSIS' : 'SYNAPSE LABORATORY'}</h3>
                <p>{language === 'es' ? 'Visualiza y conecta neuronas artificiales en tiempo real. Entiende cómo fluye la información a través de los pesos y sesgos.' : 'Visualize and connect artificial neurons in real-time. Understand how information flows through weights and biases.'}</p>
                <div className="showcase-tags">
                  <span>#BACKPROPAGATION</span>
                  <span>#GRADIENT_DESCENT</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="showcase-item reverse"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="showcase-info">
                <h3>{language === 'es' ? 'SISTEMA DE ESCANEO TÁCTICO' : 'TACTICAL SCANNING SYSTEM'}</h3>
                <p>{language === 'es' ? 'Aprende a entrenar modelos de detección de objetos. Hackea la visión de las cámaras para identificar objetivos en la ciudad.' : 'Learn to train object detection models. Hack camera vision to identify targets in the city.'}</p>
                <div className="showcase-tags">
                  <span>#COMPUTER_VISION</span>
                  <span>#YOLO_v8</span>
                </div>
              </div>
              <div className="showcase-img-wrap">
                <img src="/arcade_2099/vision_scan.png" alt="Vision Scan" />
                <div className="img-overlay" />
                <div className="tech-specs">
                  <div className="spec"><span>CORE:</span> VISION_ENGINE</div>
                  <div className="spec"><span>ACC:</span> 99.8%</div>
                  <div className="spec"><span>OBJ:</span> 40+ TYPES</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="showcase-item"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="showcase-img-wrap">
                <img src="/arcade_2099/oracle_link.png" alt="Oracle Link" />
                <div className="img-overlay" />
                <div className="tech-specs">
                  <div className="spec"><span>LINK:</span> GEMINI_PRO_1.5</div>
                  <div className="spec"><span>TOKENS:</span> 1M_CONTEXT</div>
                  <div className="spec"><span>STATUS:</span> DIVINE</div>
                </div>
              </div>
              <div className="showcase-info">
                <h3>{language === 'es' ? 'EL ORÁCULO DE DATOS' : 'THE DATA ORACLE'}</h3>
                <p>{language === 'es' ? 'Interactúa con la inteligencia suprema. Aprende a redactar comandos que extraigan el conocimiento oculto de la IA.' : 'Interact with supreme intelligence. Learn to craft commands that extract hidden knowledge from AI.'}</p>
                <div className="showcase-tags">
                  <span>#LLM_ARCH</span>
                  <span>#PROMPT_ENGINEERING</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mission-grid-section">
        <div className="container">
          <div className="section-header">
            <div className="pre-title">ACTIVE_LABS</div>
            <h2 className="section-title">CHOOSE_YOUR_START</h2>
            <div className="separator" style={{ margin: '15px 0' }} />
          </div>
          
          <div className="missions-container">
            {missions.map(m => (
              <motion.div 
                key={m.id}
                className="mission-card"
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={sfxClick}
                style={{ '--card-color': m.color } as any}
              >
                <div className="card-image">
                  <img src={m.img} alt={m.title} />
                  <div className="card-tag">{m.tag}</div>
                  <div className="card-overlay-glow" />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{m.title}</h3>
                  <h4 className="card-subtitle">{m.subtitle}</h4>
                  <p className="card-desc">{m.desc}</p>
                  <div className="card-footer">
                    <div className="btn-play">SELECT_START <ChevronRight size={14} /></div>
                    <div className="reward-badge"><Coins size={10} /> +500xp</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="inside-the-academy">
        <div className="container">
          <div className="glass-panel">
            <div className="panel-text">
              <div className="pre-title">CORE_PEDAGOGY</div>
              <h2 className="section-title" style={{ color: '#faff00' }}>CREATIVE_LABS</h2>
              <p className="panel-desc">
                {language === 'es' 
                  ? '¡No solo leas sobre IA, experiméntala! En nuestra academia, cada lección es un juego interactivo.'
                  : 'Don\'t just read about AI, experience it! In our academy, every lesson is an interactive game.'}
              </p>
              <ul className="feature-list">
                <li><Binary size={24} /> <span>{language === 'es' ? 'Entrena robots con tus propios datos' : 'Train robots with your own data'}</span></li>
                <li><Eye size={24} /> <span>{language === 'es' ? 'Usa cámaras para ver como una IA' : 'Use cameras to see like an AI'}</span></li>
                <li><Cpu size={24} /> <span>{language === 'es' ? 'Optimiza cerebros digitales' : 'Optimize digital brains'}</span></li>
              </ul>
              <div className="panel-cta">
                <button className="btn-override" onClick={onStart}>INITIALIZE_SYSTEM_LOAD</button>
              </div>
            </div>
            <div className="panel-visual">
              <div className="preview-monitor">
                <img src="/arcade_2099/lab_preview.png" alt="Lab Interface" />
                <div className="monitor-stats">
                  <div className="s-row">FPS: 60</div>
                  <div className="s-row">SYNC: HIGH</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="engine-room">
        <div className="engine-content">
          <div className="engine-text">
            <h2 className="section-title" style={{ color: '#ff00ff' }}>THE_ENGINE_ROOM</h2>
            <p className="engine-subtitle">{language === 'es' ? 'Demostración de Matriz Neural Interactiva. Conecta los nodos para alimentar el núcleo.' : 'Interactive Neural Matrix Demo. Connect the nodes to power the academy core.'}</p>
          </div>
          <LiveNeuralMatrix />
        </div>
      </section>

      <footer className="arcade-footer">
        <div className="footer-wrap">
          <div className="footer-logo">AI_JUNIOR_ACADEMY // 2026-2099 // {language === 'es' ? 'CONSTRUIDO PARA EL FUTURO' : 'BUILT FOR THE FUTURE'}</div>
          <div className="footer-links">
            <span>PRIVACY_PROTOCOL</span>
            <span>ADMIN_OVERRIDE</span>
            <span>SYSTEM_LOGS</span>
          </div>
        </div>
      </footer>

      <style>{`
        .arcade-2099-landing { 
          background: #0d0221; 
          color: white; 
          min-height: 100vh; 
          font-family: 'Space Grotesk', sans-serif; 
          overflow-x: hidden; 
          position: relative; 
          padding-bottom: 80px;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .crt-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 1000; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%); background-size: 100% 4px; opacity: 0.1; }
        
        .retrowave-grid-container { position: fixed; bottom: 0; left: 0; width: 100%; height: 50vh; perspective: 600px; z-index: 0; overflow: hidden; opacity: 0.25; }
        .retrowave-grid { position: absolute; top: 0; left: -50%; width: 200%; height: 200%; background-image: linear-gradient(0deg, transparent 24%, #ff007f22 25%, #ff007f22 26%, transparent 27%, transparent 74%, #ff007f22 75%, #ff007f22 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ff007f22 25%, #ff007f22 26%, transparent 27%, transparent 74%, #ff007f22 75%, #ff007f22 76%, transparent 77%, transparent); background-size: 100px 100px; transform: rotateX(55deg) translateY(-200px); animation: gridScroll 15s linear infinite; }
        @keyframes gridScroll { from { transform: rotateX(55deg) translateY(-200px); } to { transform: rotateX(55deg) translateY(0px); } }
        .grid-horizon { position: absolute; top: 0; width: 100%; height: 100%; background: linear-gradient(to top, transparent, #0d0221); }

        .arcade-nav { position: relative; z-index: 100; border-bottom: 2px solid rgba(0, 242, 255, 0.2); background: rgba(13, 2, 33, 0.9); backdrop-filter: blur(20px); }
        .nav-wrap { max-width: 1400px; margin: 0 auto; padding: 12px 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { display: flex; align-items: center; gap: 12px; font-weight: 900; letter-spacing: 1px; color: #00f2ff; text-shadow: 0 0 10px #00f2ff66; font-size: 18px; }
        .nav-metrics { display: flex; gap: 30px; align-items: center; }
        .metric { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 900; color: #ff007f; text-transform: uppercase; }
        .metric-time { font-family: monospace; color: #00f2ff; font-size: 13px; letter-spacing: 1px; }
        .lang-toggle { display: flex; gap: 5px; background: #1a1a2e; padding: 4px; border-radius: 6px; border: 1px solid #00f2ff33; }
        .lang-toggle button { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 900; padding: 4px 12px; cursor: pointer; border-radius: 4px; transition: 0.2s; }
        .lang-toggle button.active { background: #ff007f; color: #fff; box-shadow: 0 0 10px #ff007f66; }
        
        .font-controls { display: flex; gap: 5px; background: #1a1a2e; padding: 4px; border-radius: 6px; border: 1px solid #00f2ff33; }
        .font-controls button { background: none; border: none; color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 900; padding: 4px 8px; cursor: pointer; border-radius: 4px; transition: 0.2s; }
        .font-controls button:hover { background: rgba(0, 242, 255, 0.2); color: #00f2ff; }

        .hero-arcade { position: relative; padding: 100px 0; min-height: 85vh; display: flex; align-items: center; }
        .hero-main-content { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; width: 100%; }
        .insert-coin { color: #faff00; font-weight: 900; letter-spacing: 4px; font-size: 15px; margin-bottom: 20px; text-shadow: 0 0 20px #faff0088; }
        .arcade-title { font-size: clamp(80px, 10vw, 160px); line-height: 0.85; font-weight: 900; margin-bottom: 30px; letter-spacing: -3px; }
        .arcade-title span { color: transparent; -webkit-text-stroke: 4px #ff007f; filter: drop-shadow(0 0 20px #ff007f); }
        .hero-desc { font-size: calc(clamp(18px, 1.8vw, 24px) * var(--font-scale, 1)); color: rgba(255,255,255,0.85); max-width: 600px; line-height: 1.4; margin-bottom: 50px; }
        .hero-actions { display: flex; align-items: center; gap: 30px; }
        
        .btn-start { 
          background: #ff007f; 
          color: white; 
          border: none; 
          padding: 25px 70px; 
          font-size: clamp(20px, 2.5vw, 32px); 
          font-weight: 900; 
          border-radius: 12px; 
          cursor: pointer; 
          box-shadow: 8px 8px 0 #00f2ff, 0 0 30px rgba(255, 0, 127, 0.4); 
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }
        .btn-start:hover { transform: translate(-4px, -4px) scale(1.05); box-shadow: 12px 12px 0 #00f2ff, 0 0 50px rgba(255, 0, 127, 0.6); }
        .high-score-marker { display: flex; align-items: center; gap: 10px; color: #faff00; font-weight: 900; font-size: 14px; opacity: 0.8; }

        .arcade-cabinet-frame { 
          position: relative; 
          background: #1a1a2e; 
          padding: 15px; 
          border-radius: 30px 30px 15px 15px; 
          border: 6px solid #30336b; 
          box-shadow: 0 0 80px rgba(108, 92, 231, 0.4), inset 0 0 40px rgba(0, 242, 255, 0.2);
          transform: perspective(1200px) rotateY(-6deg);
        }
        .cabinet-img { width: 100%; border-radius: 20px; border: 3px solid #00f2ff44; display: block; }
        
        .section-header.centered { text-align: center; margin-bottom: 80px; }
        .pre-title { color: #ff007f; font-weight: 900; font-size: 13px; letter-spacing: 3px; margin-bottom: 12px; text-transform: uppercase; }
        .section-title { font-size: clamp(36px, 5vw, 70px); font-weight: 900; color: #00f2ff; text-shadow: 0 0 20px #00f2ff66; text-transform: uppercase; margin: 0; }
        .section-subtitle { font-size: calc(18px * var(--font-scale, 1)); color: rgba(255,255,255,0.6); margin-top: 10px; font-weight: 500; }
        .separator { width: 100px; height: 6px; background: #ff007f; margin: 20px auto 0; border-radius: 3px; box-shadow: 0 0 15px #ff007f; }

        .training-overview-section { padding: 80px 0; background: rgba(13, 2, 33, 0.5); }
        .roadmap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-top: 50px; }
        .dimension-col { background: rgba(255, 255, 255, 0.02); border: 2px solid var(--accent); padding: 30px; border-radius: 20px; box-shadow: inset 0 0 15px rgba(255,255,255,0.03); }
        .dim-header { display: flex; align-items: center; gap: 15px; font-weight: 900; color: var(--accent); margin-bottom: 25px; font-size: 18px; letter-spacing: 1px; }
        .dim-content { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 25px; }
        .level-dot { position: relative; background: #000; border: 2px solid rgba(255,255,255,0.1); border-radius: 8px; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-weight: 900; color: rgba(255,255,255,0.2); transition: 0.3s; font-size: 10px; text-align: center; letter-spacing: 0.5px; cursor: default; }
        .level-dot.active { border-color: var(--accent); color: #000; box-shadow: 0 0 20px var(--accent); background: var(--accent); }
        .level-dot svg { opacity: 0.6; margin-bottom: 2px; }
        .level-dot.active svg { opacity: 1; }
        .level-dot:hover { transform: scale(1.05); z-index: 20; color: white; border-color: var(--accent); }
        
        .level-tooltip { position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%) translateY(10px); width: 220px; background: rgba(13, 2, 33, 0.98); border: 2px solid var(--accent); border-radius: 12px; padding: 12px; opacity: 0; visibility: hidden; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px var(--accent); }
        .level-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 8px; border-style: solid; border-color: var(--accent) transparent transparent transparent; }
        .level-dot:hover .level-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
        
        .tooltip-hologram { position: relative; margin-bottom: 12px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; background: #000; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); }
        .holo-bg { position: absolute; inset: 0; opacity: 0.15; }
        .holo-icon { position: relative; z-index: 2; color: var(--accent); filter: drop-shadow(0 0 10px var(--accent)); transform: scale(1); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .level-dot:hover .holo-icon { transform: scale(1.15) translateY(-2px); }
        .holo-scanline { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(255,255,255,0.8); box-shadow: 0 0 10px white, 0 0 20px var(--accent); opacity: 0.5; animation: scanline 2.5s linear infinite; z-index: 3; }
        @keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
        
        .badge-overlay { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.85); color: #faff00; font-size: 9px; padding: 4px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px; font-weight: 900; letter-spacing: 0.5px; border: 1px solid #faff0066; z-index: 4; }
        .tooltip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .lvl-num { background: var(--accent); color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 900; }
        .level-tooltip h4 { font-size: calc(13px * var(--font-scale, 1)); color: var(--accent); text-transform: uppercase; letter-spacing: 1px; font-weight: 900; margin-bottom: 0; }
        .level-tooltip p { font-size: calc(11px * var(--font-scale, 1)); color: rgba(255,255,255,0.85); line-height: 1.4; text-transform: none; letter-spacing: 0; font-weight: 500; }

        .dim-desc { font-size: calc(13px * var(--font-scale, 1)); color: rgba(255,255,255,0.5); line-height: 1.5; }

        .visual-showcase-section { padding: 100px 0; }
        .showcase-carousel { display: flex; flex-direction: column; gap: 100px; }
        .showcase-item { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; }
        .showcase-item.reverse { grid-template-columns: 1fr 1.2fr; }
        
        .showcase-img-wrap { position: relative; border-radius: 20px; overflow: hidden; border: 4px solid rgba(0, 242, 255, 0.2); box-shadow: 0 0 40px rgba(0, 242, 255, 0.15); }
        .showcase-img-wrap img { width: 100%; display: block; object-fit: cover; }
        .img-overlay { position: absolute; inset: 0; background: linear-gradient(45deg, rgba(0,0,0,0.6) 0%, transparent 70%); }
        .showcase-info h3 { font-size: clamp(22px, 3.5vw, 38px); font-weight: 900; margin-bottom: 20px; color: white; letter-spacing: 1px; }
        .showcase-info p { font-size: calc(16px * var(--font-scale, 1)); color: rgba(255,255,255,0.7); line-height: 1.5; }

        .mission-grid-section { padding: 100px 0; }
        .missions-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        
        .mission-card { background: rgba(26, 26, 46, 0.95); border: 4px solid var(--card-color); border-radius: 25px; overflow: hidden; transition: 0.3s; cursor: pointer; }
        .card-image { position: relative; height: 220px; overflow: hidden; }
        .card-content { padding: 30px; }
        .card-title { font-size: 24px; font-weight: 900; color: white; margin-bottom: 8px; }
        .card-subtitle { color: var(--card-color); font-weight: 900; font-size: 13px; text-transform: uppercase; margin-bottom: 15px; }
        .card-desc { font-size: calc(15px * var(--font-scale, 1)); color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 25px; }

        .inside-the-academy { padding: 100px 0; }
        .glass-panel { 
          background: rgba(255, 255, 255, 0.02); 
          border: 2px solid rgba(255, 255, 255, 0.1); 
          border-radius: 50px; 
          padding: 80px; 
          display: grid; 
          grid-template-columns: 1fr 1.1fr; 
          gap: 80px; 
          backdrop-filter: blur(25px);
          align-items: center;
        }
        .panel-desc { font-size: calc(18px * var(--font-scale, 1)); color: rgba(255,255,255,0.85); line-height: 1.5; margin-bottom: 30px; }
        .feature-list { list-style: none; margin-bottom: 40px; padding: 0; }
        .feature-list li { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; font-size: calc(17px * var(--font-scale, 1)); font-weight: 700; color: #00f2ff; }
        .btn-override { background: #00f2ff; border: none; color: #000; padding: 20px 45px; border-radius: 10px; font-weight: 900; cursor: pointer; font-size: 18px; box-shadow: 0 0 25px rgba(0, 242, 255, 0.25); }

        .engine-room { padding: 100px 0; background: #080118; border-top: 3px solid #ff00ff22; }
        .engine-content { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 60px; align-items: center; }
        .engine-text h2 { margin-bottom: 20px; }
        .engine-subtitle { font-size: calc(16px * var(--font-scale, 1)); color: rgba(255,255,255,0.6); line-height: 1.5; }

        .arcade-footer { background: #080118; padding: 60px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); }
        .footer-wrap { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; color: rgba(255,255,255,0.3); font-size: 12px; font-weight: 700; }

        @media (max-width: 1200px) {
          .nav-metrics .metric { display: none; }
          .nav-metrics { gap: 20px; }
        }

        @media (max-width: 900px) {
          .hero-main-content { grid-template-columns: 1fr; gap: 40px; text-align: center; }
          .hero-text-block { display: flex; flex-direction: column; align-items: center; }
          .hero-visual { max-width: 500px; margin: 0 auto; order: -1; }
          .arcade-cabinet-frame { transform: none; }
          .hero-desc { margin-left: auto; margin-right: auto; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-start { width: 100%; max-width: 400px; }
          
          .showcase-item, .showcase-item.reverse { grid-template-columns: 1fr; gap: 40px; text-align: center; }
          .showcase-img-wrap { order: -1; }
          
          .glass-panel { grid-template-columns: 1fr; padding: 60px 40px; gap: 40px; }
          .preview-monitor { max-width: 500px; margin: 0 auto; }
          
          .engine-content { grid-template-columns: 1fr; text-align: center; }
        }

        @media (max-width: 600px) {
          .nav-wrap { padding: 10px 20px; }
          .nav-logo span { display: none; }
          .hero-arcade { padding: 60px 20px; }
          .arcade-title { font-size: 60px; }
          .section-title { font-size: 32px; }
          .missions-container { grid-template-columns: 1fr; }
          .roadmap-grid { grid-template-columns: 1fr; }
          .container { padding: 0 20px; }
          .glass-panel { border-radius: 30px; padding: 40px 20px; }
        }
      `}</style>
    </div>
  );
};
