import React, { useState, FormEvent } from 'react';
import { Grade, ChatMode } from '../types';
import { GRADES, TOOL_DEFINITIONS } from '../constants';
import { useAuth } from '../core/AuthContext';

interface UserProfileSetupProps {
  onProfileSubmit: (name: string, age: number, grade: Grade, mode: ChatMode, parentalConsent: boolean) => void;
  initialData?: {
      name: string;
      age: number;
  };
  initialGrade?: Grade | null;
  onOpenAdmin?: () => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ 
  onProfileSubmit, initialData, initialGrade, onOpenAdmin 
}) => {
  const { isAdmin } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(initialData?.name || '');
  const [age, setAge] = useState(initialData?.age?.toString() || '');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [showParentalChallenge, setShowParentalChallenge] = useState(false);
  const [parentalAnswer, setParentalAnswer] = useState('');
  const [parentalQuestion, setParentalQuestion] = useState({ q: '', a: 0 });
  const [error, setError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(initialGrade || null);

  const generateParentalChallenge = () => {
    const n1 = Math.floor(Math.random() * 50) + 10;
    const n2 = Math.floor(Math.random() * 40) + 10;
    setParentalQuestion({ q: `${n1} + ${n2}`, a: n1 + n2 });
    setShowParentalChallenge(true);
    setParentalAnswer('');
  };

  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 99) {
      setError('Por favor, ingresa una edad válida (entre 5 y 99).');
      return;
    }
    if (ageNum < 18 && !parentalConsent) {
      setError('Debes tener el consentimiento de tus padres para continuar.');
      return;
    }

    if (ageNum < 18 && parentalConsent && !showParentalChallenge) {
        generateParentalChallenge();
        return;
    }

    setError('');
    setStep(2);
  };

  const handleParentalVerify = () => {
      if (parseInt(parentalAnswer) === parentalQuestion.a) {
          setShowParentalChallenge(false);
          setStep(2);
      } else {
          setError('Respuesta incorrecta. Pide ayuda a un adulto.');
          setShowParentalChallenge(false);
      }
  };

  const handleGradeSelection = (grade: Grade) => {
    setSelectedGrade(grade);
    setStep(3);
  };

  const handleToolSelection = (mode: ChatMode) => {
    const ageNum = parseInt(age, 10);
    if (name.trim() && !isNaN(ageNum) && selectedGrade) {
        onProfileSubmit(name.trim(), ageNum, selectedGrade, mode, parentalConsent);
    }
  };

  const handleBack = () => {
      if (step > 1) {
          setStep((prev) => (prev - 1) as 1 | 2 | 3);
      }
  };

  return (
    <div className="flex-1 bg-pattern flex items-center justify-center p-4 text-[#1e3a8a] font-sans">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-3xl rounded-[4rem] shadow-2xl p-8 sm:p-12 text-center border border-white flex flex-col items-center animate-fade-in-scale max-h-[90vh] overflow-y-auto premium-shadow-lg">
        <style>{`
          @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.4s ease-out forwards; }
        `}</style>

        <div className="w-full max-w-xs mb-10 flex items-center justify-center gap-3">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'w-1/3 bg-[#1e3a8a]' : 'w-1/3 bg-gray-100'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'w-1/3 bg-[#1e3a8a]' : 'w-1/3 bg-gray-100'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 3 ? 'w-1/3 bg-[#1e3a8a]' : 'w-1/3 bg-gray-100'}`}></div>
        </div>

        {step === 1 && (
            <div className="w-full max-w-md animate-fade-in-scale flex flex-col items-center">
                <div className="mb-8">
                    <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border border-blue-100 shadow-inner">
                         <img src="https://catalizia.com/images/catalizia-techie.png" alt="Techie" className="w-full h-full object-contain p-2"/>
                    </div>
                </div>
                <h2 className="text-3xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">Configura tu Perfil</h2>
                <p className="text-gray-400 mb-10 text-xs font-bold uppercase tracking-widest">Dime tu nombre y edad para continuar.</p>
                
                <form onSubmit={handleInfoSubmit} className="space-y-6 w-full">
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Tu Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Escribe tu nombre aquí"
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#1e3a8a] transition-all text-xl text-center font-black text-[#1e3a8a]"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Tu Edad</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Escribe tu edad aquí"
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#1e3a8a] transition-all text-xl text-center font-black text-[#1e3a8a]"
                            />
                        </div>
                    </div>
                    
                    {parseInt(age, 10) < 18 && (
                        <div className="flex items-start gap-3 mt-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-left">
                            <input 
                                type="checkbox" 
                                id="parentalConsent" 
                                checked={parentalConsent} 
                                onChange={(e) => setParentalConsent(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                            />
                            <label htmlFor="parentalConsent" className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">
                                Confirmo que tengo el consentimiento de mis padres o tutores legales para usar esta aplicación educativa impulsada por IA. 
                                <br/><span className="font-bold">(Cumplimiento COPPA, GDPR y LFPDPPP)</span>
                            </label>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-500 text-[10px] font-black py-4 px-6 rounded-2xl border border-red-100 uppercase animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-6 bg-[#1e3a8a] text-white font-black rounded-[2rem] hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl text-lg uppercase tracking-[0.2em]"
                    >
                        ¡CONTINUAR!
                    </button>
                </form>
            </div>
        )}

        {step === 2 && (
            <div className="w-full animate-fade-in-scale">
                <h2 className="text-3xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">¡Hola, {name}!</h2>
                <h3 className="text-lg font-black text-gray-400 mb-8 uppercase tracking-[0.2em] leading-tight">¿En qué nivel escolar estás?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[45vh] overflow-y-auto p-2">
                    {GRADES.map((grade) => (
                        <button
                            key={grade.id}
                            onClick={() => handleGradeSelection(grade)}
                            className={`
                            flex flex-col items-center justify-center 
                            p-6 rounded-[2rem] border-2 transition-all duration-300
                            bg-white shadow-sm hover:shadow-xl hover:-translate-y-1
                            ${grade.color.border.replace('border-', 'hover:border-')}
                            border-gray-100 active:scale-95 group
                            `}
                        >
                            <div className={`mb-3 transform transition-transform group-hover:scale-110 ${grade.color.text}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d={grade.icon} />
                                </svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a] text-center leading-tight">
                                {grade.name}
                            </span>
                        </button>
                    ))}
                </div>
                <button onClick={handleBack} className="mt-10 text-gray-300 hover:text-[#1e3a8a] font-black text-[10px] uppercase tracking-[0.4em]">
                    ← REGRESAR
                </button>
            </div>
        )}

        {step === 3 && (
            <div className="w-full animate-fade-in-scale">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-[#1e3a8a] font-black text-[10px] uppercase tracking-[0.3em] mb-6 border border-blue-100">
                    {selectedGrade?.name}
                </div>
                <h2 className="text-3xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">SELECCIONA UNA MINI APP</h2>
                <p className="text-gray-400 text-xs mb-10 font-bold uppercase tracking-widest">Elige una herramienta para empezar</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                    {TOOL_DEFINITIONS.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => handleToolSelection(tool.id)}
                            className={`
                                flex items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all duration-300
                                text-left hover:shadow-xl transform hover:-translate-y-1 group bg-white
                                border-gray-50 hover:border-[#1e3a8a]
                            `}
                        >
                            <div className={`p-4 rounded-2xl transition-all shadow-sm shrink-0 ${tool.iconBg} ${tool.iconText} group-hover:scale-110`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tool.iconPath} />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-black text-[#1e3a8a] text-[13px] uppercase tracking-wide">{tool.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold leading-tight mt-1 uppercase tracking-tight">{tool.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <button onClick={handleBack} className="mt-12 text-gray-300 hover:text-[#1e3a8a] font-black text-[10px] uppercase tracking-[0.4em]">
                    ← CAMBIAR NIVEL ESCOLAR
                </button>
            </div>
        )}
        
        {showParentalChallenge && (
            <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-blue-400 animate-fade-in-scale">
                    <div className="text-4xl mb-4">🔐</div>
                    <h3 className="text-2xl font-black text-[#1e3a8a] mb-2 uppercase tracking-tight">Verificación Parental</h3>
                    <p className="text-gray-500 text-sm mb-6">Pide a un adulto que resuelva esta suma para confirmar el consentimiento.</p>
                    <div className="text-4xl font-black text-[#1e3a8a] mb-6 font-mono bg-gray-50 py-4 rounded-2xl">{parentalQuestion.q} = ?</div>
                    <input 
                        type="number" 
                        value={parentalAnswer}
                        onChange={(e) => setParentalAnswer(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-100 rounded-2xl text-center text-2xl font-black text-[#1e3a8a] mb-4 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        placeholder="???"
                        autoFocus
                    />
                    <button 
                        onClick={handleParentalVerify}
                        className="w-full py-4 bg-[#1e3a8a] text-white font-black rounded-2xl hover:bg-black transition-all"
                    >
                        VERIFICAR
                    </button>
                    <button onClick={() => setShowParentalChallenge(false)} className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">CANCELAR</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileSetup;
