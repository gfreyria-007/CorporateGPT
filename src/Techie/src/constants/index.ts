
import { Grade, ChatMode, ImageStyle, LightingStyle } from '../types';

// Icons
const ICON_ABC_BLOCKS = 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm-6 6h4v4H4v-4zm13.75-2.25a.75.75 0 00-1.5 0V9h-2.5a.75.75 0 000 1.5h2.5v1.25a2 2 0 11-4 0v-1a.75.75 0 00-1.5 0v1a3.5 3.5 0 107 0V7.75zM10 16h4v4h-4v-4z';
const ICON_ABACUS = 'M3 4h18v2H3V4zm0 4h18v2H3V8zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM6 6h2v12H6V6zm5 0h2v12h-2V6zm5 0h2v12h-2V6z';
const ICON_RULER = 'M21 6H3a2 2 0 00-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zM5 14H4v-2h1v2zm2 0H6v-2h1v2zm2 0H8v-2h1v2zm2 0h-1v-2h1v2zm2 0h-1v-2h1v2zm2 0h-1v-2h1v2zm2 0h-1v-2h1v2zm2 0h-1v-2h1v2z';
const ICON_GLOBE = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z';
const ICON_LIGHTBULB = 'M12 2c-1.93 0-3.5 1.57-3.5 3.5C8.5 7.27 9.77 9 11.5 9h1C14.23 9 15.5 7.27 15.5 5.5 15.5 3.57 13.93 2 12 2zM9 11c-1.66 0-3 1.34-3 3v6h12v-6c0-1.66-1.34-3-3-3H9z';
const ICON_BRAIN = 'M12 2a10 10 0 00-7.38 17.07c.56-.27.9-1.03.82-1.68-.09-.72-.5-1.35-1.02-1.75-.52-.4-1.18-.58-1.92-.58H2.5c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5H3c.74 0 1.4-.18 1.92-.58.52-.4 1.02-1.02 1.1-1.75.08-.65-.26-1.41-.82-1.68A10 10 0 0012 2zm9.5 11.5c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-.08c-.74 0-1.4.18-1.92.58-.52.4-.93 1.03-1.02 1.75-.08.65.26 1.41.82 1.68A10 10 0 0012 22a10 10 0 007.38-17.07c-.56.27-.9 1.03-.82 1.68.09.72.5 1.35 1.02 1.75.52.4 1.18.58 1.92.58h.08z';
const ICON_BEAKER = 'M20.84 4.22l-1.41 1.41L15 1.22l-1.41 1.41L12.17 1.22 10.76 2.63 9.34 1.22 7.93 2.63 6.51 1.22 5.1 2.63 3.69 1.22 2.27 2.63 4.4 4.76 3 6.16V21h18V6.16l-1.4-1.4-1.92-1.92zM6 19H5V8.83l1-.83V19zm4 0H9V8l1-1v12zm4 0h-1V8l1-1v12zm4 0h-1V8.83l1-.83V19z';
const ICON_DNA = 'M14.5 6.5C13.38 6.5 12.34 7 11.6 7.79c-.74-.8-1.78-1.29-2.9-1.29C6.45 6.5 5 7.95 5 9.65c0 1.25.75 2.33 1.83 2.85l-.83.83a1 1 0 000 1.41c.39.39 1.02.39 1.41 0l.83-.83c.52 1.08 1.6 1.83 2.85 1.83 1.12 0 2.16-.49 2.9-1.29.74.8 1.78 1.29 2.9 1.29 2.21 0 4-1.79 4-4s-1.79-4-4-4zm0 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z';
const ICON_CODE = 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z';

