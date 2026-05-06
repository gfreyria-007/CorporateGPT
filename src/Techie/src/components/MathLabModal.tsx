
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grade } from '../types';

interface MathLabModalProps {
    onClose: () => void;
    grade: Grade;
}

const MathLabModal: React.FC<MathLabModalProps> = ({ onClose, grade }) => {
    const isPrimaryLow = grade.id === 'primaria1' || grade.id === 'primaria2' || grade.id === 'primaria3';
    const isPrimaryHigh = grade.id === 'primaria4' || grade.id === 'primaria5' || grade.id === 'primaria6';
    const isSecondaryPlus = !isPrimaryLow && !isPrimaryHigh;

    const maxInput = 1000000;

    const [mode, setMode] = useState<'angles' | 'rect' | 'tri' | 'circle' | 'arithmetic' | 'trig' | 'fractions' | 'vectors'>('arithmetic');
    
    // Arithmetic state
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [op, setOp] = useState<'+' | '-' | '*' | '/' | '^' | '√' | '%'>('+');

    const renderBase10Blocks = (value: number) => {
        const units = value % 10;
        const tens = Math.floor((value % 100) / 10);
        const hundreds = Math.floor((value % 1000) / 100);
        const thousands = Math.floor((value % 10000) / 1000);
        const tenThousands = Math.floor((value % 100000) / 10000);
        const hundredThousands = Math.floor(value / 100000);

        const Block = ({ color, label, count, size }: { color: string, label: string, count: number, size: string }) => {
            if (count === 0) return null;
            return (
                <div className="flex flex-col items-center gap-1">
                    <div className="flex flex-wrap gap-1 max-w-[150px] justify-center items-center">
                        {Array.from({ length: Math.min(count, 100) }).map((_, i) => (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={`${label}-${i}`} 
                                className={`${size} ${color} rounded-sm shadow-sm relative group`}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity flex items-center justify-center text-[4px] font-bold text-white">
                                    {label}
                                </div>
                            </motion.div>
                        ))}
                        {count > 100 && <span className="text-[10px] font-black text-gray-400">+{count - 100}</span>}
                    </div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label} ({count})</span>
                </div>
            );
        };

        return (
            <div className="flex flex-wrap items-end justify-center gap-6 p-4">
                <Block color="bg-black" label="100K+" count={hundredThousands} size="w-8 h-8" />
                <Block color="bg-rose-500" label="10K" count={tenThousands} size="w-6 h-6" />
                <Block color="bg-amber-500" label="1000" count={thousands} size="w-5 h-5" />
                <Block color="bg-indigo-600" label="100" count={hundreds} size="w-4 h-4" />
                <Block color="bg-emerald-500" label="10" count={tens} size="w-3 h-3" />
                <Block color="bg-blue-500" label="1" count={units} size="w-2 h-2" />
            </div>
        );
    };

    // Angles & Trig state
    const [anglePoint, setAnglePoint] = useState({ x: 250, y: 100 });
    const center = { x: 250, y: 250 };
    const fixedPoint = { x: 400, y: 250 };
    
    // Trigonometry specifics
    const [trigRadius] = useState(150); // Scale for unit circle
    const [trigPoint, setTrigPoint] = useState({ x: center.x + trigRadius, y: center.y });

    // Rect state
    const [rectSize, setRectSize] = useState({ w: 200, h: 150 });

    // Tri state
    const [v1, setV1] = useState({ x: 250, y: 100 });
    const [v2, setV2] = useState({ x: 150, y: 350 });
    const [v3, setV3] = useState({ x: 350, y: 350 });

    // Circle state
    const [radius, setRadius] = useState(100);

    // Fractions state
    const [num, setNum] = useState(3);
    const [den, setDen] = useState(8);

    // Vectors state
    const [vec, setVec] = useState({ x: 100, y: -100 }); // Relative to center

    // Socratic Tutor State
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const tutorQuestions = {
        arithmetic: [
            {
                q: "¿Qué sucede siempre que multiplicas cualquier número por 0?",
                options: [
                    { text: "El resultado siempre es 0", isCorrect: true, why: "Cero grupos de cualquier cosa siempre es nada. ¡Es el gran anulador!" },
                    { text: "El número se queda igual", isCorrect: false, why: "Eso sucede cuando multiplicas por 1, el elemento neutro." },
                    { text: "El resultado es 1", isCorrect: false, why: "Cualquier número (excepto 0) elevado a la potencia 0 da 1, pero no multiplicado por 0." }
                ]
            },
            {
                q: "Si dividimos un número entre sí mismo (ej. 5 ÷ 5), ¿cuál es el resultado?",
                options: [
                    { text: "Siempre es 1", isCorrect: true, why: "Indica que el número cabe exactamente una vez dentro de sí mismo." },
                    { text: "Siempre es 0", isCorrect: false, why: "La resta de un número consigo mismo da 0, pero la división da 1." },
                    { text: "Depende del número", isCorrect: false, why: "Excepto por el cero (que es una excepción especial), siempre es 1." }
                ]
            },
            {
                q: "Si multiplicas 15 × 8, ¿es lo mismo que (15 × 10) - (15 × 2)?",
                options: [
                    { text: "Sí, es la propiedad distributiva", isCorrect: true, why: "Dividir el 8 en (10 - 2) hace que el cálculo mental sea mucho más rápido y elegante." },
                    { text: "No, los resultados varían", isCorrect: false, why: "Prueba el cálculo: 120 en ambos casos. Las matemáticas tienen caminos diferentes al mismo destino." },
                    { text: "Solo funciona con números pares", isCorrect: false, why: "Esta regla funciona con absolutamente cualquier número." }
                ]
            },
            {
                q: "¿Qué representa la operación de Potencia (A^B)?",
                options: [
                    { text: "Multiplicar la base A por sí misma B veces", isCorrect: true, why: "Es un crecimiento exponencial acelerado. ¡Muy útil en ciencia y finanzas!" },
                    { text: "Sumar A a sí mismo B veces", isCorrect: false, why: "Eso es la multiplicación, no la potencia." },
                    { text: "Dividir A entre B", isCorrect: false, why: "La potencia es lo opuesto a la raíz, no a la división." }
                ]
            },
            {
                q: "Si la raíz cuadrada de 25 es 5, ¿cuánto es 5 al cuadrado (5^2)?",
                options: [
                    { text: "25", isCorrect: true, why: "Exacto. La raíz y la potencia son operaciones inversas, como la suma y la resta." },
                    { text: "10", isCorrect: false, why: "Eso es 5 + 5 o 5 x 2, pero no 5 al cuadrado." },
                    { text: "50", isCorrect: false, why: "Te pasaste. Recuerda que es 5 x 5." }
                ]
            }
        ],
        angles: [
            {
                q: "¿Cómo llamamos a un ángulo que mide exactamente 90 grados?",
                options: [
                    { text: "Ángulo Recto", isCorrect: true, why: "Es la base de la construcción y la arquitectura; forma una L perfecta." },
                    { text: "Ángulo Agudo", isCorrect: false, why: "Los agudos son más 'cerrados', miden menos de 90°." },
                    { text: "Ángulo Obtuso", isCorrect: false, why: "Los obtusos son más 'abiertos', miden más de 90°." }
                ]
            }
        ],
        fractions: [
            {
                q: "¿Qué representa el denominador (el número de abajo) en una fracción?",
                options: [
                    { text: "El total de partes iguales en que se divide el entero", isCorrect: true, why: "Nos dice qué tan grandes o pequeñas son las rebanadas." },
                    { text: "Cuántas partes tomamos nosotros", isCorrect: false, why: "Eso lo indica el numerador (el número de arriba)." },
                    { text: "El resultado de la suma", isCorrect: false, why: "Una fracción es una división, no necesariamente un resultado de suma." }
                ]
            }
        ],
        trig: [
            {
                q: "En el círculo unitario, ¿qué función trigonométrica representa la altura (eje Y)?",
                options: [
                    { text: "El Seno (Sin)", isCorrect: true, why: "Por definición, en el círculo unitario (radio=1), la coordenada Y es el seno del ángulo." },
                    { text: "El Coseno (Cos)", isCorrect: false, why: "El coseno representa la base o la coordenada X." },
                    { text: "La Tangente (Tan)", isCorrect: false, why: "La tangente es la razón entre el seno y el coseno." }
                ]
            }
        ],
        vectors: [
            {
                q: "¿Qué diferencia a un vector de un simple número?",
                options: [
                    { text: "Tiene magnitud, dirección y sentido", isCorrect: true, why: "Un número (escalar) solo tiene valor; el vector te dice hacia dónde va." },
                    { text: "Que siempre es un número positivo", isCorrect: false, why: "Los vectores pueden tener componentes negativos." },
                    { text: "Que solo se usa en preparatoria", isCorrect: false, why: "¡Los usas diario! Al caminar hacia una dirección específica, estás siguiendo un vector." }
                ]
            }
        ],
        rect: [
            {
                q: "Si duplicas la base de un rectángulo pero mantienes la misma altura, ¿qué pasa con el área?",
                options: [
                    { text: "El área se duplica", isCorrect: true, why: "Como Área = Base × Altura, si la base es el doble, el área también lo será." },
                    { text: "El área se queda igual", isCorrect: false, why: "Para que se quede igual tendrías que reducir la altura a la mitad." },
                    { text: "El área se cuadruplica", isCorrect: false, why: "Eso pasaría si duplicaras AMBAS dimensiones." }
                ]
            }
        ],
        tri: [
            {
                q: "¿Por qué el área de un triángulo es (Base × Altura) dividido entre 2?",
                options: [
                    { text: "Porque un triángulo es la mitad de un paralelogramo", isCorrect: true, why: "Si juntas dos triángulos iguales, siempre puedes formar un rectángulo o romboide." },
                    { text: "Porque tiene 3 lados", isCorrect: false, why: "El número de lados no determina directamente la división entre 2." },
                    { text: "Es una regla arbitraria", isCorrect: false, why: "Las matemáticas nunca son arbitrarias; siempre hay una razón geométrica." }
                ]
            }
        ],
        circle: [
            {
                q: "¿Qué es el número Pi (π)?",
                options: [
                    { text: "La relación entre la circunferencia y el diámetro", isCorrect: true, why: "Si estiras el borde de un círculo, medirá un poco más de 3 veces su ancho." },
                    { text: "El radio multiplicado por dos", isCorrect: false, why: "Eso es el diámetro." },
                    { text: "Un número inventado por Einstein", isCorrect: false, why: "π se conoce desde la antigüedad, miles de años antes de Einstein." }
                ]
            }
        ]
    };

    const currentQuestions = (tutorQuestions as any)[mode] || [];
    const question = currentQuestions[currentQuestionIndex % currentQuestions.length];

    const handleOptionSelect = (index: number) => {
        setSelectedOption(index);
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        setShowExplanation(false);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const calculateAngle = () => {
        const dy = anglePoint.y - center.y;
        const dx = anglePoint.x - center.x;
        let theta = Math.atan2(dy, dx); 
        theta *= 180 / Math.PI;
        // Invert Y for SVG coordinates to match mathematical angle
        let angle = -theta; 
        if (angle < 0) angle = 360 + angle;
        return Math.abs(Math.round(angle));
    };

    const getSVGCoords = (clientX: number, clientY: number, svg: SVGSVGElement) => {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: clientX, y: clientY };
        return pt.matrixTransform(ctm.inverse());
    };

    const calculateAreaTri = () => {
        return Math.abs((v1.x * (v2.y - v3.y) + v2.x * (v3.y - v1.y) + v3.x * (v1.y - v2.y)) / 2).toFixed(1);
    };

    const renderArithmetic = () => {
        const result = 
            op === '+' ? num1 + num2 : 
            op === '-' ? num1 - num2 : 
            op === '*' ? num1 * num2 : 
            op === '/' ? (num2 !== 0 ? Math.floor(num1 / num2) : 0) :
            op === '^' ? Math.pow(num1, num2) :
            op === '√' ? Math.sqrt(num1) :
            op === '%' ? num1 % num2 : 0;
        
        const displayResult = isNaN(result) || !isFinite(result) ? "Error" : result.toLocaleString();

        return (
            <div className="w-full h-full flex flex-col items-center justify-start gap-8 overflow-y-auto p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-center gap-6 bg-white/80 backdrop-blur-md p-8 rounded-[3rem] border-2 border-blue-100 shadow-2xl sticky top-0 z-10 w-full max-w-5xl">
                    <div className="flex flex-col items-center gap-3">
                        <input 
                            type="number" 
                            value={num1} 
                            onChange={(e) => setNum1(Math.min(maxInput, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-32 py-4 text-4xl font-black text-center text-[#1e3a8a] bg-blue-50 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-500 shadow-inner"
                        />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Valor A</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {['+', '-', '*', '/', '^', '√', '%'].map(o => (
                            <button 
                                key={o}
                                onClick={() => setOp(o as any)}
                                className={`w-12 h-12 rounded-xl font-black text-xl flex items-center justify-center transition-all ${op === o ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-white border border-gray-200'}`}
                            >
                                {o === '*' ? '×' : o === '/' ? '÷' : o}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <input 
                            type="number" 
                            value={num2} 
                            disabled={op === '√'}
                            onChange={(e) => setNum2(Math.min(maxInput, Math.max(0, parseInt(e.target.value) || 0)))}
                            className={`w-32 py-4 text-4xl font-black text-center rounded-2xl border-2 focus:outline-none shadow-inner transition-opacity ${op === '√' ? 'opacity-20 cursor-not-allowed bg-gray-100 border-gray-200' : 'text-[#1e3a8a] bg-blue-50 border-blue-200 focus:border-blue-500'}`}
                        />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Valor B</span>
                    </div>

                    <div className="text-4xl font-black text-blue-200 mx-2">→</div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="px-8 py-4 text-4xl font-black text-center text-white bg-blue-900 rounded-2xl shadow-xl border-2 border-blue-950 min-w-[120px]">
                            {displayResult}
                        </div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Resultado</span>
                    </div>
                </div>

                <div className="w-full flex-1 min-h-[400px] bg-slate-50/50 rounded-[3rem] p-12 border border-blue-50 shadow-inner overflow-y-auto text-center">
                    <div className="flex flex-col items-center gap-16">
                        <div className="w-full space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Descomposición de Magnitudes</h3>
                            <div className="flex flex-col gap-8">
                                <div className="bg-white/40 p-8 rounded-[2rem] border border-blue-50 relative overflow-hidden">
                                    <div className="absolute top-4 left-4 text-[8px] font-black text-blue-200 uppercase">Valor A</div>
                                    {renderBase10Blocks(num1)}
                                </div>
                                
                                <div className="flex items-center justify-center relative">
                                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-100 to-transparent absolute" />
                                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg z-10 scale-125 border-4 border-white">
                                        {op === '*' ? '×' : op === '/' ? '÷' : op}
                                    </div>
                                </div>

                                <div className="bg-white/40 p-8 rounded-[2rem] border border-emerald-50 relative overflow-hidden">
                                    <div className="absolute top-4 left-4 text-[8px] font-black text-emerald-200 uppercase">Valor B</div>
                                    {renderBase10Blocks(num2)}
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="w-16 h-1 bg-gray-200 rounded-full" />
                                </div>

                                <div className="bg-blue-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                                    <div className="absolute top-6 left-10 text-[10px] font-black text-blue-400 uppercase tracking-widest">Visualización del Resultado</div>
                                    <div className="relative z-10">
                                        {op === '*' && num1 * num2 > 1000 ? (
                                            <div className="flex flex-col items-center gap-6">
                                                <div 
                                                    className="relative border-4 border-white/20 bg-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                                    style={{ 
                                                        width: Math.min(400, Math.sqrt(num1 * num2) * 0.5), 
                                                        height: Math.min(400, Math.sqrt(num1 * num2) * 0.5),
                                                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                                        backgroundSize: '4px 4px'
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                                </div>
                                                <p className="text-white font-black text-2xl tracking-tighter opacity-80">{result.toLocaleString()} unidades totales</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 rounded-3xl p-4">
                                                {renderBase10Blocks(result)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-blue-900/40 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-4 border-white"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🧪</span>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter">Laboratorio de Matemáticas</h2>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">¡Visualiza, experimenta y aprende!</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 bg-white/20 hover:bg-white/40 rounded-2xl flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Sidebar / Tools */}
                    <div className="w-full md:w-48 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex md:flex-col gap-2 overflow-x-auto shrink-0 scrollbar-hide">
                        <button 
                            onClick={() => setMode('arithmetic')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'arithmetic' ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                        >
                            <span className="text-2xl">🧮</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Cálculo</span>
                        </button>
                        <button 
                            onClick={() => setMode('angles')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'angles' ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                        >
                            <span className="text-2xl">📐</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Ángulos</span>
                        </button>
                        <button 
                            onClick={() => setMode('rect')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'rect' ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                        >
                            <span className="text-2xl">🟦</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Áreas</span>
                        </button>
                        <button 
                            onClick={() => setMode('tri')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'tri' ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                        >
                            <span className="text-2xl">🔺</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Triángulos</span>
                        </button>
                        <button 
                            onClick={() => setMode('circle')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'circle' ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                        >
                            <span className="text-2xl">⚪</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Círculos</span>
                        </button>
                        <button 
                            onClick={() => setMode('trig')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'trig' ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                        >
                            <span className="text-2xl">⚛️</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Trig</span>
                        </button>
                        <button 
                            onClick={() => setMode('fractions')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'fractions' ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'}`}
                        >
                            <span className="text-2xl">🍕</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Fracciones</span>
                        </button>
                        <button 
                            onClick={() => setMode('vectors')}
                            className={`flex-1 md:flex-none p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'vectors' ? 'bg-purple-600 border-purple-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'}`}
                        >
                            <span className="text-2xl">↗️</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Vectores</span>
                        </button>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-pattern relative p-4 sm:p-8 overflow-hidden flex items-center justify-center">
                        {mode === 'arithmetic' ? (
                            renderArithmetic()
                        ) : (
                            <svg id="math-lab-svg" viewBox="0 0 500 500" className="w-full h-full max-w-2xl max-h-full drop-shadow-2xl overflow-visible">
                                <defs>
                                    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                                    </pattern>
                                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                        <rect width="50" height="50" fill="url(#smallGrid)"/>
                                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />

                                {mode === 'angles' && (
                                    <g>
                                        <line x1={center.x} y1={center.y} x2={fixedPoint.x} y2={fixedPoint.y} stroke="#1e3a8a" strokeWidth="8" strokeLinecap="round" />
                                        <line x1={center.x} y1={center.y} x2={anglePoint.x} y2={anglePoint.y} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                                        
                                        <circle cx={center.x} cy={center.y} r="15" fill="#1e3a8a" />
                                        
                                        <motion.circle 
                                            onPan={(_, info) => {
                                                const svg = document.getElementById('math-lab-svg') as any;
                                                if (!svg) return;
                                                const coords = getSVGCoords(info.point.x, info.point.y, svg);
                                                setAnglePoint({ x: coords.x, y: coords.y });
                                            }}
                                            cx={anglePoint.x} cy={anglePoint.y} r="30" fill="#2563eb" className="cursor-grab active:cursor-grabbing shadow-xl"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                        <text x={center.x} y={center.y + 60} textAnchor="middle" className="text-5xl font-black fill-[#1e3a8a]">{calculateAngle()}°</text>
                                        
                                        {/* Arc indication */}
                                        <path 
                                            d={`M ${center.x + 80} ${center.y} A 80 80 0 ${calculateAngle() > 180 ? 1 : 0} 0 ${center.x + 80 * Math.cos(Math.atan2(anglePoint.y - center.y, anglePoint.x - center.x))} ${center.y + 80 * Math.sin(Math.atan2(anglePoint.y - center.y, anglePoint.x - center.x))}`}
                                            fill="transparent"
                                            stroke="#fbbf24"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                        />
                                    </g>
                                )}

                                {mode === 'rect' && (
                                    <g>
                                        <motion.rect 
                                            x={center.x - rectSize.w / 2} 
                                            y={center.y - rectSize.h / 2} 
                                            width={rectSize.w} 
                                            height={rectSize.h} 
                                            fill="#dcfce7" 
                                            stroke="#16a34a" 
                                            strokeWidth="4" 
                                            rx="12"
                                        />
                                        
                                        {/* Dynamic font size based on rect size */}
                                        <text 
                                            x={center.x} 
                                            y={center.y} 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            className="font-black fill-[#16a34a]"
                                            style={{ fontSize: Math.min(rectSize.w, rectSize.h) < 60 ? '12px' : '24px' }}
                                        >
                                            {(rectSize.w * rectSize.h / 100).toFixed(0)} u²
                                        </text>
                                        
                                        {/* Base Label */}
                                        <text x={center.x} y={center.y - rectSize.h / 2 - 15} textAnchor="middle" className="text-sm font-black fill-gray-400 uppercase tracking-widest">
                                            Base: {(rectSize.w / 10).toFixed(0)}
                                        </text>
                                        
                                        {/* Height Label */}
                                        <g transform={`translate(${center.x + rectSize.w / 2 + 25}, ${center.y}) rotate(90)`}>
                                            <text textAnchor="middle" className="text-sm font-black fill-gray-400 uppercase tracking-widest">
                                                Alt: {(rectSize.h / 10).toFixed(0)}
                                            </text>
                                        </g>

                                        <motion.circle 
                                            onPan={(_, info) => {
                                                const svg = document.getElementById('math-lab-svg') as any;
                                                if (!svg) return;
                                                const coords = getSVGCoords(info.point.x, info.point.y, svg);
                                                setRectSize({
                                                    w: Math.max(50, (coords.x - center.x) * 2),
                                                    h: Math.max(50, (coords.y - center.y) * 2)
                                                });
                                            }}
                                            cx={center.x + rectSize.w / 2} 
                                            cy={center.y + rectSize.h / 2} 
                                            r="22" 
                                            fill="#16a34a" 
                                            className="cursor-nwse-resize shadow-lg"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </g>
                                )}

                                {mode === 'tri' && (
                                    <g>
                                        <motion.path 
                                            d={`M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} L ${v3.x} ${v3.y} Z`}
                                            fill="#fef9c3"
                                            stroke="#ca8a04"
                                            strokeWidth="4"
                                            strokeLinejoin="round"
                                        />
                                        
                                        <g transform="translate(250, 470)">
                                            <rect x="-100" y="-30" width="200" height="40" rx="20" fill="white" className="shadow-sm" />
                                            <text textAnchor="middle" className="text-2xl font-black fill-[#ca8a04] uppercase tracking-tighter">
                                                Área: {(calculateAreaTri() as any / 100).toFixed(1)} u²
                                            </text>
                                        </g>

                                        {[setV1, setV2, setV3].map((setter, i) => {
                                            const pos = [v1, v2, v3][i];
                                            return (
                                                <motion.circle 
                                                    key={i}
                                                    onPan={(_, info) => {
                                                        const svg = document.getElementById('math-lab-svg') as any;
                                                        if (!svg) return;
                                                        const coords = getSVGCoords(info.point.x, info.point.y, svg);
                                                        // Keep points within reasonable bounds
                                                        setter({ 
                                                            x: Math.min(480, Math.max(20, coords.x)), 
                                                            y: Math.min(430, Math.max(20, coords.y)) 
                                                        });
                                                    }}
                                                    cx={pos.x} cy={pos.y} r="22" fill="#eab308" className="cursor-grab active:cursor-grabbing shadow-lg"
                                                    whileHover={{ scale: 1.2 }}
                                                />
                                            );
                                        })}
                                    </g>
                                )}

                                {mode === 'circle' && (
                                    <g>
                                        <circle cx={center.x} cy={center.y} r={radius} fill="#dbeafe" stroke="#2563eb" strokeWidth="4" />
                                        
                                        {/* Radius Line */}
                                        <line x1={center.x} y1={center.y} x2={center.x + radius} y2={center.y} stroke="#2563eb" strokeWidth="3" strokeDasharray="8,4" />
                                        
                                        {/* Radius Text */}
                                        <rect x={center.x + radius/2 - 25} y={center.y - 25} width="50" height="20" rx="10" fill="white/80" />
                                        <text x={center.x + radius/2} y={center.y - 10} textAnchor="middle" className="text-sm font-black fill-[#1e3a8a]">
                                            r = {(radius / 10).toFixed(1)}
                                        </text>
                                        
                                        <g transform="translate(250, 440)">
                                            <text textAnchor="middle" className="text-3xl font-black fill-blue-900 uppercase tracking-tighter">
                                                Área: {(Math.PI * Math.pow(radius / 10, 2)).toFixed(1)} u²
                                            </text>
                                        </g>

                                        <motion.circle 
                                            onPan={(_, info) => {
                                                const svg = document.getElementById('math-lab-svg') as any;
                                                if (!svg) return;
                                                const coords = getSVGCoords(info.point.x, info.point.y, svg);
                                                setRadius(Math.min(220, Math.max(20, coords.x - center.x)));
                                            }}
                                            cx={center.x + radius} cy={center.y} r="22" fill="#2563eb" className="cursor-ew-resize shadow-lg"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </g>
                                )}
                                {mode === 'trig' && (
                                    <g>
                                        {/* Grid Lines */}
                                        <line x1="50" y1={center.y} x2="450" y2={center.y} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1={center.x} y1="50" x2={center.x} y2="450" stroke="#e2e8f0" strokeWidth="1" />
                                        
                                        {/* Unit Circle */}
                                        <circle cx={center.x} cy={center.y} r={trigRadius} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                                        
                                        {/* Projections */}
                                        <line x1={trigPoint.x} y1={center.y} x2={trigPoint.x} y2={trigPoint.y} stroke="#ef4444" strokeWidth="3" strokeDasharray="4,2" /> {/* Sine */}
                                        <line x1={center.x} y1={trigPoint.y} x2={trigPoint.x} y2={trigPoint.y} stroke="#22c55e" strokeWidth="3" strokeDasharray="4,2" /> {/* Cosine */}
                                        
                                        {/* Vector */}
                                        <line x1={center.x} y1={center.y} x2={trigPoint.x} y2={trigPoint.y} stroke="#6366f1" strokeWidth="4" />
                                        
                                        {/* Values Label */}
                                        <g transform="translate(50, 420)">
                                            <rect x="0" y="0" width="140" height="70" rx="12" fill="white" className="shadow-md" />
                                            <text x="10" y="20" className="text-[10px] font-black fill-red-500 uppercase">sen(θ) = {(-(trigPoint.y - center.y)/trigRadius).toFixed(2)}</text>
                                            <text x="10" y="40" className="text-[10px] font-black fill-green-600 uppercase">cos(θ) = {((trigPoint.x - center.x)/trigRadius).toFixed(2)}</text>
                                            <text x="10" y="60" className="text-[10px] font-black fill-indigo-600 uppercase">θ = {calculateAngle()}°</text>
                                        </g>

                                        <motion.circle 
                                            onPan={(_, info) => {
                                                const svg = document.getElementById('math-lab-svg') as any;
                                                if (!svg) return;
                                                const coords = getSVGCoords(info.point.x, info.point.y, svg);
                                                const angle = Math.atan2(coords.y - center.y, coords.x - center.x);
                                                setTrigPoint({
                                                    x: center.x + Math.cos(angle) * trigRadius,
                                                    y: center.y + Math.sin(angle) * trigRadius
                                                });
                                                // Sync anglePoint for the label calculation
                                                setAnglePoint(coords);
                                            }}
                                            cx={trigPoint.x} cy={trigPoint.y} r="22" fill="#6366f1" className="cursor-grab active:cursor-grabbing shadow-lg"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </g>
                                )}

                                {mode === 'fractions' && (
                                    <g>
                                        <circle cx={center.x} cy={center.y} r="150" fill="#fff7ed" stroke="#f97316" strokeWidth="2" strokeDasharray="4,4" />
                                        {Array.from({ length: den }).map((_, i) => {
                                            const startAngle = (i * 360) / den - 90;
                                            const endAngle = ((i + 1) * 360) / den - 90;
                                            const x1 = center.x + 150 * Math.cos((startAngle * Math.PI) / 180);
                                            const y1 = center.y + 150 * Math.sin((startAngle * Math.PI) / 180);
                                            const x2 = center.x + 150 * Math.cos((endAngle * Math.PI) / 180);
                                            const y2 = center.y + 150 * Math.sin((endAngle * Math.PI) / 180);
                                            const largeArcFlag = 360 / den > 180 ? 1 : 0;
                                            
                                            return (
                                                <path 
                                                    key={i}
                                                    d={`M ${center.x} ${center.y} L ${x1} ${y1} A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                                    fill={i < num ? '#fb923c' : 'none'}
                                                    stroke="#ea580c"
                                                    strokeWidth="2"
                                                />
                                            );
                                        })}
                                        <g transform="translate(250, 450)">
                                            <text textAnchor="middle" className="text-4xl font-black fill-[#ea580c]">{num} / {den}</text>
                                            <text y="20" textAnchor="middle" className="text-[10px] font-black fill-gray-400 uppercase tracking-widest">Representación visual</text>
                                        </g>
                                    </g>
                                )}

                                {mode === 'vectors' && (
                                    <g>
                                        {/* Cartesian Plane */}
                                        <line x1="50" y1={center.y} x2="450" y2={center.y} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1={center.x} y1="50" x2={center.x} y2="450" stroke="#e2e8f0" strokeWidth="1" />
                                        
                                        {/* Vector Arrow */}
                                        <defs>
                                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                                <polygon points="0 0, 10 3.5, 0 7" fill="#9333ea" />
                                            </marker>
                                        </defs>
                                        <line 
                                            x1={center.x} y1={center.y} 
                                            x2={center.x + vec.x} y2={center.y + vec.y} 
                                            stroke="#9333ea" strokeWidth="4" 
                                            markerEnd="url(#arrowhead)" 
                                        />
                                        
                                        {/* Components */}
                                        <line x1={center.x} y1={center.y} x2={center.x + vec.x} y2={center.y} stroke="#9333ea" strokeWidth="2" strokeDasharray="4,4" opacity="0.4" />
                                        <line x1={center.x + vec.x} y1={center.y} x2={center.x + vec.x} y2={center.y + vec.y} stroke="#9333ea" strokeWidth="2" strokeDasharray="4,4" opacity="0.4" />

                                        {/* Vector Info */}
                                        <g transform="translate(320, 80)">
                                            <rect width="120" height="60" rx="12" fill="white" className="shadow-md border border-purple-50" />
                                            <text x="10" y="20" className="text-[10px] font-black fill-purple-700 uppercase">Vector V = ({Math.round(vec.x/10)}, {Math.round(-vec.y/10)})</text>
                                            <text x="10" y="45" className="text-[10px] font-black fill-purple-400 uppercase">Magnitud: {(Math.sqrt(vec.x*vec.x + vec.y*vec.y)/10).toFixed(1)}</text>
                                        </g>

                                        <motion.circle 
                                            onPan={(_, info) => {
                                                const svg = document.getElementById('math-lab-svg') as any;
                                                if (!svg) return;
                                                const coords = getSVGCoords(info.point.x, info.point.y, svg);
                                                setVec({
                                                    x: Math.min(200, Math.max(-200, coords.x - center.x)),
                                                    y: Math.min(200, Math.max(-200, coords.y - center.y))
                                                });
                                            }}
                                            cx={center.x + vec.x} cy={center.y + vec.y} r="22" fill="#9333ea" className="cursor-grab active:cursor-grabbing shadow-lg"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </g>
                                )}
                            </svg>
                        )}
                    </div>

                    {/* Instructions / Summary */}
                    <div className="w-full md:w-64 bg-white border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-hide">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <h3 className="font-black text-[#1e3a8a] text-[10px] uppercase tracking-widest mb-2">¿Cómo se juega?</h3>
                            <p className="text-xs text-blue-900/70 leading-relaxed font-medium">
                                {mode === 'arithmetic' && "Escribe dos números y elige una operación. ¡Mira cómo se agrupan los bloques!"}
                                {mode === 'angles' && "Arrastra el punto azul para cambiar la abertura. ¡Detecta ángulos rectos (90°) y llanos (180°)!"}
                                {mode === 'rect' && "Tira de la esquina para cambiar la base y altura. ¡El área es lo que hay dentro!"}
                                {mode === 'tri' && "Mueve los vértices. Fíjate cómo cambia el espacio que ocupa el triángulo."}
                                {mode === 'circle' && "Cambia el radio. El área crece muy rápido porque el radio está al cuadrado (r²)."}
                                {mode === 'trig' && "Mueve el punto en el círculo unitario. Observa cómo el Seno (rojo) y el Coseno (verde) son solo proyecciones en los ejes X e Y."}
                                {mode === 'fractions' && "Usa los controles para cambiar el numerador y denominador. ¡Mira cuántas rebanadas te tocan!"}
                                {mode === 'vectors' && "Arrastra la punta de la flecha. Los vectores tienen dirección, sentido y magnitud. ¡Pilar del Álgebra Lineal!"}
                            </p>
                        </div>

                        {mode === 'fractions' && (
                            <div className="flex flex-col gap-2 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-orange-400 uppercase">Numerador</span>
                                    <input type="range" min="1" max={den} value={num} onChange={(e) => setNum(parseInt(e.target.value))} className="w-24" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-orange-400 uppercase">Denominador</span>
                                    <input type="range" min="2" max="24" value={den} onChange={(e) => setDen(parseInt(e.target.value))} className="w-24" />
                                </div>
                            </div>
                        )}

                        {/* Socratic Tutor Card */}
                        <div className="mt-auto space-y-4">
                            <div className="bg-indigo-900 rounded-[2rem] p-5 shadow-xl border-t-4 border-indigo-400 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">🎓</div>
                                
                                <AnimatePresence mode="wait">
                                    {!showExplanation ? (
                                        <motion.div 
                                            key="question"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Reto del Tutor</p>
                                            <p className="text-xs font-bold text-white leading-snug">{question.q}</p>
                                            
                                            <div className="space-y-2">
                                                {question.options.map((opt: any, i: number) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleOptionSelect(i)}
                                                        className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left text-[10px] font-bold text-white transition-all border border-white/5"
                                                    >
                                                        {opt.text}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="explanation"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className={`p-3 rounded-xl flex items-center gap-2 ${question.options[selectedOption!].isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                <span className="text-xl">{question.options[selectedOption!].isCorrect ? '✅' : '❌'}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {question.options[selectedOption!].isCorrect ? '¡Excelente!' : 'Casi...'}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-white/90 leading-relaxed italic">
                                                "{question.options[selectedOption!].why}"
                                            </p>

                                            {question.options[selectedOption!].isCorrect ? (
                                                <button 
                                                    onClick={nextQuestion}
                                                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                                                >
                                                    Siguiente Desafío →
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setShowExplanation(false)}
                                                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Intentar de nuevo
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MathLabModal;
