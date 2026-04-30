
import React from 'react';

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: 'snake' | 'tetris' | 'aliens') => void;
}

const ArcadeModal: React.FC<ArcadeModalProps> = ({ isOpen, onClose, onSelectGame }) => {
  if (!isOpen) return null;

  const games = [
      {
          id: 'snake',
          title: 'Viborita Espacial',
          desc: 'Clásico Snake. Come energía, crece y no choques.',
          color: 'from-cyan-500 to-blue-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
      },
      {
          id: 'tetris',
          title: 'Tetris Blocks',
          desc: 'Acomoda los bloques y completa líneas.',
          color: 'from-purple-500 to-pink-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )
      },
      {
          id: 'aliens',
          title: 'Space Aliens',
          desc: 'Defiende la tierra de la invasión alienígena.',
          color: 'from-green-500 to-emerald-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          )
      }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={onClose}>
        <div className="bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
            <style>{`
            @keyframes fade-in-scale {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            `}</style>
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ZONA ARCADE</h2>
                    <p className="text-gray-400 text-sm">Diviértete y aprende jugando</p>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {games.map((game) => (
                    <button
                        key={game.id}
                        onClick={() => onSelectGame(game.id as any)}
                        className={`
                            relative group overflow-hidden rounded-2xl p-6 text-left h-48 flex flex-col justify-between
                            bg-gradient-to-br ${game.color}
                            shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300
                        `}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                             {game.icon}
                        </div>
                        
                        <div className="z-10 bg-black/20 backdrop-blur-sm p-3 rounded-xl w-fit mb-2">
                             {game.icon}
                        </div>
                        
                        <div className="z-10">
                            <h3 className="text-white font-bold text-lg mb-1 shadow-black drop-shadow-md">{game.title}</h3>
                            <p className="text-white/80 text-xs font-medium leading-tight">{game.desc}</p>
                        </div>

                        {/* Scanline effect overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
                    </button>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                 <p className="text-gray-500 text-xs font-mono">INSERT COIN TO PLAY (Just kidding, it's free!)</p>
            </div>
        </div>
    </div>
  );
};

export default ArcadeModal;
