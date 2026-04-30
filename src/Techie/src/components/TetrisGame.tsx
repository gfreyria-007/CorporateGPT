import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as gameAudio from '../utils/gameAudio';

// --- Constants ---
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const POINTS_PER_LINE = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines

const TETROMINOES: { [key: string]: { shape: number[][]; color: string; shadow: string } } = {
  'I': { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500', shadow: 'shadow-cyan-400/50' },
  'J': { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-600', shadow: 'shadow-blue-500/50' },
  'L': { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500', shadow: 'shadow-orange-400/50' },
  'O': { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400', shadow: 'shadow-yellow-300/50' },
  'S': { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500', shadow: 'shadow-green-400/50' },
  'T': { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-600', shadow: 'shadow-purple-500/50' },
  'Z': { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500', shadow: 'shadow-red-400/50' }
};
const TETROMINO_KEYS = Object.keys(TETROMINOES);

// --- Helper Functions ---
const createEmptyBoard = (): (string | null)[][] => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

// Speed formula: Start at 800ms, decrease by 15ms per line, cap at 50ms (very fast)
const getSpeed = (lines: number) => Math.max(50, 800 - (lines * 15));

// --- Custom Hook for Interval ---
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<(() => void) | null>(null);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    function tick() { if (savedCallback.current) savedCallback.current(); }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// --- Main Game Component ---
const TetrisGame: React.FC<{ onClose: () => void, onAwardBadge?: (id: string, name: string, desc: string, icon: string) => void }> = ({ onClose, onAwardBadge }) => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: { shape: [[0]], color: '', shadow: '' },
    collided: false,
  });
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Derived level for scoring multiplier (still rewards clearing lines at higher speeds)
  const currentLevel = Math.floor(linesCleared / 10) + 1;
  
  // Robust collision detection
  const checkCollision = useCallback((p: typeof player, b: (string | null)[][]): boolean => {
    for (let y = 0; y < p.tetromino.shape.length; y++) {
      for (let x = 0; x < p.tetromino.shape[y].length; x++) {
        // Only check occupied cells of the tetromino shape
        if (p.tetromino.shape[y][x] !== 0) {
          const boardY = y + p.pos.y;
          const boardX = x + p.pos.x;

          // 1. Check Vertical Bounds (Bottom floor or Top ceiling if out of range)
          if (boardY >= BOARD_HEIGHT || boardY < 0) {
            return true;
          }

          // 2. Check Horizontal Bounds (Walls)
          // Also implicitly checks if the row exists in board, but we double check b[boardY] just in case
          if (boardX < 0 || boardX >= BOARD_WIDTH || !b[boardY]) {
            return true;
          }

          // 3. Check Cell Occupancy
          if (b[boardY][boardX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const resetPlayer = useCallback(() => {
    const randomTetrominoKey = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    const newTetromino = TETROMINOES[randomTetrominoKey];
    
    // Start at middle-top
    const newPlayer = {
      pos: { x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(newTetromino.shape[0].length / 2), y: 0 },
      tetromino: newTetromino,
      collided: false,
    };

    // Immediate collision check at spawn (Game Over condition)
    if (checkCollision(newPlayer, board)) {
      setIsGameOver(true);
      setSpeed(null);
      gameAudio.playTetrisGameOverSound();
    } else {
      setPlayer(newPlayer);
    }
  }, [board, checkCollision]);

  // Initial Game Start
  useEffect(() => {
    if (!showInstructions) {
      resetPlayer();
      setSpeed(getSpeed(0));
    }
  }, [showInstructions, resetPlayer]);
  
  // Speed Update Logic
  useEffect(() => {
    if (!showInstructions && !isGameOver) {
        setSpeed(getSpeed(linesCleared));
    }
  }, [linesCleared, showInstructions, isGameOver]);
  
  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided?: boolean }) => {
    const newPos = { x: player.pos.x + x, y: player.pos.y + y };
    const newPlayer = { ...player, pos: newPos, collided: collided || player.collided };
    if (!checkCollision(newPlayer, board)) {
      setPlayer(newPlayer);
    }
  };

  const rotate = (matrix: number[][]): number[][] => {
    const transposed = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    return transposed.map(row => row.reverse());
  };

  const rotatePlayer = () => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape);

    // Wall kick logic (basic)
    let offset = 1;
    while (checkCollision(clonedPlayer, board)) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino.shape[0].length) {
        return; // Rotation failed, cancel
      }
    }
    setPlayer(clonedPlayer);
    gameAudio.playRotateSound();
  };
  
  const drop = () => {
    const newPlayer = { ...player, pos: { ...player.pos, y: player.pos.y + 1 } };
    if (checkCollision(newPlayer, board)) {
      // If we collide immediately upon trying to move down from the top area, it's a block-out
      if (player.pos.y < 1) {
        setIsGameOver(true);
        setSpeed(null);
        gameAudio.playTetrisGameOverSound();
        return;
      }
      setPlayer(prev => ({ ...prev, collided: true }));
    } else {
      setPlayer(newPlayer);
    }
  };
  
  const hardDrop = () => {
    let newPlayer = JSON.parse(JSON.stringify(player));
    // Simulate drops until collision
    while(!checkCollision(newPlayer, board)) {
      newPlayer.pos.y++;
    }
    // Back up one step (to the last valid position)
    newPlayer.pos.y--;
    newPlayer.collided = true;
    setPlayer(newPlayer);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent | string) => {
    if (isGameOver || showInstructions) return;
    const key = typeof e === 'string' ? e : e.key;
    if (key === 'ArrowLeft') updatePlayerPos({ x: -1, y: 0 });
    else if (key === 'ArrowRight') updatePlayerPos({ x: 1, y: 0 });
    else if (key === 'ArrowDown') drop();
    else if (key === 'ArrowUp') rotatePlayer();
    else if (key === ' ') hardDrop();
  }, [player, board, isGameOver, showInstructions, checkCollision]);

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [handleKeyDown]);
  
  // Game Loop / Collision handling effect
  useEffect(() => {
    if (player.collided) {
        const newBoard = JSON.parse(JSON.stringify(board));
        // Lock the piece into the board
        player.tetromino.shape.forEach((row: number[], y: number) => {
            row.forEach((value: number, x: number) => {
                if (value !== 0) {
                    const boardY = y + player.pos.y;
                    const boardX = x + player.pos.x;
                    // Ensure we are within bounds before writing (safety check)
                    if (newBoard[boardY] && newBoard[boardY][boardX] !== undefined) {
                        newBoard[boardY][boardX] = player.tetromino.color;
                    }
                }
            });
        });

        // Sweep rows
        let rowsToClear = 0;
        const sweptBoard = newBoard.reduce((acc: (string | null)[][], row: (string | null)[]) => {
            if (row.every(cell => cell !== null)) {
                rowsToClear++;
                // Add new empty row at top
                acc.unshift(Array(BOARD_WIDTH).fill(null));
                return acc;
            }
            acc.push(row);
            return acc;
        }, []);
        
        if (rowsToClear > 0) {
            setScore(prev => prev + POINTS_PER_LINE[rowsToClear] * currentLevel);
            const nextLines = linesCleared + rowsToClear;
            setLinesCleared(nextLines);
            gameAudio.playLineClearSound();

            if (nextLines >= 10 && linesCleared < 10 && onAwardBadge) {
                onAwardBadge('tetris_pro_10', 'Ingeniero de Bloques', 'Limpiaste 10 líneas en Tetris', '🧱');
            }
        }

        setBoard(sweptBoard);
        resetPlayer(); // Spawn new piece
    }
  }, [player.collided, board, resetPlayer, currentLevel, player.pos.x, player.pos.y, player.tetromino.shape, player.tetromino.color]);

  useInterval(() => { drop(); }, speed);
  
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLinesCleared(0);
    setIsGameOver(false);
    setSpeed(getSpeed(0));
    resetPlayer();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-800/80 border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20 p-4 sm:p-6 text-white w-full max-w-md sm:max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-purple-400/30">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-purple-300">TETRIS</h2>
          <div className="flex flex-col items-end text-sm sm:text-base">
            <p><strong>Puntos:</strong> <span className="text-purple-300 font-mono">{score}</span></p>
            <p><strong>Líneas:</strong> <span className="text-purple-300 font-mono">{linesCleared}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Game Board */}
        <div className="relative aspect-[1/2] w-full max-w-[250px] sm:max-w-[300px] mx-auto bg-black/50" style={{ backgroundSize: '10% 5%', backgroundImage: 'linear-gradient(to right, rgba(167, 139, 250, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(167, 139, 250, 0.1) 1px, transparent 1px)' }}>
            {/* Renderizar tablero */}
            {board.map((row, y) => row.map((cell, x) => cell && (
                <div key={`${y}-${x}`} className={`absolute ${cell} shadow-lg`} style={{ width: '10%', height: '5%', left: `${x * 10}%`, top: `${y * 5}%` }}></div>
            )))}
            {/* Renderizar pieza actual */}
            {player.tetromino.shape.map((row, y) => row.map((cell, x) => cell && (
                <div key={`${y}-${x}`} className={`absolute ${player.tetromino.color} ${player.tetromino.shadow} shadow-lg`} style={{ width: '10%', height: '5%', left: `${(player.pos.x + x) * 10}%`, top: `${(player.pos.y + y) * 5}%` }}></div>
            )))}

            {showInstructions && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-center p-4">
                    <h3 className="text-3xl font-bold text-purple-400 mb-4">¡Bienvenido a Tetris!</h3>
                    <div className="space-y-3 text-base">
                        <p><strong>Objetivo:</strong> Completa líneas horizontales para ganar puntos. ¡Cada línea aumenta la velocidad!</p>
                        <p><strong>Controles:</strong></p>
                        <ul className="list-disc list-inside">
                            <li><strong>Flechas Izq/Der:</strong> Mover</li>
                            <li><strong>Flecha Arriba:</strong> Rotar</li>
                            <li><strong>Flecha Abajo:</strong> Bajar lento</li>
                            <li><strong>Espacio:</strong> Bajar rápido</li>
                        </ul>
                    </div>
                    <button onClick={() => setShowInstructions(false)} className="mt-8 px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors text-xl">¡A Jugar!</button>
                </div>
            )}
            {isGameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-center">
                    <h3 className="text-4xl font-bold text-red-500 mb-2 animate-pulse">FIN DEL JUEGO</h3>
                    <p className="text-lg mb-2">Puntuación: <span className="font-bold text-purple-300">{score}</span></p>
                    <p className="text-lg mb-6">Líneas Totales: <span className="font-bold text-purple-300">{linesCleared}</span></p>
                    <div className="flex space-x-4">
                        <button onClick={resetGame} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold">Jugar de Nuevo</button>
                        <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold">Cerrar</button>
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex-grow flex flex-col justify-center items-center pt-2 min-h-[148px] sm:min-h-[164px]">
            {!isGameOver && !showInstructions && (
                <div className="grid grid-cols-3 grid-rows-3 w-32 h-32 sm:w-36 sm:h-36">
                    <button onTouchStart={(e)=>{e.preventDefault(); handleKeyDown('ArrowUp')}} onClick={() => handleKeyDown('ArrowUp')} className="col-start-2 row-start-1 p-2 bg-gray-500/50 rounded-full active:bg-purple-400/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M4 9h5V4m11 11v-5h-5m5 5h-5v-5" /></svg>
                    </button>
                    <button onTouchStart={(e)=>{e.preventDefault(); handleKeyDown('ArrowLeft')}} onClick={() => handleKeyDown('ArrowLeft')} className="col-start-1 row-start-2 p-2 bg-gray-500/50 rounded-full active:bg-purple-400/50 flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onTouchStart={(e)=>{e.preventDefault(); handleKeyDown('ArrowRight')}} onClick={() => handleKeyDown('ArrowRight')} className="col-start-3 row-start-2 p-2 bg-gray-500/50 rounded-full active:bg-purple-400/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button onTouchStart={(e)=>{e.preventDefault(); handleKeyDown('ArrowDown')}} onClick={() => handleKeyDown('ArrowDown')} className="col-start-2 row-start-3 p-2 bg-gray-500/50 rounded-full active:bg-purple-400/50 flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;