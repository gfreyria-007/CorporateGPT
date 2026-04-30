
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathContent } from '../types';

interface MathMessageProps {
    content: MathContent;
}

const MathMessage: React.FC<MathMessageProps> = ({ content }) => {
    const { operation, result, steps, properties, socraticHint, visualization, challenge } = content;
    const [challengeSelected, setChallengeSelected] = useState<number | null>(null);
    const [challengeSolved, setChallengeSolved] = useState(false);

    const renderVisualization = () => {
        if (!visualization) return null;

        const { type, data } = visualization;

        if (type === 'blocks') {
            const { total, groupSize, color = 'blue' } = data.blocks || {};
            const numBlocks = total || 0;
            const groups = groupSize ? Math.ceil(numBlocks / groupSize) : 1;

            return (
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Visualización: Bloques</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {Array.from({ length: groups }).map((_, gIdx) => (
                            <div key={gIdx} className="flex flex-wrap gap-1 p-2 bg-white rounded-xl shadow-sm border border-gray-50">
                                {Array.from({ length: Math.min(groupSize || numBlocks, numBlocks - gIdx * (groupSize || 0)) }).map((_, bIdx) => (
                                    <motion.div
                                        key={`${gIdx}-${bIdx}`}
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ 
                                            type: "spring", 
                                            stiffness: 260, 
                                            damping: 20,
                                            delay: (gIdx * (groupSize || 1) + bIdx) * 0.03 
                                        }}
                                        className={`w-6 h-6 rounded-md shadow-sm border-b-4 border-r-2 ${
                                            color === 'blue' ? 'bg-blue-400 border-blue-600' :
                                            color === 'red' ? 'bg-red-400 border-red-600' :
                                            color === 'green' ? 'bg-green-400 border-green-600' :
                                            'bg-amber-400 border-amber-600'
                                        }`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <p className="text-center mt-4 text-xs font-black text-[#1e3a8a] uppercase tracking-widest">
                        {numBlocks} bloques en total
                    </p>
                </div>
            );
        }

        if (type === 'pizza') {
            const { slices = 8, highlighted = [], label } = data.pizza || {};
            
            return (
                <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 mt-6 flex flex-col items-center">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">Visualización: Fracciones</p>
                    <div className="relative w-40 h-40">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="40" fill="#fff" stroke="#fed7aa" strokeWidth="2" />
                            
                            {/* Slices */}
                            {Array.from({ length: slices }).map((_, i) => {
                                const angle = (360 / slices);
                                const startAngle = i * angle;
                                const isHighlighted = highlighted.includes(i + 1);
                                
                                // Path for a slice
                                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                                const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                                
                                const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`;
                                
                                return (
                                    <motion.path
                                        key={i}
                                        d={pathData}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        fill={isHighlighted ? "#f97316" : "transparent"}
                                        stroke="#ea580c"
                                        strokeWidth="1"
                                        whileHover={{ scale: 1.05 }}
                                    />
                                );
                            })}
                            
                            {/* Dividers */}
                            {Array.from({ length: slices }).map((_, i) => {
                                const angle = (i * 360) / slices;
                                const x = 50 + 40 * Math.cos((angle * Math.PI) / 180);
                                const y = 50 + 40 * Math.sin((angle * Math.PI) / 180);
                                return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#fed7aa" strokeWidth="1" />;
                            })}
                        </svg>
                        
                        {label && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-lg font-black text-orange-600 shadow-sm border border-orange-100">
                                    {label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (type === 'grid') {
            const { rows = 1, cols = 1 } = data.grid || {};
            return (
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 mt-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Visualización: Área / Multiplicación</p>
                    <div 
                        className="grid gap-1 justify-center mx-auto" 
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 30}px` }}
                    >
                        {Array.from({ length: rows * cols }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.01 }}
                                className="w-6 h-6 bg-indigo-400 rounded-sm border border-indigo-600 shadow-inner"
                            />
                        ))}
                    </div>
                    <p className="text-center mt-4 text-xs font-black text-indigo-900 uppercase tracking-widest">
                        {rows} filas × {cols} columnas = {rows * cols}
                    </p>
                </div>
            );
        }

        if (type === 'comparison') {
            const { left = 0, right = 0, operator = '=' } = data.comparison || {};
            return (
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 mt-6">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Visualización: Balanza</p>
                    <div className="flex items-center justify-around gap-4">
                        <div className="flex flex-col items-center">
                            <motion.div 
                                animate={{ y: left > right ? 10 : left < right ? -10 : 0 }}
                                className="w-16 h-16 bg-emerald-400 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                            >
                                {left}
                            </motion.div>
                            <div className="w-1 h-8 bg-gray-300"></div>
                        </div>
                        
                        <div className="text-4xl font-black text-emerald-600 animate-bounce">
                            {operator}
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <motion.div 
                                animate={{ y: right > left ? 10 : right < left ? -10 : 0 }}
                                className="w-16 h-16 bg-emerald-400 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                            >
                                {right}
                            </motion.div>
                            <div className="w-1 h-8 bg-gray-300"></div>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded-full mt-[-4px]"></div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-950 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
                
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Operación</span>
                <div className="flex items-center justify-between mt-2">
                    <h2 className="text-3xl font-black tracking-tighter">{operation}</h2>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-2xl font-black">
                        {result}
                    </div>
                </div>
            </div>

            {renderVisualization()}

            <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Paso a Paso</p>
                {steps.map((step, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1e3a8a] font-black flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                                {step.step}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-[#1e3a8a] text-sm uppercase tracking-tight">{step.title}</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">{step.explanation}</p>
                                {step.formula && (
                                    <div className="mt-2 inline-block px-3 py-1 bg-gray-50 rounded-lg font-mono text-xs text-blue-900 border border-gray-100">
                                        {step.formula}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {properties.map((prop, idx) => (
                    <div key={idx} className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-lg">💡</span>
                        <p className="text-[10px] font-bold text-amber-900 leading-tight uppercase tracking-tight">{prop}</p>
                    </div>
                ))}
            </div>

            {/* Interactive Socratic Challenge or Static Hint */}
            {challenge && challenge.options && challenge.options.length > 0 ? (
                <div className="bg-indigo-900 rounded-[2rem] p-6 shadow-xl border-t-4 border-indigo-400 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🧮</div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-3">Reto Matemático</p>
                    <p className="text-sm font-bold text-white leading-snug mb-4">{challenge.question}</p>
                    
                    <AnimatePresence mode="wait">
                        {challengeSelected === null ? (
                            <motion.div key="options" initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                                {challenge.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setChallengeSelected(i);
                                            if (opt.isCorrect) setChallengeSolved(true);
                                        }}
                                        className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left text-xs font-bold text-white transition-all border border-white/5 flex items-center gap-3"
                                    >
                                        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt.text}
                                    </button>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="feedback" 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className={`p-3 rounded-xl flex items-center gap-3 ${challenge.options[challengeSelected].isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    <span className="text-2xl">{challenge.options[challengeSelected].isCorrect ? '✅' : '❌'}</span>
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {challenge.options[challengeSelected].isCorrect ? '¡Brillante!' : 'Casi...'}
                                    </span>
                                </div>
                                <p className="text-xs text-white/90 leading-relaxed italic">
                                    "{challenge.options[challengeSelected].why}"
                                </p>
                                {!challengeSolved && (
                                    <button 
                                        onClick={() => setChallengeSelected(null)}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Intentar de nuevo
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : socraticHint ? (
                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] border-dashed">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🤔</span>
                        <h4 className="font-black text-[#1e3a8a] text-xs uppercase tracking-widest">¿Qué piensas tú?</h4>
                    </div>
                    <p className="text-sm font-medium text-blue-900 leading-relaxed italic">
                        "{socraticHint}"
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default MathMessage;
