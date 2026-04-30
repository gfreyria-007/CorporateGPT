import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, ShieldAlert, Sparkles, Rocket, Info, CheckCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module7_Prompting: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress, t, language } = useApp();
  const [step, setStep] = useState(1);
  const [promptBlocks, setPromptBlocks] = useState<{task: string, context: string, limit: string}>({task: '', context: '', limit: ''});
  const [feedback, setFeedback] = useState<string | null>(null);

  const TASKS = [
    { id: 't1', text: language === 'es' ? 'Navegar por los asteroides' : 'Navigate through the asteroids' },
    { id: 't2', text: language === 'es' ? 'Limpiar el parabrisas' : 'Clean the windshield' }
  ];
  
  const CONTEXTS = [
    { id: 'c1', text: language === 'es' ? 'con motores al 100%' : 'with engines at 100%' },
    { id: 'c2', text: language === 'es' ? 'lentamente y con cuidado' : 'slowly and carefully' }
  ];

  const LIMITS = [
    { id: 'l1', text: language === 'es' ? 'sin chocar con nada.' : 'without hitting anything.' },
    { id: 'l2', text: language === 'es' ? 'en menos de 5 segundos.' : 'in less than 5 seconds.' }
  ];

  const checkPrompt = () => {
    if (promptBlocks.task && promptBlocks.context && promptBlocks.limit) {
      if (promptBlocks.context.includes('cuidadosamente') || promptBlocks.context.includes('carefully')) {
        setStep(3);
      } else {
        setFeedback(language === 'es' ? '¡Demasiado rápido! Los motores al 100% son peligrosos en un campo de asteroides. Intenta ser más específico con la seguridad.' : 'Too fast! 100% engines are dangerous in an asteroid field. Try being more specific about safety.');
      }
    }
  };

  return (
    <div className="prompt-lab">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" className="lab-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bridge-view">
              <img src="/ai_spaceship_bridge_view_1776894160444.png" alt="Bridge" className="bridge-img" />
              <div className="ai-console">
                <div className="console-header"><Terminal size={14} /> AI_NAV_SYSTEM_ERROR</div>
                <div className="console-body">
                  <p className="bad-prompt">"{language === 'es' ? '¡Mueve el barco ahora!' : 'Move the ship now!'}"</p>
                  <p className="ai-response"> {'>'} {language === 'es' ? 'ERROR: Comando vago. ¿Hacia dónde? ¿Cómo? ¿A qué velocidad?' : 'ERROR: Vague command. Where? How? What speed?'}</p>
                </div>
              </div>
            </div>

            <div className="concept-card">
              <Info size={24} color="#6c5ce7" />
              <h3>{language === 'es' ? 'El Secreto del "Prompting"' : 'The Secret of Prompting'}</h3>
              <p>{language === 'es' ? 'Un Prompt es una orden para la IA. Para que funcione bien, necesita: TAREA + CONTEXTO + REGLAS.' : 'A Prompt is an order for the AI. To work well, it needs: TASK + CONTEXT + RULES.'}</p>
            </div>

            <button className="mission-btn" onClick={() => setStep(2)}>{language === 'es' ? 'Arreglar Comandos' : 'Fix Commands'}</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" className="lab-step" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="prompt-builder">
              <div className="builder-header">
                <Sparkles size={20} color="#f9ca24" />
                <span>{language === 'es' ? 'CONSTRUCTOR DE ÓRDENES' : 'COMMAND BUILDER'}</span>
              </div>

              <div className="block-selector">
                <div className="block-col">
                  <label>TAREA</label>
                  {TASKS.map(t => <button key={t.id} className={promptBlocks.task === t.text ? 'active' : ''} onClick={() => setPromptBlocks({...promptBlocks, task: t.text})}>{t.text}</button>)}
                </div>
                <div className="block-col">
                  <label>CONTEXTO</label>
                  {CONTEXTS.map(c => <button key={c.id} className={promptBlocks.context === c.text ? 'active' : ''} onClick={() => setPromptBlocks({...promptBlocks, context: c.text})}>{c.text}</button>)}
                </div>
                <div className="block-col">
                  <label>REGLA</label>
                  {LIMITS.map(l => <button key={l.id} className={promptBlocks.limit === l.text ? 'active' : ''} onClick={() => setPromptBlocks({...promptBlocks, limit: l.text})}>{l.text}</button>)}
                </div>
              </div>

              <div className="prompt-preview">
                <label>{language === 'es' ? 'VISTA PREVIA DEL PROMPT:' : 'PROMPT PREVIEW:'}</label>
                <p>
                  <span className="task">{promptBlocks.task || '...'}</span>{' '}
                  <span className="context">{promptBlocks.context || '...'}</span>{' '}
                  <span className="limit">{promptBlocks.limit || '...'}</span>
                </p>
              </div>

              {feedback && <div className="prompt-error"><ShieldAlert size={16} /> {feedback}</div>}

              <button className="mission-btn" disabled={!promptBlocks.task || !promptBlocks.context || !promptBlocks.limit} onClick={checkPrompt}>
                {language === 'es' ? 'EJECUTAR COMANDO' : 'EXECUTE COMMAND'} <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" className="lab-step" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="success-viz">
              <motion.div className="ship-anim" animate={{ x: [-20, 20, -20], y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4 }}>
                <Rocket size={80} color="#00d1b2" />
              </motion.div>
              <div className="star-field-bg" />
            </div>
            <h2>{language === 'es' ? '¡Órdenes Claras, Vuelo Seguro!' : 'Clear Orders, Safe Flight!'}</h2>
            <p>{language === 'es' ? 'Has aprendido la habilidad más importante: hablar el lenguaje de la IA con precisión.' : 'You’ve learned the most important skill: speaking the AI’s language with precision.'}</p>
            <button className="mission-btn" onClick={() => { updateProgress({ unlockedLevel: 8, completedModules: ['7'], energyCores: 20 }); onComplete(); }}>
              {language === 'es' ? 'Misión Finalizada' : 'Mission Finalized'} <CheckCircle size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .prompt-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .lab-step { width: 100%; max-width: 900px; display: flex; flex-direction: column; align-items: center; gap: 30px; text-align: center; }
        
        .bridge-view { position: relative; width: 100%; height: 400px; border-radius: 30px; overflow: hidden; border: 2px solid #1a1a2e; }
        .bridge-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
        
        .ai-console { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; background: rgba(0,0,0,0.8); border: 1px solid #ff7675; border-radius: 12px; overflow: hidden; }
        .console-header { background: #ff7675; color: white; padding: 5px 15px; font-size: 10px; font-weight: 900; display: flex; align-items: center; gap: 8px; }
        .console-body { padding: 20px; text-align: left; }
        .bad-prompt { color: #ff7675; font-weight: 700; margin-bottom: 10px; }
        .ai-response { color: #fff; font-family: monospace; font-size: 12px; }

        .prompt-builder { background: #151525; padding: 40px; border-radius: 30px; border: 1px solid rgba(108, 92, 231, 0.3); width: 100%; }
        .builder-header { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 900; color: #a29bfe; letter-spacing: 2px; margin-bottom: 30px; }
        
        .block-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .block-col { display: flex; flex-direction: column; gap: 10px; }
        .block-col label { font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.3); }
        .block-col button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px; border-radius: 10px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .block-col button.active { background: #6c5ce7; border-color: #6c5ce7; box-shadow: 0 0 15px rgba(108, 92, 231, 0.4); }

        .prompt-preview { background: #000; padding: 25px; border-radius: 20px; border: 1px dashed rgba(108, 92, 231, 0.5); text-align: left; }
        .prompt-preview label { font-size: 9px; color: #a29bfe; font-weight: 900; display: block; margin-bottom: 10px; }
        .prompt-preview p { margin: 0; font-size: 16px; font-weight: 600; line-height: 1.5; }
        .task { color: #ff7675; }
        .context { color: #00d1b2; }
        .limit { color: #f9ca24; }

        .prompt-error { background: rgba(255, 118, 117, 0.1); color: #ff7675; padding: 15px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; }

        .success-viz { position: relative; height: 200px; display: flex; align-items: center; justify-content: center; }
        .star-field-bg { position: absolute; inset: 0; background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 20px 20px; opacity: 0.2; }

        .concept-card { background: rgba(108, 92, 231, 0.05); padding: 25px; border-radius: 24px; border: 1px solid rgba(108, 92, 231, 0.1); display: flex; gap: 20px; align-items: center; text-align: left; }
        .mission-btn { background: #6c5ce7; color: white; border: none; padding: 18px 48px; border-radius: 18px; font-size: 18px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3); display: flex; align-items: center; gap: 12px; }
        .mission-btn:hover { transform: translateY(-3px); }
        .mission-btn:disabled { opacity: 0.3; }

        @media (max-width: 768px) {
          .bridge-view { height: 250px; border-radius: 20px; }
          .ai-console { width: 90%; }
          .concept-card { flex-direction: column; text-align: center; }
          .prompt-builder { padding: 20px; border-radius: 20px; }
          .block-selector { grid-template-columns: 1fr; gap: 15px; }
          .prompt-preview { padding: 15px; }
          .prompt-preview p { font-size: 14px; }
          .mission-btn { width: 100%; max-width: 300px; padding: 16px; font-size: 16px; }
          .success-viz { height: 150px; }
        }
      `}</style>
    </div>
  );
};
