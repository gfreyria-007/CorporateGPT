import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  Square, 
  Circle, 
  Type, 
  Pencil, 
  ImageIcon,
  Layers,
  ArrowUp,
  Download,
  Trash2,
  Brush,
  Wind,
  FileText,
  BarChart2,
  PieChart,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Palette,
  X,
  Sparkles,
  MousePointer2,
  Shapes,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Wand2,
  Settings2,
  Diamond,
  Plus,
  Minus,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { PromptGenie } from './PromptGenie';
import { useAuth } from '../lib/AuthContext';
import { incrementImageCount } from '../lib/db';
import { generateInfographicContent, suggestBetterPrompt } from '../services/geminiService';


const VISUAL_STYLES = [
  { id: 'professional', name: 'Boardroom', icon: '🏢', primary: '#2563eb', bg: '#f8fafc', font: 'Space Grotesk' },
  { id: 'lego', name: 'Lego Style', icon: '🧱', primary: '#facc15', bg: '#1e293b', font: 'Inter' },
  { id: 'classic', name: 'Sketchbook', icon: '🎨', primary: '#475569', bg: '#ffffff', font: 'Inter' },
  { id: 'scientific', name: 'Data Lab', icon: '🔬', primary: '#10b981', bg: '#020617', font: 'JetBrains Mono' },
  { id: 'neubrutalist', name: 'Brutalist', icon: '🏁', primary: '#000000', bg: '#ffffff', font: 'Space Grotesk' },
  { id: 'clay', name: 'Clay / 3D', icon: '🏺', primary: '#ec4899', bg: '#f1f5f9', font: 'Inter' },
];

const LayoutGrid = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const TEMPLATES = [
  { id: 'ppt', name: 'PPT Slide', width: 1920, height: 1080, icon: <LayoutGrid size={16} /> },
  { id: 'infographic', name: 'Portrait Infographic', width: 800, height: 1200, icon: <ArrowUp size={16} /> },
  { id: 'social', name: 'Square Asset', width: 1080, height: 1080, icon: <Square size={16} /> },
];

