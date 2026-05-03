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
  TrendingUp,
  Eraser
} from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptGenie } from './PromptGenie';
import { useAuth } from '../lib/AuthContext';
import { incrementImageCount } from '../lib/db';
import { generateInfographicContent, suggestBetterPrompt } from '../services/geminiService';


const VISUAL_STYLES = [
  { id: 'professional', name: 'Corporativo',     icon: '🏢', primary: '#2563eb', bg: '#f8fafc',  font: 'Space Grotesk' },
  { id: 'sketch_note', name: 'Sketch Note',       icon: '✏️', primary: '#1e293b', bg: '#fffef9',  font: 'Inter' },
  { id: 'kawaii',      name: 'Kawaii',            icon: '🌸', primary: '#f472b6', bg: '#fdf2f8',  font: 'Inter' },
  { id: 'scientific',  name: 'Científico',        icon: '🔬', primary: '#10b981', bg: '#020617',  font: 'JetBrains Mono' },
  { id: 'anime',       name: 'Anime',             icon: '⚡', primary: '#6366f1', bg: '#0c0a1e',  font: 'Inter' },
  { id: 'clay',        name: 'Arcilla 3D',        icon: '🏺', primary: '#ec4899', bg: '#f1f5f9',  font: 'Inter' },
  { id: 'editorial',   name: 'Editorial',         icon: '📰', primary: '#b45309', bg: '#fffbeb',  font: 'Georgia' },
  { id: 'instructional', name: 'Instructional',   icon: '📋', primary: '#0369a1', bg: '#f0f9ff',  font: 'Inter' },
  { id: 'bento_grid',  name: 'Bento Grid',        icon: '🗂️', primary: '#6366f1', bg: '#f1f5f9',  font: 'Inter' },
  { id: 'bricks',      name: 'Bricks',            icon: '🧱', primary: '#facc15', bg: '#1e293b',  font: 'Inter' },
  { id: 'whiteboard',  name: 'Pizarrón Blanco',   icon: '🖊️', primary: '#2563eb', bg: '#ffffff',  font: 'Inter' },
  { id: 'blackboard',  name: 'Pizarrón Negro',    icon: '🎨', primary: '#f0f0f0', bg: '#111111',  font: 'Inter' },
  { id: 'neubrutalist',name: 'Brutalista',        icon: '🏁', primary: '#000000', bg: '#ffffff',  font: 'Space Grotesk' },
  { id: 'classic',     name: 'Boceto Clásico',    icon: '🖌️', primary: '#475569', bg: '#ffffff',  font: 'Inter' },
  { id: 'chalkboard',  name: 'Pizarrón Verde',    icon: '🖍️', primary: '#ffffff', bg: '#064e3b',  font: 'Inter' },
  { id: 'blueprint',   name: 'Plano Técnico',     icon: '📐', primary: '#ffffff', bg: '#1e3a8a',  font: 'Courier New' },
  { id: 'lego',        name: 'Estilo Lego',       icon: '🟡', primary: '#facc15', bg: '#1e293b',  font: 'Inter' },
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

export function ImageEditor({ 
  onClose, 
  theme, 
  lang = 'es',
  appConfig, 
  onTrialEnd,
  isMobile = false 
}: { 
  onClose: () => void, 
  theme: 'dark' | 'light', 
  lang?: 'en' | 'es',
  appConfig: any, 
  onTrialEnd?: () => void,
  isMobile?: boolean
}) {
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
  // Mask / Inpaint state
  const [isMaskMode, setIsMaskMode] = useState(false);
  const [maskBrushSize, setMaskBrushSize] = useState(40);
  const [maskPrompt, setMaskPrompt] = useState('');
  const [originalSnapshot, setOriginalSnapshot] = useState<string | null>(null);
  const [premaskedObjects, setPremaskedObjects] = useState<number>(0);
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

  const t = translations[lang || 'es'];

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
        const maxImages = profile?.maxImages || 2;
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

      const aspectMap: Record<string, string> = {
        ppt: '16:9',
        infographic: '9:16',
        social: '1:1'
      };
      const aspectRatio = aspectMap[selectedTemplate] || '16:9';

      const styleHints: Record<string, string> = {
        professional:  'Clean corporate design, modern minimalist, data-rich with charts and icons, dark blue and white color scheme, premium business presentation quality',
        sketch_note:   'Hand-drawn black marker sketch note style, sketchbook aesthetic, detailed line art, ink outlines, minimal spot color highlights, clean white background, confident marker strokes, design-thinking workshop aesthetic',
        kawaii:        'Cute Japanese kawaii illustration style, pastel pink and purple palette, sparkles, hearts, stars, chibi-style characters, bubbly fonts, adorable rounded shapes, playful and joyful aesthetic',
        scientific:    'Scientific data visualization, dark background, neon green and cyan accents, technical HUD diagrams, lab-grade precision, futuristic data readouts, infographic clarity',
        anime:         'High-quality anime/manga illustration style, dynamic speed lines, vibrant cel-shading, dramatic lighting with lens flares, bold outlines, cinematic widescreen composition, Studio Ghibli meets cyberpunk',
        clay:          'Soft 3D clay/plasticine render, rounded organic shapes, pastel colors, cute and tactile material feel, glossy highlights, Blender-style clay render',
        editorial:     'Editorial magazine watercolor illustration style, aged paper texture, warm sepia and ochre tones, detailed painterly strokes, vintage poster aesthetic, sophisticated and cultured',
        instructional: 'Clean educational instructional diagram style, bold flat icons, numbered steps, speech bubbles, comic-panel layout, clear sans-serif typography, bright primary colors on white, textbook quality',
        bento_grid:    'Modern bento box grid layout, clean compartmentalized sections, each cell with its own icon or illustration, flat design, soft gradients, minimalist Japanese aesthetic, app-icon quality',
        bricks:        'LEGO/plastic construction brick building style, colorful 3D blocks, playful primary colors, stud texture on top, toy-box aesthetic, vibrant and energetic',
        whiteboard:    'Premium whiteboard illustration, clean white surface, multi-color dry-erase markers (blue, orange, green, pink), elegant hand-lettered titles, futuristic mind-map layout, professional ideation session aesthetic, crisp and elegant',
        blackboard:    'Elegant black chalkboard with vibrant colored chalk art (coral pink, electric cyan, lime green, warm yellow), vintage-meets-futuristic aesthetic, sophisticated chalk lettering, artistic diagrams, classic academic elegance with a modern twist',
        neubrutalist:  'Neo-brutalist graphic design, bold black borders, raw expressive typography, high contrast black and yellow, stark geometric shapes, avant-garde editorial feel',
        classic:       'Classic hand-drawn pencil and ink sketch, detailed crosshatching, artist sketchbook page, subtle watercolor washes, refined vintage illustration aesthetic',
        chalkboard:    'Classic dark green chalkboard, white and yellow chalk texture, dusty matte blackboard surface, hand-lettered school aesthetic, warm nostalgia',
        blueprint:     'Architectural engineering blueprint, deep navy blue background, white grid lines, cyanotype aesthetic, precise white technical drawings, engineering typography',
        lego:          'Colorful LEGO brick construction style, 3D plastic blocks, bold yellow and primary colors, stud detail on surfaces, toy-like playful energy'
      };

      const fullPrompt = `Create a high-quality, complete, ready-to-use ${currentTemplate.name} about: ${description}.

Visual style: ${styleHints[selectedStyle] || 'professional corporate design'}.
This must be a COMPLETE, FINISHED visual asset — not a wireframe or mockup.
Include rich visual elements: icons, illustrations, data tables, charts, diagrams where appropriate.
The image must fill the entire frame with no empty space.
Text should be crisp and readable. Use a ${currentStyle.name} aesthetic.
Make it look like a premium, professionally designed asset that could be used in a real corporate presentation.`;

      const IMAGE_MODELS = ['imagen-4.0-fast-generate-001', 'imagen-4.0-generate-001'];
      let imgRes: any = null;

      for (const model of IMAGE_MODELS) {
        try {
          // Imagen uses different API format
          const payload = {
            action: 'generateImage',
            model,
            prompt: fullPrompt,
            aspectRatio
          };

          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          imgRes = await res.json();
          
          if (!imgRes.error && (imgRes.imageBase64 || imgRes.predictions?.[0]?.bytesBase64Encoded)) {
            console.log(`[Image] Success with model: ${model}`);
            break;
          }
        } catch (e) {
          console.warn(`[Image] Model ${model} failed:`, e);
        }
      }

      // Handle imagen response (predict endpoint returns predictions with bytesBase64Encoded)
      const imageBase64 = imgRes.imageBase64 || imgRes.predictions?.[0]?.bytesBase64Encoded;
      if (!imageBase64) {
        throw new Error('Image generation failed. Try again.');
      }

      const imgElement = new window.Image();
      imgElement.crossOrigin = 'anonymous';
      imgElement.src = `data:image/png;base64,${imageBase64}`;

      await new Promise<void>((resolve, reject) => {
        imgElement.onload = () => resolve();
        imgElement.onerror = () => reject(new Error('Failed to load image'));
      });

      const targetWidth = currentTemplate.width;
      const targetHeight = currentTemplate.height;

      fabricCanvas.setDimensions({ width: targetWidth, height: targetHeight });
      setCanvasSize({ width: targetWidth, height: targetHeight });

      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#000000';

      const fabImg = new fabric.Image(imgElement, {
        left: 0,
        top: 0,
      });

      fabImg.scaleX = targetWidth / imgElement.naturalWidth;
      fabImg.scaleY = targetHeight / imgElement.naturalHeight;

      (fabImg as any).data = { id: 'ai-generated', type: 'native-image' };
      fabricCanvas.add(fabImg);
      fabricCanvas.renderAll();

      incrementImageCount(user.uid).catch(e => console.error(e));
    } catch (error: any) {
      console.error('[Image] Error:', error.message);
      alert('La imagen tardó más de lo normal. Intenta de nuevo.');
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

  // ── MASK / INPAINT SYSTEM ──────────────────────────────────────────────
  const enterMaskMode = () => {
    if (!fabricCanvas) return;
    // Take a snapshot of the current canvas BEFORE any mask strokes
    const snapshot = fabricCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    setOriginalSnapshot(snapshot);
    setPremaskedObjects(fabricCanvas.getObjects().length);

    // Enable free drawing with a red semi-transparent brush
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = 'rgba(239, 68, 68, 0.45)';
    fabricCanvas.freeDrawingBrush.width = maskBrushSize;
    (fabricCanvas.freeDrawingBrush as any).strokeLineCap = 'round';

    setIsMaskMode(true);
    setMaskPrompt('');
  };

  const exitMaskMode = (clearStrokes = true) => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = false;

    if (clearStrokes) {
      // Remove all mask strokes (objects added after the snapshot)
      const objects = fabricCanvas.getObjects();
      const toRemove = objects.slice(premaskedObjects);
      toRemove.forEach(obj => fabricCanvas.remove(obj));
      fabricCanvas.renderAll();
    }

    setIsMaskMode(false);
    setOriginalSnapshot(null);
    setMaskPrompt('');
  };

  // Update brush size in real-time
  useEffect(() => {
    if (fabricCanvas && isMaskMode && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = maskBrushSize;
    }
  }, [maskBrushSize, fabricCanvas, isMaskMode]);

  const handleInpaint = async () => {
    if (!fabricCanvas || !user || !originalSnapshot || !maskPrompt.trim()) return;
    if (!checkQuota()) return;

    setIsGenerating(true);
    try {
      const allObjects = fabricCanvas.getObjects();
      const maskStrokes = allObjects.slice(premaskedObjects);

      if (maskStrokes.length === 0) {
        alert('Please paint the area you want to edit first.');
        setIsGenerating(false);
        return;
      }

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = fabricCanvas.width! * 2;
      maskCanvas.height = fabricCanvas.height! * 2;
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.fillStyle = '#000000';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      const tempFabric = new fabric.StaticCanvas(null, {
        width: fabricCanvas.width! * 2,
        height: fabricCanvas.height! * 2,
        backgroundColor: '#000000',
      } as any);

      for (const stroke of maskStrokes) {
        const cloned = await stroke.clone();
        cloned.set({
          stroke: '#ffffff',
          fill: '',
          scaleX: (stroke.scaleX || 1) * 2,
          scaleY: (stroke.scaleY || 1) * 2,
          left: (stroke.left || 0) * 2,
          top: (stroke.top || 0) * 2,
        });
        if (cloned instanceof fabric.Path) {
          cloned.set({ stroke: '#ffffff' });
        }
        tempFabric.add(cloned);
      }
      tempFabric.renderAll();
      const maskDataUrl = tempFabric.toDataURL({ format: 'png', quality: 1, multiplier: 1 } as any);
      tempFabric.dispose();

      const originalBase64 = originalSnapshot.split(',')[1];
      const maskBase64 = maskDataUrl.split(',')[1];

      const IMAGE_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
      let imgRes: any = null;

      for (const model of IMAGE_MODELS) {
        try {
          const payload = {
            model,
            contents: [
              {
                parts: [
                  {
                    text: `Edit this image. I am providing the original image and a mask image. The white areas in the mask indicate the zones that need to be edited. Replace ONLY the white-masked areas with: ${maskPrompt}. Keep everything outside the mask EXACTLY as it is. The result must be seamless and photorealistic.`
                  },
                  {
                    inlineData: { mimeType: 'image/png', data: originalBase64 }
                  },
                  {
                    inlineData: { mimeType: 'image/png', data: maskBase64 }
                  }
                ]
              }
            ],
            config: {
              temperature: genTemperature,
              responseModalities: ['IMAGE'],
              imageConfig: { aspectRatio: 'auto' }
            }
          };

          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generateContent', payload })
          });
          
          imgRes = await res.json();
          
          if (!imgRes.error) {
            const imgPart = imgRes.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
            if (imgPart) {
              console.log(`[Inpaint] Success with model: ${model}`);
              break;
            }
          }
        } catch (e) {
          console.warn(`[Inpaint] Model ${model} failed:`, e);
        }
      }

      if (!imgRes?.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData)) {
        throw new Error('Image editing failed. Try a clearer prompt.');
      }

      const imgPart = imgRes.candidates[0].content.parts.find((p: any) => p.inlineData);
      const imgElement = new window.Image();
      imgElement.crossOrigin = 'anonymous';
      imgElement.src = `data:${imgPart.inlineData.mimeType || 'image/png'};base64,${imgPart.inlineData.data}`;

      await new Promise<void>((resolve, reject) => {
        imgElement.onload = () => resolve();
        imgElement.onerror = () => reject(new Error('Failed to load inpainted image'));
      });

      fabricCanvas.isDrawingMode = false;
      setIsMaskMode(false);

      const imgW = imgElement.naturalWidth;
      const imgH = imgElement.naturalHeight;
      const targetWidth = fabricCanvas.width! || 1920;
      const targetHeight = Math.round(targetWidth * (imgH / imgW));

      fabricCanvas.setDimensions({ width: targetWidth, height: targetHeight });
      setCanvasSize({ width: targetWidth, height: targetHeight });
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#000000';

      const fabImg = new fabric.Image(imgElement, { left: 0, top: 0 });
      fabImg.scaleToWidth(targetWidth);
      (fabImg as any).data = { id: 'ai-inpainted', type: 'native-image' };
      fabricCanvas.add(fabImg);
      fabricCanvas.renderAll();

      setOriginalSnapshot(null);
      setMaskPrompt('');
      incrementImageCount(user.uid).catch(e => console.error(e));
    } catch (error: any) {
      console.error('[Inpaint] Error:', error.message);
      alert('La edición tardó más de lo normal. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
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
    <div className={cn("fixed inset-0 z-[9999] flex flex-col font-sans transition-colors duration-500", 
      theme === 'dark' ? "bg-corporate-950 text-white" : "bg-white text-corporate-900"
    )}>
      <header className={cn("h-12 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 z-30",
        "bg-blue-600 border-blue-500 text-white shadow-lg"
      )}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm relative overflow-hidden group">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(37,99,235,0.1),transparent)]"
                />
                <Zap size={14} className="relative z-10" />
              </div>
              <div>
                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none flex items-center gap-1.5">
                   STUDIO <span className="opacity-70">ENGINE</span>
                   <motion.span 
                     animate={{ opacity: [0.4, 1, 0.4] }}
                     transition={{ duration: 1, repeat: Infinity }}
                     className="w-1 h-1 bg-white rounded-full"
                   />
                 </h2>
                 <p className="text-[7px] font-black opacity-60 uppercase tracking-[0.2em] mt-0.5">V4.2 MULTI-MODAL LIVE</p>
              </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">TLS 1.3 Encryption Active</span>
           </div>

            <button 
                onClick={() => onClose()} 
                className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white font-black uppercase tracking-widest text-[9px] transition-all bg-white/5 rounded-xl border border-white/10 hover:bg-white/10"
                title="Return to Chat"
             >
              <X size={14} /> Close Studio
             </button>
           
           <button 
               onClick={downloadImage}
               className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
             <Download size={14} /> EXPORT
            </button>
            <button 
               type="button"
               id="close-asset-studio-top"
               onClick={() => {
                 console.log("NAV_TRIGGER");
                 onClose();
               }} 
               className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all relative z-[200] pointer-events-auto"
               title="Close Asset Studio"
             >
             <X size={20} />
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
        {/* Left Toolbar */}
        <aside className={cn("w-full lg:w-24 border-b lg:border-b-0 lg:border-r flex lg:flex-col items-center py-4 lg:py-10 gap-2 lg:gap-6 z-20 transition-all overflow-y-auto lg:overflow-y-auto no-scrollbar",
          theme === 'dark' ? "bg-corporate-950 border-white/5" : "bg-white border-corporate-200 shadow-sm"
        )}>
           <ToolButton active={activePanel === 'properties'} onClick={() => setActivePanel('properties')} icon={<Settings2 size={22} />} label="Inspector" theme={theme} />
           <ToolButton active={activePanel === 'tools'} onClick={() => setActivePanel('tools')} icon={<MousePointer2 size={22} />} label="Herramientas" theme={theme} />
           <ToolButton active={activePanel === 'charts'} onClick={() => setActivePanel('charts')} icon={<BarChart2 size={22} />} label="Gráficos" theme={theme} />
           <ToolButton active={activePanel === 'layers'} onClick={() => setActivePanel('layers')} icon={<Layers size={22} />} label="Capas" theme={theme} />
           
           <ToolButton active={isMaskMode} onClick={() => isMaskMode ? exitMaskMode() : enterMaskMode()} icon={<Eraser size={22} />} label="Inpaint/Máscara" theme={theme} />
           
           <div className="hidden lg:block w-10 h-px bg-slate-500/10" />
           
           <ToolButton active={false} onClick={addText} icon={<Type size={22} />} label="Texto" theme={theme} />
           <ToolButton active={false} onClick={() => addShape('rect')} icon={<Square size={22} />} label="Rectángulo" theme={theme} />
           <ToolButton active={false} onClick={() => addShape('circle')} icon={<Circle size={22} />} label="Círculo" theme={theme} />
           
           <ToolButton active={activePanel === 'themes'} onClick={() => setActivePanel('themes')} icon={<Palette size={22} />} label="Temas" theme={theme} />

           <div className="hidden lg:block w-10 h-px bg-slate-500/10" />

           {/* Mask / Inpaint Tool */}
           <ToolButton 
             active={isMaskMode} 
             onClick={() => isMaskMode ? exitMaskMode() : enterMaskMode()} 
             icon={<Eraser size={22} />} 
             label={isMaskMode ? 'Exit Mask' : 'Inpaint'} 
             theme={theme} 
           />

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
                          <div className="w-px h-4 bg-white/10 mx-1" />
                          <div className="relative group">
                            <button 
                              className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 via-green-500 to-blue-500 p-[1px] hover:scale-110 transition-all shadow-lg"
                              title="Full Color Picker"
                            >
                              <div className="w-full h-full rounded-[7px] bg-slate-900 flex items-center justify-center">
                                <input 
                                  type="color" 
                                  value={typeof activeObjectProps.fill === 'string' ? activeObjectProps.fill : '#ffffff'}
                                  onChange={(e) => updateProperty('fill', e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                              </div>
                            </button>
                          </div>
                       </div>
                      </div>
                      
                      {activeObjectProps.type === 'i-text' && (
                          <>
                             <div className="h-6 w-px bg-white/5" />
                             <div className="flex items-center bg-slate-900 border border-white/5 rounded-xl px-1 py-1">
                                <button 
                                  onClick={() => updateProperty('fontSize', Math.max(8, (activeObjectProps.fontSize || 24) - 2))} 
                                  className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-[11px] font-black text-slate-400 hover:text-white transition-all"
                                >
                                  A-
                                </button>
                                <div className="w-px h-4 bg-white/10 mx-1" />
                                <button 
                                  onClick={() => updateProperty('fontSize', (activeObjectProps.fontSize || 24) + 2)} 
                                  className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-[11px] font-black text-slate-400 hover:text-white transition-all"
                                >
                                  A+
                                </button>
                             </div>
                             <span className="text-[10px] font-black text-blue-500 min-w-[20px] text-center ml-2">{activeObjectProps.fontSize}px</span>
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

                {/* Mask Mode Indicator */}
                {isMaskMode && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="ml-auto flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl"
                   >
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Mask Mode Active</span>
                     <button onClick={() => exitMaskMode()} className="text-red-400 hover:text-red-300 transition-colors">
                       <X size={14} />
                     </button>
                   </motion.div>
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

           {/* Floating Inpaint Panel (appears over canvas when mask mode is active) */}
           <AnimatePresence>
              {isMaskMode && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl"
                >
                  <div className={cn("p-6 rounded-3xl border shadow-2xl backdrop-blur-xl",
                    theme === 'dark' 
                      ? "bg-corporate-950/95 border-red-500/20 shadow-red-500/10" 
                      : "bg-white/95 border-red-200 shadow-red-100"
                  )}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                        <Eraser size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Inpaint Zone Editor</p>
                        <p className="text-[9px] font-bold text-slate-500">Paint over the area to edit, then describe what to generate</p>
                      </div>
                    </div>

                    {/* Brush Size Slider */}
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Brush</label>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={maskBrushSize}
                        onChange={(e) => setMaskBrushSize(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-red-500"
                      />
                      <span className="text-[10px] font-black text-red-400 tabular-nums w-8 text-right">{maskBrushSize}px</span>
                    </div>

                    {/* Inpaint Prompt */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={maskPrompt}
                        onChange={(e) => setMaskPrompt(e.target.value)}
                        placeholder="What should appear in the masked area?"
                        onKeyDown={(e) => e.key === 'Enter' && handleInpaint()}
                        className={cn("flex-1 px-5 py-3.5 rounded-2xl text-xs font-bold outline-none transition-all",
                          theme === 'dark' 
                            ? "bg-white/5 border border-white/10 focus:border-red-500/50 text-white" 
                            : "bg-slate-100 border border-slate-200 focus:border-red-500"
                        )}
                      />
                      <button
                        onClick={handleInpaint}
                        disabled={isGenerating || !maskPrompt.trim()}
                        className="px-6 py-3.5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Wand2 size={14} /> Inpaint
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => {
                          if (!fabricCanvas) return;
                          const objects = fabricCanvas.getObjects();
                          const toRemove = objects.slice(premaskedObjects);
                          toRemove.forEach(obj => fabricCanvas.remove(obj));
                          fabricCanvas.renderAll();
                        }}
                        className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-all"
                      >
                        Clear Mask
                      </button>
                      <button 
                        onClick={() => exitMaskMode()}
                        className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
      </main>

        {/* Logic Sidebar */}
        <aside className={cn("w-full lg:w-96 border-l flex flex-col z-20 transition-all shrink-0",
          theme === 'dark' ? "bg-corporate-950 border-white/5" : "bg-white border-corporate-100 shadow-xl",
          activePanel === null ? "hidden lg:flex" : "flex"
        )}>
           <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar gap-10 pb-32">
              
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
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Build 2.8.6</div>
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
