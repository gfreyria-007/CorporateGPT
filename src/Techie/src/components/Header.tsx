import React from 'react';
import { Badge } from '../types';
import { useAuth } from '../core/AuthContext';

interface HeaderProps {
  onResetProfile?: () => void;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  onOpenAdmin?: () => void;
  onOpenSettings?: () => void;
  onOpenFAQ?: () => void;
  onOpenArcade?: () => void;
  onOpenMathLab?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onResetProfile, onIncreaseFont, onDecreaseFont, canIncrease, canDecrease,
  onOpenAdmin, onOpenSettings, onOpenFAQ, onOpenArcade, onOpenMathLab, 
  isMuted, onToggleMute
}) => {
  const { profile, isAdmin } = useAuth();
  const badges = profile?.badges || [];
  
  const level = Math.floor(badges.length / 3) + 1;
  const badgesInLevel = badges.length % 3;
  const progress = (badgesInLevel / 3) * 100;

  return (
    <header className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-[60] bg-white/70 backdrop-blur-2xl px-4 sm:px-6 py-2 sm:py-4 rounded-[2rem] sm:rounded-[2.5rem] border border-white shadow-2xl premium-shadow-lg flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex flex-col items-start cursor-pointer" onClick={onResetProfile} title="Reiniciar">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">CatalizIA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Techie</span>
            </div>
        </div>
        
        <div className="w-px h-8 bg-gray-100"></div>
        
        <div className="flex items-center space-x-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border border-blue-100 shadow-lg group hover:scale-110 transition-transform duration-500">
                <img 
                    src="/techie-mascot.png" 
                    alt="Techie Mascot" 
                    className="w-full h-full object-contain p-1 animate-pulse-gentle"
                />
            </div>
            <h1 className="text-sm sm:text-lg font-black text-blue-900 hidden sm:block uppercase tracking-tighter">
              <span>TECHIE</span>
              <span className="text-gray-400 ml-1">TUTOR AI</span>
            </h1>
        </div>
      </div>

      {/* Level Display */}
      <div className="flex flex-col items-center px-2 sm:px-6 flex-1 max-w-[200px]">
          <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.2em] whitespace-nowrap">Nivel {level}</span>
              <span className="text-xs sm:text-sm">✨</span>
          </div>
          <div className="w-full h-2 bg-blue-50 rounded-full mt-1 overflow-hidden border border-blue-100/50 shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: `${progress}%` }}></div>
          </div>
      </div>

      <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-200 shadow-sm gap-1">
        {isAdmin && (
          <button 
            onClick={onOpenAdmin}
            className="p-2 hover:bg-white text-purple-700 rounded-xl transition-all flex items-center gap-2"
            title="Panel de Administración"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Control Maestro</span>
          </button>
        )}

        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('openBackpack'))}
          className="p-2 hover:bg-white text-amber-600 rounded-xl transition-all flex items-center gap-2"
          title="Mochila del Explorador"
        >
          <span className="text-lg">🎒</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Mi Mochila</span>
        </button>

        <button 
          onClick={onOpenArcade}
          className="p-2 hover:bg-white text-indigo-600 rounded-xl transition-all flex items-center gap-2"
          title="Zona Arcade"
        >
          <span className="text-lg">🎮</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Arcade</span>
        </button>

        <button 
          onClick={onOpenMathLab}
          className="p-2 hover:bg-white text-blue-600 rounded-xl transition-all flex items-center gap-2"
          title="Laboratorio de Geometría"
        >
          <span className="text-lg">📐</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Laboratorio</span>
        </button>

        <button 
          onClick={onOpenFAQ}
          className="p-2 hover:bg-white text-green-600 rounded-xl transition-all flex items-center gap-2"
          title="Manual / FAQ"
        >
          <span className="text-lg">❓</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Ayuda</span>
        </button>

        {onOpenSettings && (
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-white text-blue-700 rounded-xl transition-all flex items-center gap-2"
            title="Ajustes de Cuenta"
          >
            <span className="text-lg">👤</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Mi Perfil</span>
          </button>
        )}



      </div>
    </header>
  );
};

export default Header;
