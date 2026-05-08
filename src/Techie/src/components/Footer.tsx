import React from 'react';
import { useAuth } from '../core/AuthContext';

interface FooterProps {
  sessionTokensUsed: number;
  subscriptionLevel?: string;
  onOpenFAQ?: () => void;
}

const Footer: React.FC<FooterProps> = ({ sessionTokensUsed, subscriptionLevel, onOpenFAQ }) => {
  const { isAdmin } = useAuth();

  return (
    <footer className="bg-transparent p-6 text-center text-xs text-gray-400">
      <div className="max-w-4xl mx-auto">
        <p className="mb-1">
          <strong>Aviso:</strong> Techie es una IA educativa. Tus medallas y perfil se guardan para que sigas aprendiendo.
          {' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onOpenFAQ?.(); }} className="font-semibold text-blue-600 hover:underline">
            Ver Manual / FAQ
          </a>.
        </p>
        <p className="mb-1">
          &copy; {new Date().getFullYear()} Catalizia.com.
        </p>
        {!isAdmin && (
          <div className="py-2.5 px-6 bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center gap-4 animate-fade-in-down shadow-xl premium-shadow-lg rounded-full max-w-fit mx-auto mb-4 mt-2">
              <span className="font-mono text-gray-700">Tokens: {sessionTokensUsed}</span>
              {subscriptionLevel && (
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  subscriptionLevel === 'leyenda' || subscriptionLevel === 'family_mega' ? 'bg-purple-500 text-white shadow-lg' : 
                  subscriptionLevel === 'maestro' || subscriptionLevel === 'family_starter' ? 'bg-blue-600 text-white shadow-lg' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  Plan: {
                    subscriptionLevel === 'leyenda' ? '$200' : 
                    subscriptionLevel === 'maestro' ? '$100' : 
                    subscriptionLevel === 'family_starter' ? 'Familiar' : 
                    subscriptionLevel === 'family_mega' ? 'Mega' : 
                    'Gratis'
                  }
                </span>
               )}
          </div>
        )}


      </div>
    </footer>
  );
};

export default Footer;
