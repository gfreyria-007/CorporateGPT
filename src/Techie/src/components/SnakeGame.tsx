import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as gameAudio from '../utils/gameAudio';

// --- Constants ---
const BOARD_SIZE = 20;
const MAX_LEVEL = 30;
const POINTS_PER_LEVEL = 10;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const DIRECTIONS: { [key: string]: { x: number; y: number } } = {
  'ArrowUp': { x: 0, y: -1 },
  'ArrowDown': { x: 0, y: 1 },
  'ArrowLeft': { x: -1, y: 0 },
  'ArrowRight': { x: 1, y: 0 },
};

interface Question {
  text: string;
  options: number[];
  correct: number;
}

// --- Helper Functions ---
const getSpeedForLevel = (level: number): number => {
    return Math.max(50, 180 - (level * 5));
};

// --- Custom Hook for Interval ---
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// --- Main Game Component ---
const SnakeGame: React.FC<{ onClose: () => void, onAwardBadge?: (id: string, name: string, desc: string, icon: string) => void }> = ({ onClose, onAwardBadge }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState({ x: 1, y: 0 }); 
  
  const lastProcessedDirection = useRef({ x: 1, y: 0 });

  const [speed, setSpeed] = useState<number | null>(getSpeedForLevel(1));
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [obstacles, setObstacles] = useState<{ x: number, y: number }[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // PAUSA-ZEN State
  const [pausedQuestion, setPausedQuestion] = useState<Question | null>(null);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);

  const generateObstacles = useCallback((level: number, currentSnake: { x: number, y: number }[], currentFood: { x: number, y: number }): { x: number, y: number }[] => {
    const numObstacles = level > 3 ? Math.floor((level - 1) / 3) * 2 : 0;
    if (numObstacles === 0) return [];

    const newObstacles: { x: number, y: number }[] = [];
    const occupied = new Set(currentSnake.map(s => `${s.x},${s.y}`));
    occupied.add(`${currentFood.x},${currentFood.y}`);

    for (let i = 0; i < numObstacles; i++) {
        let newObstacle;
        while (true) {
            newObstacle = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE),
            };
            const key = `${newObstacle.x},${newObstacle.y}`;
            if (!occupied.has(key)) {
                occupied.add(key);
                break;
            }
        }
        newObstacles.push(newObstacle);
    }
    return newObstacles;
  }, []);

  const generateFood = useCallback((currentSnake: { x: number, y: number }[], currentObstacles: { x: number, y: number }[]): { x: number, y: number } => {
    const occupied = new Set([
        ...currentSnake.map(s => `${s.x},${s.y}`),
        ...currentObstacles.map(o => `${o.x},${o.y}`),
    ]);
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      if (!occupied.has(`${newFood.x},${newFood.y}`)) {
        return newFood;
      }
    }
  }, []);

  const [food, setFood] = useState(() => generateFood(INITIAL_SNAKE, []));

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setObstacles([]);
    setFood(generateFood(INITIAL_SNAKE, []));
    
    setDirection({ x: 1, y: 0 });
    lastProcessedDirection.current = { x: 1, y: 0 };
    
    setScore(0);
    setLevel(1);
    setSpeed(getSpeedForLevel(1));
    setIsGameOver(false);
    setPausedQuestion(null);
  }, [generateFood]);

  const handleDirectionChange = useCallback((newDirection: { x: number; y: number }) => {
    if (newDirection && !showInstructions && !isGameOver && !pausedQuestion) {
      const lastDir = lastProcessedDirection.current;
      if (lastDir.x + newDirection.x !== 0 || lastDir.y + newDirection.y !== 0) {
        setDirection(newDirection);
      }
    }
  }, [showInstructions, isGameOver, pausedQuestion]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const newDirection = DIRECTIONS[e.key];
    if (newDirection) {
      e.preventDefault();
      handleDirectionChange(newDirection);
    }
  }, [handleDirectionChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const generateQuestion = (currentLevel: number): Question => {
      let num1, num2, answer, text;
      if (currentLevel < 5) {
         num1 = Math.floor(Math.random() * 10) + 1;
         num2 = Math.floor(Math.random() * 10) + 1;
         answer = num1 + num2;
         text = `¿Cuánto es ${num1} + ${num2}?`;
      } else if (currentLevel < 10) {
         num1 = Math.floor(Math.random() * 20) + 1;
         num2 = Math.floor(Math.random() * 10) + 1;
         if (Math.random() > 0.5) {
             answer = num1 + num2;
             text = `¿Cuánto es ${num1} + ${num2}?`;
         } else {
             const a = Math.max(num1, num2);
             const b = Math.min(num1, num2);
             answer = a - b;
             text = `¿Cuánto es ${a} - ${b}?`;
         }
      } else {
         num1 = Math.floor(Math.random() * 10) + 1;
         num2 = Math.floor(Math.random() * 10) + 1;
         answer = num1 * num2;
         text = `¿Cuánto es ${num1} x ${num2}?`;
      }
      
      const options = [answer];
      while(options.length < 3) {
         const wrong = answer + Math.floor(Math.random() * 10) - 5;
         if (wrong !== answer && wrong > 0 && !options.includes(wrong)) {
             options.push(wrong);
         }
      }
      options.sort(() => Math.random() - 0.5); 
      
      return { text, options, correct: answer };
  };

  const gameLoop = useCallback(() => {
    lastProcessedDirection.current = direction;

    const newSnake = [...snake];
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      setIsGameOver(true);
      gameAudio.playGameOverSound();
      return;
    }

    for (let i = 1; i < newSnake.length; i++) {
      if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
        setIsGameOver(true);
        gameAudio.playGameOverSound();
        return;
      }
    }

    if (obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
      setIsGameOver(true);
      gameAudio.playGameOverSound();
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        gameAudio.playEatSound();
        const nextScore = score + 1;
        setScore(nextScore);
        
        if (nextScore % POINTS_PER_LEVEL === 0) {
            // Stage Transition / Pausa Zen
            setSnake(newSnake);
            setPausedQuestion(generateQuestion(level));
            return;
        } else {
            setSnake(newSnake);
            setFood(generateFood(newSnake, obstacles));
            return;
        }
    } else {
        newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, level, obstacles]);
  
  useInterval(gameLoop, isGameOver || showInstructions || pausedQuestion || resumeCountdown !== null ? null : speed);

  useInterval(() => {
    if (resumeCountdown !== null) {
      if (resumeCountdown > 1) {
        setResumeCountdown(resumeCountdown - 1);
      } else {
        setResumeCountdown(null);
      }
    }
  }, resumeCountdown !== null ? 1000 : null);

  const handleAnswer = (option: number) => {
      if (option === pausedQuestion?.correct) {
          gameAudio.playLevelUpSound();
          
          const nextLevel = Math.min(MAX_LEVEL, level + 1);
          setLevel(nextLevel);
          setSpeed(getSpeedForLevel(nextLevel));

          if (nextLevel === 5 && onAwardBadge) {
              onAwardBadge('snake_master_5', 'Maestro de la Vibrita', 'Llegaste al Nivel 5 en Viborita', '🐍');
          } else if (nextLevel === 10 && onAwardBadge) {
              onAwardBadge('snake_master_10', 'Archimago de la Vibrita', 'Dominaste 10 etapas de la Vibrita', '🔮');
          } else if (nextLevel === 20 && onAwardBadge) {
              onAwardBadge('snake_king_20', 'Rey de las Etapas', '¡Llegaste a la etapa 20! Eres una leyenda.', '👑');
          }

          // Keep current snake but regenerate obstacles for the new level
          const newObstacles = generateObstacles(nextLevel, snake, { x: -1, y: -1 });
          setObstacles(newObstacles);
          setFood(generateFood(snake, newObstacles));

          setPausedQuestion(null);
          setResumeCountdown(3); 
      } else {
          // Zen mode: no penalty, just try again
          setShakeWrong(true);
          setTimeout(() => setShakeWrong(false), 500);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-800/80 border-2 border-cyan-400/50 rounded-2xl shadow-2xl shadow-cyan-500/20 p-4 sm:p-6 text-white w-full max-w-md sm:max-w-lg flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-cyan-400/30">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wider uppercase">
            <span className="text-cyan-400">Viborita</span> <span className="text-emerald-400">Pro</span>
          </h2>
          <div className="flex items-center space-x-4 text-sm sm:text-base">
            <p><strong>Puntos:</strong> <span className="text-cyan-300 font-mono">{score}</span></p>
            <p><strong>Nivel:</strong> <span className="text-cyan-300 font-mono">{level}/{MAX_LEVEL}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Game Board */}
        <div className="relative aspect-square w-full bg-black/50" style={{ backgroundSize: '20px 20px', backgroundImage: 'linear-gradient(to right, rgba(0, 128, 128, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 128, 128, 0.1) 1px, transparent 1px)' }}>
          {snake.map((segment, index) => (
            <div key={index} className="absolute bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-600 rounded-sm" style={{ width: `${100 / BOARD_SIZE}%`, height: `${100 / BOARD_SIZE}%`, left: `${segment.x * (100 / BOARD_SIZE)}%`, top: `${segment.y * (100 / BOARD_SIZE)}%`, zIndex: 1 }}>
              {index === 0 && <div className="w-1/3 h-1/3 bg-cyan-400 rounded-full m-auto animate-pulse"></div>}
            </div>
          ))}
          {!pausedQuestion && <div className="absolute rounded-full bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)] animate-pulse" style={{ width: `${100 / BOARD_SIZE}%`, height: `${100 / BOARD_SIZE}%`, left: `${food.x * (100 / BOARD_SIZE)}%`, top: `${food.y * (100 / BOARD_SIZE)}%` }}></div>}
          
          {obstacles.map((obs, index) => (
            <div key={`obs-${index}`} className="absolute bg-gradient-to-br from-red-700 to-red-900 border border-red-500/50 rounded-sm" style={{ width: `${100 / BOARD_SIZE}%`, height: `${100 / BOARD_SIZE}%`, left: `${obs.x * (100 / BOARD_SIZE)}%`, top: `${obs.y * (100 / BOARD_SIZE)}%` }}></div>
          ))}

          {/* Challenge Math Question Modal */}
          {pausedQuestion && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 animate-fade-in">
                <div className={`bg-gray-900 border-2 border-emerald-500 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl ${shakeWrong ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                    <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">Pausa de Desafío • ¡Recupera energía!</div>
                    <h3 className="text-4xl font-mono font-black text-white mb-8">{pausedQuestion.text}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {pausedQuestion.options.map((opt, i) => (
                            <button 
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                className="w-full py-4 bg-gray-800 hover:bg-emerald-600 border border-gray-700 hover:border-emerald-400 rounded-xl text-2xl font-mono font-bold transition-all active:scale-95"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {/* Instructions Screen */}
          {showInstructions && (
             <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-center p-4">
                <h3 className="text-3xl font-bold text-cyan-400 mb-4 uppercase tracking-widest">¡Viborita Pro!</h3>
                 <div className="space-y-3 text-base sm:text-lg">
                    <p><strong>Objetivo:</strong> Atrapa la energía <span className="text-emerald-400 font-bold">verde</span>.</p>
                    <p><strong>Desafío:</strong> Cada 10 puntos enfrentarás un reto matemático para avanzar de etapa.</p>
                    <p><strong>Preparación:</strong> Tras cada reto, tendrás 3 segundos para reaccionar antes de arrancar.</p>
                </div>
                <button
                    onClick={() => setShowInstructions(false)}
                    className="mt-8 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold transition-colors text-xl uppercase tracking-tighter"
                >
                    ¡COMENZAR!
                </button>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
             <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-center">
                <h3 className="text-4xl font-bold text-red-500 mb-2 animate-pulse">CHOCASTE</h3>
                <p className="text-lg mb-6">Puntuación Final: <span className="font-bold text-cyan-300">{score}</span></p>
                <div className="flex space-x-4">
                    <button onClick={resetGame} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-colors">Jugar de Nuevo</button>
                </div>
            </div>
          )}
          {/* Resume Countdown Overlay */}
          {resumeCountdown !== null && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-30">
                  <div className="text-8xl font-black text-cyan-400 animate-bounce">
                      {resumeCountdown}
                  </div>
                  <p className="text-xl font-bold text-white mt-4 uppercase tracking-widest">¡Prepárate!</p>
              </div>
          )}
        </div>
        
        {/* Joystick */}
        <div className="flex-grow flex flex-col justify-center items-center pt-2 min-h-[148px] sm:min-h-[164px]">
            {!isGameOver && !showInstructions && !pausedQuestion && (
                <>
                    <div className="grid grid-cols-3 grid-rows-3 w-32 h-32 sm:w-36 sm:h-36">
                        <button onTouchStart={(e) => {e.preventDefault(); handleDirectionChange(DIRECTIONS['ArrowUp'])}} onClick={() => handleDirectionChange(DIRECTIONS['ArrowUp'])} className="col-start-2 row-start-1 p-2 bg-gray-500/50 rounded-full active:bg-cyan-400/50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button onTouchStart={(e) => {e.preventDefault(); handleDirectionChange(DIRECTIONS['ArrowLeft'])}} onClick={() => handleDirectionChange(DIRECTIONS['ArrowLeft'])} className="col-start-1 row-start-2 p-2 bg-gray-500/50 rounded-full active:bg-cyan-400/50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onTouchStart={(e) => {e.preventDefault(); handleDirectionChange(DIRECTIONS['ArrowRight'])}} onClick={() => handleDirectionChange(DIRECTIONS['ArrowRight'])} className="col-start-3 row-start-2 p-2 bg-gray-500/50 rounded-full active:bg-cyan-400/50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button onTouchStart={(e) => {e.preventDefault(); handleDirectionChange(DIRECTIONS['ArrowDown'])}} onClick={() => handleDirectionChange(DIRECTIONS['ArrowDown'])} className="col-start-2 row-start-3 p-2 bg-gray-500/50 rounded-full active:bg-cyan-400/50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;