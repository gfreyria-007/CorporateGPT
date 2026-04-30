import React, { useState } from 'react';
import { Badge, Project } from '../types';

interface BackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  projects: Project[];
}

const BackpackModal: React.FC<BackpackModalProps> = ({ isOpen, onClose, badges, projects = [] }) => {
  const [activeTab, setActiveTab] = React.useState<'badges' | 'projects'>('badges');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in border border-white">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/30 animate-bounce-slow">
              🎒
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Mochila Mágica</h2>
              <p className="text-amber-100 text-[10px] uppercase tracking-widest font-bold">Logros • Proyectos • Recuerdos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center transition-colors relative z-10 font-black"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-amber-50/50 p-2 gap-2 border-b border-amber-100">
            <button 
                onClick={() => setActiveTab('badges')}
                className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'badges' ? 'bg-amber-500 text-white shadow-lg' : 'bg-transparent text-amber-900/40 hover:bg-amber-100'}`}
            >
                Medallas 🏆
            </button>
            <button 
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'projects' ? 'bg-amber-500 text-white shadow-lg' : 'bg-transparent text-amber-900/40 hover:bg-amber-100'}`}
            >
                Mis Proyectos 🎨
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
          {activeTab === 'badges' ? (
              (!badges || badges.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50 grayscale">🏆</div>
                  <h3 className="text-xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">¡Sin medallas aún!</h3>
                  <p className="text-gray-400 text-sm font-medium">Sigue aprendiendo con Techie para ganar insignias increíbles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-white rounded-3xl p-4 border-2 border-amber-100 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all group flex flex-col items-center text-center">
                      <div className="text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">{badge.icon}</div>
                      <h4 className="font-black text-[#1e3a8a] text-sm uppercase tracking-tight leading-tight mb-1">{badge.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-tight mb-3">{badge.description}</p>
                      <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full mt-auto">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )
          ) : (
              (!projects || projects.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50 grayscale">🎨</div>
                  <h3 className="text-xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">¿Sin proyectos?</h3>
                  <p className="text-gray-400 text-sm font-medium">Usa el Estudio de Arte o crea reportes para guardar tus obras aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-3xl overflow-hidden border-2 border-blue-50 hover:border-blue-500 transition-all group shadow-sm hover:shadow-xl">
                      {project.url ? (
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            <img src={project.url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Ver Proyecto</span>
                            </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-blue-50 flex items-center justify-center text-4xl">
                            {project.type === 'report' ? '📚' : '📜'}
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-[#1e3a8a] text-sm uppercase tracking-tight">{project.title}</h4>
                            <span className="text-[8px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">{project.type}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {new Date(project.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default BackpackModal;