export function ImageEditor({ onClose, theme, lang = 'en', appConfig, onTrialEnd }: { onClose: () => void, theme: 'light' | 'dark', lang?: 'en' | 'es', appConfig?: any, onTrialEnd?: () => void }) {
  const { user, profile } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [activePanel, setActivePanel] = useState<'tools' | 'charts' | 'layers' | 'themes' | 'properties'>('tools');
  const [activeTool, setActiveTool] = useState<'select' | 'brush' | 'text' | 'rect' | 'circle'>('select');
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 600 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [outputQuality, setOutputQuality] = useState<'standard' | 'high' | 'ultra'>('standard');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedTemplate, setSelectedTemplate] = useState('ppt');
  const [description, setDescription] = useState('');
  const [showPromptGenie, setShowPromptGenie] = useState(false);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);
  const [activeObjectProps, setActiveObjectProps] = useState<any>(null);
  const [canvasObjects, setCanvasObjects] = useState<fabric.Object[]>([]);
  const [generationMode, setGenerationMode] = useState<'native' | 'structured'>('native');
  const [genTemperature, setGenTemperature] = useState(1);
  const [genResolution, setGenResolution] = useState<'1K' | '2K'>('1K');
  const [genOutputFormat, setGenOutputFormat] = useState<'images_text' | 'images_only'>('images_text');
  const isProduction = !!appConfig?.isProduction;

  // Filter visible visual styles based on admin config
  const filteredVisualStyles = VISUAL_STYLES.filter(s => 
    !appConfig?.enabledVisualTemplates || appConfig.enabledVisualTemplates.includes(s.id)
  );

  const COLOR_PALETTES = [
    { name: 'Corporate Blue', hex: '#2563eb' },
    { name: 'Emergent Green', hex: '#10b981' },
    { name: 'Slate Modern', hex: '#475569' },
    { name: 'Deep Purple', hex: '#7c3aed' },
    { name: 'Vibrant Orange', hex: '#f97316' },
  ];

  const t = translations[lang];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: appConfig?.forceWhiteCanvas ? '#ffffff' : (theme === 'dark' ? '#0f172a' : '#ffffff')
    } as any);

    canvas.on('object:added', () => updateObjectsList(canvas));
    canvas.on('object:removed', () => updateObjectsList(canvas));
    canvas.on('object:modified', () => {
      updateObjectsList(canvas);
      syncActiveObjectProps(canvas);
    });
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      setActiveObjectId((obj as any)?.data?.id || null);
      setActiveObjectProps(obj?.toObject(['data']));
      setActivePanel('properties');
    });
    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      setActiveObjectId((obj as any)?.data?.id || null);
      setActiveObjectProps(obj?.toObject(['data']));
    });
    canvas.on('selection:cleared', () => {
      setActiveObjectId(null);
      setActiveObjectProps(null);
      if (activePanel === 'properties') setActivePanel('tools');
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [canvasSize, theme]);

  const syncActiveObjectProps = (canvas: fabric.Canvas) => {
    const active = canvas.getActiveObject();
    if (active) {
      setActiveObjectProps(active.toObject(['data']));
    }
  };

  const updateObjectsList = (canvas: fabric.Canvas) => {
    setCanvasObjects([...canvas.getObjects()].reverse());
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length) {
      fabricCanvas.discardActiveObject();
      activeObjects.forEach((obj) => {
        fabricCanvas.remove(obj);
      });
      fabricCanvas.renderAll();
    }
  };

  const updateProperty = (key: string, value: any) => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      active.set(key as any, value);
      fabricCanvas.renderAll();
      setActiveObjectProps({ ...activeObjectProps, [key]: value });
    }
  };

  const changeLayerOrder = (direction: 'front' | 'back' | 'up' | 'down') => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (!active) return;

    const objects = fabricCanvas.getObjects();
    const index = objects.indexOf(active);

    switch (direction) {
      case 'front': 
        fabricCanvas.moveObjectTo(active, objects.length - 1); 
        break;
      case 'back': 
        fabricCanvas.moveObjectTo(active, 0); 
        break;
      case 'up': 
        if (index < objects.length - 1) fabricCanvas.moveObjectTo(active, index + 1); 
        break;
      case 'down': 
        if (index > 0) fabricCanvas.moveObjectTo(active, index - 1); 
        break;
    }
    fabricCanvas.renderAll();
    updateObjectsList(fabricCanvas);
  };

  const addShape = (type: 'rect' | 'circle' | 'line' | 'diamond') => {
    if (!fabricCanvas) return;
    const common = {
      left: 100,
      top: 100,
      fill: theme === 'dark' ? '#3b82f6' : '#2563eb',
      strokeWidth: 0
    };

    let shape: fabric.Object;
    if (type === 'rect') shape = new fabric.Rect({ ...common, width: 120, height: 80, rx: 8, ry: 8 });
    else if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
    else if (type === 'diamond') shape = new fabric.Rect({ ...common, width: 80, height: 80, angle: 45 });
    else shape = new fabric.Rect({ ...common, width: 200, height: 2 });
    
    (shape as any).data = { id: Math.random().toString(36).substr(2, 9) };
    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.centerObject(shape);
    fabricCanvas.renderAll();
  };

  const addChart = (type: 'bar' | 'pie' | 'line' | 'radar' | 'scatter') => {
    if (!fabricCanvas) return;
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#f59e0b'];
    const dataValues = [120, 180, 150, 220, 170, 130];
    
    const objects: fabric.Object[] = [];
    const id = Math.random().toString(36).substr(2, 9);

    if (type === 'bar') {
      dataValues.forEach((val, i) => {
        const bar = new fabric.Rect({
          left: i * 80,
          top: 250 - val,
          width: 50,
          height: val,
          fill: colors[i % colors.length],
          rx: 8, ry: 8
        });
        objects.push(bar);
      });
    } else if (type === 'line') {
      const points = dataValues.map((val, i) => ({ x: i * 80, y: 250 - val }));
      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const line = new fabric.Path(pathData, {
        fill: '',
        stroke: colors[0],
        strokeWidth: 4,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
      });
      objects.push(line);
      points.forEach((p, i) => {
        const dot = new fabric.Circle({
          left: p.x,
          top: p.y,
          radius: 6,
          fill: colors[i % colors.length],
          stroke: '#ffffff',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center'
        });
        objects.push(dot);
      });
    } else if (type === 'pie') {
      let startAngle = 0;
      const total = dataValues.reduce((a, b) => a + b, 0);
      dataValues.forEach((val, i) => {
        const sweep = (val / total) * 360;
        const slice = new fabric.Circle({
          left: 0,
          top: 0,
          radius: 100,
          startAngle: startAngle,
          endAngle: startAngle + (sweep * Math.PI / 180),
          fill: colors[i % colors.length],
          originX: 'center',
          originY: 'center'
        } as any);
        objects.push(slice);
        startAngle += (sweep * Math.PI / 180);
      });
    } else if (type === 'radar') {
       // Radar chart simulation
       const points: {x: number, y: number}[] = [];
       const radius = 100;
       dataValues.forEach((val, i) => {
          const angle = (i / dataValues.length) * Math.PI * 2;
          points.push({
             x: Math.cos(angle) * (val / 250) * radius,
             y: Math.sin(angle) * (val / 250) * radius
          });
       });
       const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
       const radar = new fabric.Path(pathData, {
          fill: colors[0] + '44',
          stroke: colors[0],
          strokeWidth: 2
       });
       objects.push(radar);
    } else if (type === 'scatter') {
       dataValues.forEach((val, i) => {
          const dot = new fabric.Circle({
             left: i * 40 + Math.random() * 20,
             top: 250 - val + Math.random() * 20,
             radius: 8,
             fill: colors[i % colors.length],
             opacity: 0.7
          });
          objects.push(dot);
       });
    }

    const group = new fabric.Group(objects, {
      left: 200,
      top: 200
    });
    (group as any).data = { id, type: 'chart', chartType: type };
    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result;
      if (typeof data !== 'string') return;
      
      try {
        const imgElement = new Image();
        imgElement.src = data;
        imgElement.onload = () => {
          const img = new fabric.Image(imgElement, {
            left: (fabricCanvas.width || 0) / 4,
            top: (fabricCanvas.height || 0) / 4,
          });
          img.scaleToWidth((fabricCanvas.width || 0) * 0.5);
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
        };
      } catch (err) {
        console.error("Fabric Image Load Error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePromptGenie = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const better = await suggestBetterPrompt(description);
      setDescription(better);
    } catch (error) {
      console.error("Genie Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quota check helper shared by both generation modes
  const checkQuota = (): boolean => {
    if (!user) return false;
    const isSuperAdmin = profile?.role === 'super-admin';
    const isProd = appConfig?.isProduction;
    if (!isSuperAdmin && !isProd) {
      if (!profile?.unlimitedUsage) {
        const maxImages = profile?.maxImages || 5;
        if ((profile?.imagesUsed || 0) >= maxImages) {
          if (onTrialEnd) onTrialEnd();
          else alert(`You have reached your limit of ${maxImages} images in this demo.`);
          return false;
        }
      }
    }
    return true;
  };

  // ── NATIVE IMAGE GENERATION (matches Google AI Studio) ──────────────
  // Sends the prompt directly to Gemini's native image model and renders
  // the full AI-generated image onto the canvas as a single high-res asset.
  const generateNativeImage = async () => {
    if (!fabricCanvas || !user) return;
    if (!checkQuota()) return;

    setIsGenerating(true);
    try {
      const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
      const currentStyle = VISUAL_STYLES.find(s => s.id === selectedStyle) || VISUAL_STYLES[0];

      // Build a rich prompt that tells the model to create a full visual asset
      const aspectMap: Record<string, string> = {
        ppt: '16:9',
        infographic: '9:16',
        social: '1:1'
      };
      const aspectRatio = aspectMap[selectedTemplate] || '16:9';

      const styleHints: Record<string, string> = {
        professional: 'Clean corporate design, modern minimalist, data-rich layout with charts and icons, dark blue and white color scheme, professional business presentation quality',
        lego: 'Colorful LEGO brick style, playful 3D blocks, bold yellow and primary colors, toy-like aesthetic',
        classic: 'Hand-drawn pencil sketch style, artistic sketchbook aesthetic, detailed technical drawings, minimal colors with ink accents',
        scientific: 'Scientific data visualization, dark background, neon green accents, technical diagrams, lab-grade precision, futuristic HUD elements',
        neubrutalist: 'Neo-brutalist design, bold black borders, raw typography, high contrast, stark geometric shapes, avant-garde',
        clay: 'Soft 3D clay/plasticine render style, rounded organic shapes, pastel colors, cute and tactile feel'
      };

      const fullPrompt = `Create a high-quality, complete, ready-to-use ${currentTemplate.name} about: ${description}.

Visual style: ${styleHints[selectedStyle] || 'professional corporate design'}.
This must be a COMPLETE, FINISHED visual asset — not a wireframe or mockup.
Include rich visual elements: icons, illustrations, data tables, charts, diagrams where appropriate.
The image must fill the entire frame with no empty space.
Text should be crisp and readable. Use a ${currentStyle.name} aesthetic.
Make it look like a premium, professionally designed asset that could be used in a real corporate presentation.`;

      const payload = {
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          temperature: genTemperature,
          responseModalities: genOutputFormat === 'images_only' ? ['IMAGE'] : ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio }
        }
      };

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateContent', payload })
      });
      const imgRes = await res.json();

      if (imgRes.error) {
        throw new Error(imgRes.error);
      }

      // Find the image part in the response
      const imgPart = imgRes.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (!imgPart) {
        // Fallback: maybe the response has text but no image
        throw new Error('No image was generated. The model returned text only. Try a more visual prompt.');
      }

      // Load the generated image onto the canvas
      const imgElement = new window.Image();
      imgElement.crossOrigin = 'anonymous';
      imgElement.src = `data:${imgPart.inlineData.mimeType || 'image/png'};base64,${imgPart.inlineData.data}`;

      await new Promise<void>((resolve, reject) => {
        imgElement.onload = () => resolve();
        imgElement.onerror = () => reject(new Error('Failed to load generated image'));
      });

      // Clear canvas and place the full image
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#000000';

      const fabImg = new fabric.Image(imgElement, {
        left: 0,
        top: 0,
      });

      // Scale image to fill the canvas while maintaining aspect ratio
      const scaleX = fabricCanvas.width! / imgElement.naturalWidth;
      const scaleY = fabricCanvas.height! / imgElement.naturalHeight;
      const scale = Math.max(scaleX, scaleY);
      fabImg.scale(scale);

      // Center the image
      fabImg.set({
        left: (fabricCanvas.width! - imgElement.naturalWidth * scale) / 2,
        top: (fabricCanvas.height! - imgElement.naturalHeight * scale) / 2,
      });

      (fabImg as any).data = { id: 'ai-generated', type: 'native-image' };
      fabricCanvas.add(fabImg);
      fabricCanvas.renderAll();

      incrementImageCount(user.uid).catch(e => console.error(e));
    } catch (error: any) {
      console.error('Native image generation failed:', error);
      alert(`Image generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── STRUCTURED INFOGRAPHIC (text + shapes layout) ───────────────────
  const generateInfographic = async () => {
    if (!fabricCanvas || !user) return;
    if (!checkQuota()) return;

    setIsGenerating(true);
    
    try {
      const data = await generateInfographicContent(description, selectedStyle);
      const multiplier = outputQuality === 'ultra' ? 2 : outputQuality === 'high' ? 1.5 : 1;
      
      fabricCanvas.clear();
      const currentStyle = VISUAL_STYLES.find(s => s.id === selectedStyle) || VISUAL_STYLES[0];
      const styleColors = {
        primary: data.themeColor || selectedColor,
        bg: theme === 'dark' ? (currentStyle.id === 'professional' ? '#020617' : '#0f172a') : currentStyle.bg,
        font: currentStyle.font
      };

      fabricCanvas.backgroundColor = styleColors.bg;

      const bg = new fabric.Rect({
        left: 0,
        top: 0,
        width: fabricCanvas.width,
        height: fabricCanvas.height,
        fill: styleColors.bg,
        selectable: false,
        data: { id: 'background' }
      });
      fabricCanvas.add(bg);

      const title = new fabric.IText(data.title.toUpperCase(), {
        left: 50,
        top: 60,
        fontSize: 36 * multiplier,
        fontFamily: styleColors.font,
        fontWeight: '900',
        fill: theme === 'dark' ? '#ffffff' : '#0f172a',
        editable: true,
        data: { generated: true }
      });
      fabricCanvas.add(title);
      
      const subtitle = new fabric.IText(data.subtitle.toUpperCase(), {
        left: 50,
        top: title.top! + title.height! + 10,
        fontSize: 12 * multiplier,
        fontFamily: styleColors.font,
        fontWeight: '600',
        fill: styleColors.primary,
        charSpacing: 200,
        editable: true,
        data: { generated: true }
      });
      fabricCanvas.add(subtitle);

      const startY = subtitle.top! + subtitle.height! + 60;
      const sectionHeight = (fabricCanvas.height! - startY - 100) / data.sections.length;

      for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i];
        const y = startY + (i * sectionHeight);

        const secTitle = new fabric.IText(section.title, {
          left: 50,
          top: y + 10,
          fontSize: 18 * multiplier,
          fontFamily: styleColors.font,
          fontWeight: '700',
          fill: theme === 'dark' ? '#ffffff' : '#0f172a',
          editable: true
        });

        const secDesc = new fabric.IText(section.description, {
          left: 50,
          top: secTitle.top! + secTitle.height! + 5,
          fontSize: 12 * multiplier,
          fontFamily: styleColors.font,
          fill: theme === 'dark' ? '#94a3b8' : '#64748b',
          width: fabricCanvas.width! - 300,
          editable: true
        });

        if (section.value !== undefined) {
          const barWidth = 100;
          const bar = new fabric.Rect({
            left: (fabricCanvas.width! - 150),
            top: y + 20,
            width: barWidth * (section.value / 100),
            height: 10,
            fill: styleColors.primary,
            rx: 5, ry: 5
          });
          fabricCanvas.add(bar);
        }

        fabricCanvas.add(secTitle, secDesc);
      }

      fabricCanvas.renderAll();
      incrementImageCount(user.uid).catch(e => console.error(e));
    } catch (error) {
      console.error("Generation failed", error);
      alert("Asset synthesis failed. Please try a more specific prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Main dispatch: pick the right generation mode
  const handleGenerate = () => {
    if (generationMode === 'native') {
      generateNativeImage();
    } else {
      generateInfographic();
    }
  };

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText('New Component', {
      left: 200,
      top: 200,
      fontSize: 24,
      fontFamily: 'Inter',
      fill: theme === 'dark' ? '#ffffff' : '#000000'
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setCanvasSize({ width: template.width, height: template.height });
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    const link = document.createElement('a');
    link.download = `corporate-${selectedStyle}-${selectedTemplate}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={cn("flex-1 flex flex-col h-full font-sans transition-colors duration-500 relative z-50", 
      theme === 'dark' ? "bg-corporate-950 text-white" : "bg-white text-corporate-900"
    )}>
      <header className={cn("h-20 border-b flex items-center justify-between px-4 sm:px-8 shrink-0 backdrop-blur-xl z-30",
        theme === 'dark' ? "bg-corporate-950/80 border-white/5" : "bg-white/80 border-corporate-200 shadow-sm"
      )}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                <Palette size={20} />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-none">CorporateGPT <span className="text-blue-500">Studio</span></h2>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mt-1">High-Density Asset Synthesis</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">TLS 1.3 Encryption Active</span>
           </div>
           
           <button 
              onClick={downloadImage}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
           >
            <Download size={16} /> EXPORT ASSET
           </button>
           <button 
              type="button"
              id="close-asset-studio"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }} 
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
            <X size={24} />
           </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Toolbar */}
        <aside className={cn("w-full lg:w-24 border-b lg:border-b-0 lg:border-r flex lg:flex-col items-center py-4 lg:py-10 gap-2 lg:gap-6 z-20 transition-all",
          theme === 'dark' ? "bg-corporate-950 border-white/5" : "bg-white border-corporate-200 shadow-sm"
        )}>
           <ToolButton active={activePanel === 'properties'} onClick={() => setActivePanel('properties')} icon={<Settings2 size={22} />} label="Inspector" theme={theme} />
           <ToolButton active={activePanel === 'tools'} onClick={() => setActivePanel('tools')} icon={<MousePointer2 size={22} />} label="Toolbar" theme={theme} />
           <ToolButton active={activePanel === 'charts'} onClick={() => setActivePanel('charts')} icon={<BarChart2 size={22} />} label="Charts" theme={theme} />
           <ToolButton active={activePanel === 'layers'} onClick={() => setActivePanel('layers')} icon={<Layers size={22} />} label="Layers" theme={theme} />
           
           <div className="hidden lg:block w-10 h-px bg-slate-500/10" />
           
           <ToolButton active={activePanel === 'themes'} onClick={() => setActivePanel('themes')} icon={<Palette size={22} />} label="Theming" theme={theme} />

           <div className="lg:mt-auto flex lg:flex-col gap-4">
              <label className="p-4 rounded-[1.8rem] transition-all text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer">
                 <ImageIcon size={22} />
                 <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <button 
                onClick={() => { if(window.confirm('Clear workspace?')) fabricCanvas?.clear() }} 
                className="p-4 rounded-[1.8rem] text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                 <Trash2 size={22} />
              </button>
           </div>
        </aside>

        {/* Dynamic Workspace */}
        <main className={cn("flex-1 flex flex-col transition-all overflow-hidden relative",
          theme === 'dark' ? "bg-corporate-900" : "bg-corporate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
        )}>
          {/* Style Selector Bar */}
          <div className={cn("h-16 border-b flex items-center px-8 overflow-x-auto custom-scrollbar no-scrollbar gap-4 shrink-0",
            theme === 'dark' ? "bg-corporate-950 border-white/5" : "bg-white border-corporate-100"
          )}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4 whitespace-nowrap">Visual Style</span>
            {filteredVisualStyles.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                  selectedStyle === style.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-slate-500/5 text-slate-400 hover:bg-slate-500/10"
                )}
              >
                <span>{style.icon}</span> {style.name}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col relative bg-slate-200/50 dark:bg-corporate-950/50">
             {/* Top Quick Bar */}
             <div className={cn("h-16 border-b flex items-center px-10 gap-8 z-10",
                theme === 'dark' ? "bg-corporate-950 border-white/5" : "bg-white border-corporate-100 shadow-sm"
             )}>
                <div className="flex items-center gap-4 border-r border-white/5 pr-8">
                   <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
                      <LayoutGrid size={16} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Canvas Context</p>
                </div>

                {activeObjectProps ? (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }} 
                     animate={{ opacity: 1, y: 0 }}
                     className="flex items-center gap-6"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: activeObjectProps.fill as string }} />
                         <span className="text-[10px] font-black uppercase text-slate-500">{activeObjectProps.type}</span>
                      </div>
                      <div className="h-6 w-px bg-white/5" />
                      <div className="flex items-center gap-4">
                         {['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#ffffff', '#000000'].map(c => (
                            <button 
                              key={c}
                              onClick={() => updateProperty('fill', c)}
                              style={{ backgroundColor: c }}
                              className={cn("w-4 h-4 rounded-full border border-white/10 hover:scale-125 transition-all", 
                                activeObjectProps.fill === c && "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950"
                              )}
                            />
                         ))}
                      </div>
                      {activeObjectProps.type === 'i-text' && (
                         <>
                            <div className="h-6 w-px bg-white/5" />
                            <div className="flex items-center gap-2">
                               <button onClick={() => updateProperty('fontSize', (activeObjectProps.fontSize || 24) + 2)} className="p-2 bg-white/5 rounded-lg text-white hover:bg-blue-600 transition-all"><Plus size={10} /></button>
                               <span className="text-[10px] font-black text-blue-500 min-w-[20px] text-center">{activeObjectProps.fontSize}</span>
                               <button onClick={() => updateProperty('fontSize', Math.max(8, (activeObjectProps.fontSize || 24) - 2))} className="p-2 bg-white/5 rounded-lg text-white hover:bg-blue-600 transition-all"><Minus size={10} /></button>
                            </div>
                         </>
                      )}
                      <div className="h-6 w-px bg-white/5" />
                      <button onClick={deleteSelected} className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">
                         <Trash2 size={12} /> Clear
                      </button>
                   </motion.div>
                ) : (
                   <p className="text-[10px] font-bold italic text-slate-600">Select an object to modify properties</p>
                )}
             </div>

             <div className="flex-1 p-8 sm:p-20 overflow-auto flex items-center justify-center">
             <div className="relative shadow-2xl shadow-black/20 origin-center scale-[0.6] sm:scale-100 lg:scale-[0.8] xl:scale-100 transition-all duration-700">
                <canvas ref={canvasRef} className="rounded-xl overflow-hidden" />
                {isGenerating && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-50 animate-in fade-in rounded-xl">
                     <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <Zap className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
                     </div>
                     <div className="text-center">
                        <p className="text-xs font-black text-white uppercase tracking-[0.3em] mb-2">Synthesis Engine Active</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Applying {selectedStyle} Aesthetic</p>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

        {/* Logic Sidebar */}
        <aside className={cn("w-full lg:w-96 border-l flex flex-col overflow-hidden z-20 transition-all",
          theme === 'dark' ? "bg-corporate-950 border-white/5" : "bg-white border-corporate-100 shadow-xl"
        )}>
           <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar gap-10">
              
              {activePanel === 'properties' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   {activeObjectProps ? (
                     <>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appearance</label>
                           
                           {activeObjectProps.type === 'i-text' && (
                              <div className="space-y-4 mb-6">
                                 <div className="space-y-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Text Content</p>
                                    <textarea 
                                      value={activeObjectProps.text || ''}
                                      onChange={(e) => updateProperty('text', e.target.value)}
                                      className={cn("w-full p-4 rounded-xl text-xs font-bold outline-none min-h-[80px]", theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100")}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Typography</p>
                                    <select 
                                      value={activeObjectProps.fontFamily || 'Inter'}
                                      onChange={(e) => updateProperty('fontFamily', e.target.value)}
                                      className={cn("w-full p-4 rounded-xl text-xs font-bold outline-none", theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100")}
                                    >
                                       <option value="Inter">Inter (Sans)</option>
                                       <option value="Space Grotesk">Space Grotesk</option>
                                       <option value="JetBrains Mono">JetBrains Mono</option>
                                       <option value="Georgia">Georgia (Serif)</option>
                                       <option value="Courier New">Courier New</option>
                                    </select>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <p className="text-[9px] font-bold text-slate-500 uppercase">Size</p>
                                       <input 
                                         type="number"
                                         value={Math.round(activeObjectProps.fontSize || 24)}
                                         onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
                                         className={cn("w-full p-4 rounded-xl text-xs font-black outline-none", theme === 'dark' ? "bg-white/5" : "bg-slate-100")}
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <p className="text-[9px] font-bold text-slate-500 uppercase">Weight</p>
                                       <select 
                                          value={activeObjectProps.fontWeight || 'normal'}
                                          onChange={(e) => updateProperty('fontWeight', e.target.value)}
                                          className={cn("w-full p-4 rounded-xl text-xs font-bold outline-none", theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100")}
                                       >
                                          <option value="100">Thin</option>
                                          <option value="400">Regular</option>
                                          <option value="700">Bold</option>
                                          <option value="900">Black</option>
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           )}

                           <div className="space-y-2">
                              <p className="text-[9px] font-bold text-slate-500 uppercase">Primary Hue</p>
                              <div className="grid grid-cols-5 gap-2">
                                 {['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff', '#000000', '#6366f1', '#ec4899', '#14b8a6'].map(c => (
                                   <button 
                                     key={c}
                                     onClick={() => updateProperty('fill', c)}
                                     style={{ backgroundColor: c }}
                                     className={cn("w-full aspect-square rounded-lg border transition-all", 
                                       activeObjectProps.fill === c ? "border-blue-500 ring-2 ring-blue-500/20" : "border-white/10"
                                     )}
                                   />
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-2">
                              <div className="flex justify-between">
                                 <p className="text-[9px] font-bold text-slate-500 uppercase">Transparency</p>
                                 <p className="text-[9px] font-black text-blue-500">{Math.round((activeObjectProps.opacity || 1) * 100)}%</p>
                              </div>
                              <input 
                                type="range" 
                                min="0" max="1" step="0.01"
                                value={activeObjectProps.opacity ?? 1}
                                onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                                className="w-full accent-blue-600"
                              />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transform</label>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Rotation</p>
                                 <input 
                                   type="number" 
                                   value={Math.round(activeObjectProps.angle || 0)}
                                   onChange={(e) => updateProperty('angle', parseInt(e.target.value))}
                                   className={cn("w-full p-3 rounded-xl text-[10px] font-black outline-none", 
                                     theme === 'dark' ? "bg-white/5" : "bg-slate-100"
                                   )}
                                 />
                              </div>
                              <div className="space-y-1 text-right">
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Z-Index</p>
                                 <div className="flex justify-end gap-1 mt-2">
                                    <button onClick={() => changeLayerOrder('up')} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><ArrowUp size={12} /></button>
                                    <button onClick={() => changeLayerOrder('down')} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><ArrowDown size={12} /></button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hierarchy</label>
                           <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => changeLayerOrder('front')} className="flex items-center justify-center gap-2 p-3 bg-slate-500/5 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                 <ChevronUp size={12} /> Front
                              </button>
                              <button onClick={() => changeLayerOrder('back')} className="flex items-center justify-center gap-2 p-3 bg-slate-500/5 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                 <ChevronDown size={12} /> Back
                              </button>
                           </div>
                        </div>
                     </>
                   ) : (
                     <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-blue-500">
                           <MousePointer2 size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select an object<br/>to inspect properties</p>
                     </div>
                   )}
                </div>
              )}

               {activePanel === 'tools' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aesthetic Controls</label>
                      
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Core Palette</p>
                        <div className="grid grid-cols-5 gap-2">
                          {COLOR_PALETTES.map(p => (
                            <button
                              key={p.hex}
                              onClick={() => setSelectedColor(p.hex)}
                              title={p.name}
                              style={{ backgroundColor: p.hex }}
                              className={cn("w-full aspect-square rounded-lg border transition-all",
                                selectedColor === p.hex ? "border-blue-500 ring-2 ring-blue-500/20" : "border-white/10"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Synthesis Quality</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['standard', 'high', 'ultra'].map(q => (
                            <button
                              key={q}
                              onClick={() => setOutputQuality(q as any)}
                              className={cn("py-2 rounded-xl text-[8px] font-black uppercase tracking-tight border transition-all",
                                outputQuality === q 
                                  ? "bg-blue-600 border-blue-600 text-white" 
                                  : "bg-slate-500/5 border-transparent text-slate-400"
                              )}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creation Suite</label>
                       <div className="grid grid-cols-2 gap-3">
                          <ToolAction icon={<Type size={18} />} label="Typography" onClick={addText} theme={theme} />
                          <ToolAction icon={<Square size={18} />} label="Rectangle" onClick={() => addShape('rect')} theme={theme} />
                          <ToolAction icon={<Diamond size={18} />} label="Flow Decision" onClick={() => addShape('diamond')} theme={theme} />
                          <ToolAction icon={<Minus size={18} />} label="Separator" onClick={() => addShape('line')} theme={theme} />
                          <ToolAction icon={<Circle size={18} />} label="Ellipse" onClick={() => addShape('circle')} theme={theme} />
                          <ToolAction icon={<ImageIcon size={18} />} label="Stock Photo" onClick={() => {}} theme={theme} />
                       </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structural Presets</label>
                      <div className="grid gap-2">
                        {TEMPLATES.map(tmpl => (
                          <button 
                            key={tmpl.id}
                            onClick={() => applyTemplate(tmpl.id)}
                            className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all text-left",
                              selectedTemplate === tmpl.id 
                                ? "bg-blue-600/10 border-blue-600/50 text-blue-600" 
                                : "bg-slate-500/5 border-transparent text-slate-400 hover:bg-slate-500/10"
                            )}
                          >
                             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                               selectedTemplate === tmpl.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-400/10 text-slate-400"
                             )}>
                                {tmpl.icon}
                             </div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-tight">{tmpl.name}</p>
                                <p className="text-[10px] font-bold opacity-60 tracking-tighter">{tmpl.width}x{tmpl.height} Resolution</p>
                             </div>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {activePanel === 'charts' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statistical Elements</label>
                      <div className="grid grid-cols-1 gap-4">
                         <button 
                          onClick={() => addChart('bar')}
                          className="flex items-center gap-6 p-6 bg-blue-600/5 border border-blue-600/20 rounded-[2rem] hover:bg-blue-600/10 transition-all text-left group"
                         >
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                               <BarChart2 size={24} />
                            </div>
                            <div>
                               <h4 className="text-sm font-black uppercase tracking-tight">Bar Visualization</h4>
                               <p className="text-[10px] font-bold text-slate-500 mt-1">Multi-dimensional comparison</p>
                            </div>
                         </button>
                         <button 
                          onClick={() => addChart('pie')}
                          className="flex items-center gap-6 p-6 bg-indigo-600/5 border border-indigo-600/20 rounded-[2rem] hover:bg-indigo-600/10 transition-all text-left group"
                         >
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                               <PieChart size={24} />
                            </div>
                            <div>
                               <h4 className="text-sm font-black uppercase tracking-tight">Distribution Map</h4>
                               <p className="text-[10px] font-bold text-slate-500 mt-1">Percentage-based allocation</p>
                            </div>
                         </button>
                         <button 
                          onClick={() => addChart('line')}
                          className="flex items-center gap-6 p-6 bg-emerald-600/5 border border-emerald-600/20 rounded-[2rem] hover:bg-emerald-600/10 transition-all text-left group"
                         >
                            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                               <TrendingUp size={24} />
                            </div>
                            <div>
                               <h4 className="text-sm font-black uppercase tracking-tight">Timeline Trend</h4>
                               <p className="text-[10px] font-bold text-slate-500 mt-1">Temporal data progression</p>
                            </div>
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activePanel === 'layers' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Canvas Stack</label>
                   <div className="space-y-2">
                      {canvasObjects.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 space-y-4">
                           <div className="w-16 h-16 bg-slate-500/10 rounded-3xl flex items-center justify-center mx-auto">
                              <Layers size={24} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest">No objects detected</p>
                        </div>
                      ) : (
                        canvasObjects.map((obj, i) => (
                           <div 
                            key={(obj as any).data?.id || i}
                            className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all",
                              activeObjectId === (obj as any).data?.id ? "bg-blue-600/10 border-blue-600/50" : "bg-slate-500/5 border-transparent"
                            )}
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-300/10 rounded-xl flex items-center justify-center text-slate-500">
                                    {obj.type === 'i-text' ? <Type size={16} /> : <Shapes size={16} />}
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter">{obj.type?.toUpperCase() || 'Object'}</p>
                                    <p className="text-[8px] font-bold opacity-50 uppercase">Stack Depth: {canvasObjects.length - i}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-1">
                                 <button className="p-2 text-slate-500 hover:text-blue-500">
                                    <Unlock size={14} />
                                 </button>
                                 <button 
                                  onClick={() => { fabricCanvas?.remove(obj); fabricCanvas?.renderAll(); }}
                                  className="p-2 text-slate-500 hover:text-red-500"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>
              )}

              {activePanel === 'themes' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual DNA</label>
                   <div className="grid grid-cols-2 gap-3">
                      {VISUAL_STYLES.map(style => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={cn("flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all text-center",
                            selectedStyle === style.id 
                              ? "bg-blue-600/10 border-blue-600/50 text-blue-600" 
                              : "bg-slate-500/5 border-transparent text-slate-500 hover:bg-slate-500/10"
                          )}
                        >
                           <span className="text-3xl">{style.icon}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest">{style.name}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="h-px bg-slate-500/10" />

              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesis Prompt</label>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tight opacity-60 animate-pulse">Try Prompt Smarter →</span>
                       <button 
                         onClick={handlePromptGenie}
                         className="p-2 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 transition-all border border-blue-500/20 shadow-lg shadow-blue-500/10"
                         title="Improve your prompt for amazing results"
                       >
                          <Sparkles size={14} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your design vision..."
                      className={cn("w-full rounded-[2rem] p-6 text-xs font-bold outline-none transition-all min-h-[100px] leading-relaxed shadow-inner",
                        theme === 'dark' ? "bg-white/5 border border-white/5 focus:border-blue-500/50" : "bg-slate-100 border border-slate-200 focus:border-blue-600"
                      )}
                    />

                    {/* Generation Mode Toggle */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGenerationMode('native')}
                        className={cn("flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                          generationMode === 'native'
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-slate-500/5 border-transparent text-slate-400 hover:bg-slate-500/10"
                        )}
                      >
                        ✨ AI Image
                      </button>
                      <button
                        onClick={() => setGenerationMode('structured')}
                        className={cn("flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                          generationMode === 'structured'
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-slate-500/5 border-transparent text-slate-400 hover:bg-slate-500/10"
                        )}
                      >
                        📊 Structured
                      </button>
                    </div>

                    {/* AI Studio-style Generation Controls */}
                    {generationMode === 'native' && (
                      <div className="space-y-4 p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                        {/* Output Format */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Output Format</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setGenOutputFormat('images_text')}
                              className={cn("flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all",
                                genOutputFormat === 'images_text'
                                  ? "bg-blue-600/15 border-blue-500/40 text-blue-500"
                                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                              )}
                            >
                              🖼 Images & Text
                            </button>
                            <button
                              onClick={() => setGenOutputFormat('images_only')}
                              className={cn("flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all",
                                genOutputFormat === 'images_only'
                                  ? "bg-blue-600/15 border-blue-500/40 text-blue-500"
                                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                              )}
                            >
                              🖼 Images Only
                            </button>
                          </div>
                        </div>

                        {/* Temperature */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temperature</label>
                            <span className="text-[10px] font-black text-blue-500 tabular-nums">{genTemperature.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.05"
                            value={genTemperature}
                            onChange={(e) => setGenTemperature(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        {/* Resolution */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resolution</label>
                          <div className="flex gap-2">
                            {(['1K', '2K'] as const).map(r => (
                              <button
                                key={r}
                                onClick={() => setGenResolution(r)}
                                className={cn("flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all",
                                  genResolution === r
                                    ? "bg-blue-600/15 border-blue-500/40 text-blue-500"
                                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                                )}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !description.trim()}
                      className="w-full h-16 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-700 disabled:shadow-none"
                    >
                       <Zap size={20} className={isGenerating ? "animate-spin" : ""} /> {isGenerating ? "SYNTHESIZING..." : "GENERATE ASSET"}  
                    </button>
                 </div>
              </div>
           </div>

           <div className={cn("p-8 rounded-t-[3rem] space-y-4 transition-all",
             theme === 'dark' ? "bg-white/2" : "bg-blue-600 text-white shadow-2xl shadow-blue-600/30"
           )}>
              <div className="flex items-center gap-4">
                 <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", theme === 'dark' ? "bg-blue-600" : "bg-white text-blue-600")}>
                    <Wind size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Studio Engine</p>
                    <p className={cn("text-[9px] font-bold uppercase tracking-tighter mt-1", theme === 'dark' ? "text-slate-400" : "text-white/60")}>AI v4.2 - Multi-Modal</p>
                 </div>
              </div>
           </div>
        </aside>

        <AnimatePresence>
           {showPromptGenie && (
             <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowPromptGenie(false)}
                 className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="w-full max-w-xl relative"
               >
                 <PromptGenie 
                   isOpen={showPromptGenie}
                   onClose={() => setShowPromptGenie(false)} 
                   onApply={(p) => { setDescription(p); setShowPromptGenie(false); }}
                   theme={theme}
                 />
               </motion.div>
             </div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ToolAction = ({ icon, label, onClick, theme }: any) => (
  <button 
    onClick={onClick}
    className={cn("flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all text-center group",
       theme === 'dark' ? "bg-white/2 border-white/5 hover:border-blue-500/30" : "bg-slate-50 border-slate-100 hover:border-blue-500 hover:shadow-xl"
    )}
  >
     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
       theme === 'dark' ? "bg-slate-800 text-slate-400 group-hover:text-blue-500" : "bg-white text-slate-400 group-hover:text-blue-600 shadow-sm"
     )}>
        {icon}
     </div>
     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
  </button>
);

const ToolButton = ({ active, onClick, icon, label, theme }: any) => (
  <button 
    onClick={onClick}
    className={cn("p-4 rounded-[1.8rem] transition-all group relative",
      active 
        ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20') 
        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-500/10'
    )}
  >
    {icon}
    <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-[9px] font-black rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[300] uppercase tracking-widest shadow-2xl">
      {label}
    </div>
  </button>
);
