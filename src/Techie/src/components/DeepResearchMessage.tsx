
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeepResearchContent, Grade } from '../types';
import * as geminiService from '../services/geminiService';

interface DeepResearchMessageProps {
    content: DeepResearchContent;
    grade?: Grade;
    userName?: string | null;
    customKey?: string;
    onImageClick?: (url: string, prompt?: string) => void;
    onSaveProject?: (type: 'image' | 'report' | 'certificate', title: string, url?: string, content?: string) => void;
}

interface GeneratedImage {
    prompt: string;
    url: string | null;
    status: 'pending' | 'loading' | 'done' | 'error';
}

const DeepResearchMessage: React.FC<DeepResearchMessageProps> = ({ 
    content, grade, userName, customKey, onImageClick, onSaveProject 
}) => {
    const [images, setImages] = useState<Record<string, GeneratedImage>>({});
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5])); // All expanded by default

    // Parse [IMAGE_PROMPT: ...] tags from the markdown
    const parseImagePrompts = useCallback((text: string): string[] => {
        const regex = /\[IMAGE_PROMPT:\s*(.*?)\]/g;
        const prompts: string[] = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            prompts.push(match[1].trim());
        }
        return prompts;
    }, []);

    // Initialize image slots on mount
    useEffect(() => {
        const prompts = parseImagePrompts(content.markdownReport);
        const initial: Record<string, GeneratedImage> = {};
        prompts.forEach(prompt => {
            initial[prompt] = { prompt, url: null, status: 'pending' };
        });
        setImages(initial);
    }, [content.markdownReport, parseImagePrompts]);

    const generateImageForPrompt = async (prompt: string) => {
        if (!grade) return;
        
        setImages(prev => ({
            ...prev,
            [prompt]: { ...prev[prompt], status: 'loading' }
        }));

        try {
            const result = await geminiService.generateImage(
                prompt,
                '16:9',
                grade,
                userName || 'Estudiante',
                'realistic',
                'natural',
                undefined,
                '1K',
                undefined,
                customKey
            );

            if (result) {
                setImages(prev => ({
                    ...prev,
                    [prompt]: { prompt, url: result.url, status: 'done' }
                }));
            } else {
                setImages(prev => ({
                    ...prev,
                    [prompt]: { ...prev[prompt], status: 'error' }
                }));
            }
        } catch (e) {
            console.error('Image generation error:', e);
            setImages(prev => ({
                ...prev,
                [prompt]: { ...prev[prompt], status: 'error' }
            }));
        }
    };

    const generateAllImages = async () => {
        const pending = Object.values(images).filter(img => img.status === 'pending' || img.status === 'error');
        for (const img of pending) {
            await generateImageForPrompt(img.prompt);
        }
    };

    const renderMarkdownWithImages = (text: string) => {
        // Split text by [IMAGE_PROMPT: ...] tags
        const parts = text.split(/(\[IMAGE_PROMPT:\s*.*?\])/g);
        
        return parts.map((part, i) => {
            const imageMatch = part.match(/\[IMAGE_PROMPT:\s*(.*?)\]/);
            
            if (imageMatch) {
                const prompt = imageMatch[1].trim();
                const imageData = images[prompt];
                
                return (
                    <div key={`img-${i}`} className="my-8 rounded-3xl overflow-hidden border border-gray-100 shadow-lg bg-gradient-to-br from-slate-50 to-white">
                        {imageData?.status === 'done' && imageData.url ? (
                            <div className="relative group cursor-pointer" onClick={() => onImageClick?.(imageData.url!, prompt)}>
                                <img 
                                    src={imageData.url} 
                                    alt={prompt} 
                                    className="w-full h-auto max-h-[400px] object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                                        {prompt.slice(0, 120)}...
                                    </p>
                                </div>
                            </div>
                        ) : imageData?.status === 'loading' ? (
                            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 animate-pulse">
                                <div className="text-center space-y-3">
                                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Generando ilustración...</p>
                                </div>
                            </div>
                        ) : imageData?.status === 'error' ? (
                            <div className="h-32 flex items-center justify-center bg-red-50">
                                <button 
                                    onClick={() => generateImageForPrompt(prompt)}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    ⚠️ Error — Reintentar
                                </button>
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200">
                                <button 
                                    onClick={() => generateImageForPrompt(prompt)}
                                    className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <span>🎨</span> Generar Ilustración
                                </button>
                            </div>
                        )}
                        <div className="px-4 py-2 bg-white border-t border-gray-50">
                            <p className="text-[9px] font-bold text-gray-400 italic truncate">📷 {prompt.slice(0, 100)}</p>
                        </div>
                    </div>
                );
            }

            // Regular markdown rendering
            return (
                <div key={`text-${i}`}>
                    {part.split('\n').map((line, j) => {
                        const formatted = line.split('**').map((seg, k) =>
                            k % 2 === 1 ? <strong key={k} className="text-[#1e3a8a] font-bold">{seg}</strong> : seg
                        );
                        if (line.startsWith('### ')) return <h3 key={j} className="text-lg font-black text-[#1e3a8a] mt-6 mb-2 uppercase tracking-tight">{formatted}</h3>;
                        if (line.startsWith('## ')) return <h2 key={j} className="text-xl font-black text-[#1e3a8a] mt-8 mb-3 uppercase tracking-tighter border-b border-gray-100 pb-2">{formatted}</h2>;
                        if (line.startsWith('# ')) return <h1 key={j} className="text-2xl font-black text-[#1e3a8a] mt-4 mb-4 uppercase tracking-tighter">{formatted}</h1>;
                        if (line.startsWith('- ') || line.startsWith('* ')) return (
                            <li key={j} className="ml-4 mb-1 text-sm leading-relaxed list-disc text-gray-700">{formatted}</li>
                        );
                        if (line.trim() === '') return <div key={j} className="h-2" />;
                        return <p key={j} className="mb-2 leading-relaxed text-sm text-gray-700">{formatted}</p>;
                    })}
                </div>
            );
        });
    };

    const imageCount = Object.keys(images).length;
    const pendingCount = Object.values(images).filter(i => i.status === 'pending' || i.status === 'error').length;

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Reporte de Investigación</span>
                <h2 className="text-xl font-black uppercase tracking-tighter mt-1">{content.topic}</h2>
                
                {/* Image Generation Controls */}
                {imageCount > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                        <button 
                            onClick={generateAllImages}
                            disabled={pendingCount === 0}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                pendingCount > 0 
                                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20 shadow-lg' 
                                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                        >
                            <span>🖼️</span> 
                            {pendingCount > 0 
                                ? `Generar ${pendingCount} ilustracion${pendingCount > 1 ? 'es' : ''}` 
                                : 'Todas las imágenes generadas ✓'
                            }
                        </button>
                    </div>
                )}
            </div>

            {/* Report Body */}
            <div className="p-5 md:p-8 text-gray-800 bg-white">
                {renderMarkdownWithImages(content.markdownReport)}
            </div>
        </div>
    );
};

export default DeepResearchMessage;