export const GRADES: Grade[] = [
  { id: 'primaria1', name: '1º Primaria', age: 6, icon: ICON_ABC_BLOCKS, color: { bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-50', border: 'border-blue-400', ring: 'focus:ring-blue-500', text: 'text-blue-600' } },
  { id: 'primaria2', name: '2º Primaria', age: 7, icon: ICON_ABACUS, color: { bg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-50', border: 'border-emerald-400', ring: 'focus:ring-emerald-500', text: 'text-emerald-600' } },
  { id: 'primaria3', name: '3º Primaria', age: 8, icon: ICON_RULER, color: { bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-50', border: 'border-amber-400', ring: 'focus:ring-amber-500', text: 'text-amber-500' } },
  { id: 'primaria4', name: '4º Primaria', age: 9, icon: ICON_GLOBE, color: { bg: 'bg-orange-600', hoverBg: 'hover:bg-orange-50', border: 'border-orange-400', ring: 'focus:ring-orange-500', text: 'text-orange-600' } },
  { id: 'primaria5', name: '5º Primaria', age: 10, icon: ICON_LIGHTBULB, color: { bg: 'bg-rose-600', hoverBg: 'hover:bg-rose-50', border: 'border-rose-400', ring: 'focus:ring-rose-500', text: 'text-rose-600' } },
  { id: 'primaria6', name: '6º Primaria', age: 11, icon: ICON_BRAIN, color: { bg: 'bg-purple-600', hoverBg: 'hover:bg-purple-50', border: 'border-purple-400', ring: 'focus:ring-purple-500', text: 'text-purple-600' } },
  { id: 'secundaria1', name: '1º Secundaria', age: 12, icon: ICON_BEAKER, color: { bg: 'bg-pink-600', hoverBg: 'hover:bg-pink-50', border: 'border-pink-400', ring: 'focus:ring-pink-500', text: 'text-pink-600' } },
  { id: 'secundaria2', name: '2º Secundaria', age: 13, icon: ICON_DNA, color: { bg: 'bg-cyan-600', hoverBg: 'hover:bg-cyan-50', border: 'border-cyan-400', ring: 'focus:ring-cyan-500', text: 'text-cyan-600' } },
  { id: 'secundaria3', name: '3º Secundaria', age: 14, icon: ICON_CODE, color: { bg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-50', border: 'border-indigo-400', ring: 'focus:ring-indigo-500', text: 'text-indigo-600' } },
];

export interface ToolDefinition {
  id: ChatMode;
  title: string;
  desc: string;
  iconPath: string;
  iconBg: string;
  iconText: string;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { id: 'default', title: 'Techie Tutor IA', desc: 'Tu guía súper inteligente que te da pistas para que tú mismo descubras la respuesta.', iconPath: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', iconBg: 'bg-blue-900', iconText: 'text-white' },
  { id: 'math-viva', title: 'Laboratorio de Mate 🧪', desc: '¡Juega con bloques, pizzas de fracciones y balanzas mágicas para entender los números!', iconPath: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-800', iconText: 'text-white' },
  { id: 'explorer', title: 'Explorador del Mundo 🌍', desc: '¡Pregúntale lo que sea a la gran biblioteca de internet!', iconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', iconBg: 'bg-amber-600', iconText: 'text-white' },
  { id: 'researcher', title: 'Super Reportes 📚', desc: 'Investigación profunda para convertirte en un experto de cualquier tema.', iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', iconBg: 'bg-purple-600', iconText: 'text-white' },
  { id: 'quiz-master', title: 'Desafío de Saber 🏆', desc: '¡Ponte a prueba y gana medallas respondiendo preguntas!', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconBg: 'bg-pink-600', iconText: 'text-white' },
  { id: 'image-studio', title: 'Estudio de Arte Mágico ✨', desc: '¡Usa tu imaginación y crea dibujos increíbles con IA!', iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z', iconBg: 'bg-red-600', iconText: 'text-white' },
  { id: 'arcade', title: 'Zona Arcade 🕹️', desc: '¡Tómate un respiro y diviértete con juegos clásicos!', iconPath: 'M21 6H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm5-1a1 1 0 110-2 1 1 0 010 2zm3 3a1 1 0 110-2 1 1 0 010 2z', iconBg: 'bg-rose-900', iconText: 'text-white' }
];

export const STUDIO_STYLES: Record<string, { label: string, prompt: string }> = {
    'none': { label: 'Ninguno', prompt: '' },
    'anime': { label: 'Anime Moderno', prompt: 'ULTRA-FIDELITY 2D ANIME RECONSTRUCTION: Sharp ink outlines, vibrant digital gradients.' },
    'ghibli': { label: 'Estudio Ghibli', prompt: 'TOTAL GHIBLI RECONSTRUCTION: Replace with authentic Studio Ghibli art style.' },
    'realistic': { label: 'Fotorrealista', prompt: 'HYPER-REALISTIC 8K PHOTOGRAPHY: Professional 8k photo transformation.' },
    'cartoon': { label: 'Caricatura 2D', prompt: 'TOTAL CARTOON RECONSTRUCTION: Bold 2D flat cartoon style, thick black outlines.' },
    'simpsons': { label: 'The Simpsons', prompt: 'THE SIMPSONS RECONSTRUCTION: Re-draw everything in the classic Matt Groening style, yellow skin for characters.' },
    'lego': { label: 'Lego Toy', prompt: 'LEGO BRICK RECONSTRUCTION: Transform the entire image into a detailed Lego set with plastic textures.' },
    '3d': { label: '3D Render', prompt: 'PIXAR-STYLE 3D RECONSTRUCTION: High-end 3D digital render.' },
    'oil': { label: 'Óleo Clásico', prompt: 'MUSEUM-GRADE OIL PAINTING: Impasto brushstrokes and rich textures.' },
    'watercolor': { label: 'Acuarela', prompt: 'ARTISTIC WATERCOLOR: Fine art watercolor painting style.' },
    'infographic': { label: 'Infografía', prompt: 'EDUCATIONAL INFOGRAPHIC STYLE: Clean vector icons, pastel flat colors, textbook illustration aesthetic.' },
    'comic': { label: 'Cómic Retro', prompt: 'RETRO COMIC STYLE: Ben-Day dots, strong shadows, vintage comic book ink style.' }
};

export const LIGHTING_PRESETS: Record<string, { label: string, prompt: string }> = {
    'none': { label: 'Normal', prompt: '' },
    'cinematic': { label: 'Cinematográfica', prompt: 'Apply high-contrast cinematic lighting with volumetric shafts.' },
    'golden': { label: 'Hora Dorada', prompt: 'Apply warm amber-toned sunset lighting.' },
    'studio': { label: 'Estudio Profesional', prompt: 'Apply clean neutral three-point studio lighting.' },
    'neon': { label: 'Neón Cyberpunk', prompt: 'Apply vibrant futuristic neon lighting.' },
    'natural': { label: 'Luz Natural', prompt: 'Apply soft airy natural window daylight.' }
};
