import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useAuth, AuthContext } from '../core/AuthContext';
import { AspectRatio } from '../types';
import { 
  Sparkles, X, Wand2, ArrowRight, Lightbulb, Zap, Send, 
  Loader2, Undo2, RotateCcw, ImageIcon, Palette, Square, 
  Type, MousePointer2, Brush, Eraser, Download, Share2, 
  Layers, Trash2, Check, Wand, Target, Monitor, Smartphone,
  Layout, StretchHorizontal, Tv, Building2, Gamepad2, Blocks,
  Camera, UserCheck, Briefcase, Paintbrush, Frame, Pencil,
  Mountain, Box, Clapperboard, Sun, Video
} from 'lucide-react';
import { PromptGenie } from '../../../components/PromptGenie';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string;
  onSave?: (image: string) => void;
  user?: any;
}

interface StyleTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
}

const STYLE_TEMPLATES: StyleTemplate[] = [
  { id: '80s-anime', name: '80s Anime', icon: <Tv size={20} />, prompt: '1980s retro anime style, high contrast cel-shading, vibrant neon color palette with pinks and cyans, vaporwave aesthetic, grainy film texture, bold dark outlines, iconic vintage animation look, hand-drawn quality, CRT screen effect', category: 'anime' },
  { id: 'modern-anime', name: 'Modern Anime', icon: <Sparkles size={20} />, prompt: 'Modern high-fidelity anime style, crisp linework, soft cinematic shading, vibrant and harmonious colors, detailed atmospheric backgrounds, Makoto Shinkai inspired lighting, ethereal glows, digital polish, 4k resolution aesthetic', category: 'anime' },
  { id: 'cyberpunk-2099', name: 'Office 2099', icon: <Building2 size={20} />, prompt: 'Cyberpunk office 2099, futuristic corporate workspace, glowing neon blue and magenta lights, holographic computer displays, sleek metallic surfaces, high-tech corporate architecture, rainy city visible through floor-to-ceiling windows, dark moody atmosphere, volumetric lighting', category: 'office' },
  { id: 'pixel-art-kawai', name: 'Kawai 8-Bit', icon: <Gamepad2 size={20} />, prompt: 'High-quality Kawaii pixel art, adorable chibi character style, vibrant and cheerful color palette, 8-bit retro gaming aesthetic, clean pixel edges, heart motifs, sparkling effects, isometric perspective, video game world atmosphere', category: 'pixel' },
  { id: 'pixel-bricks', name: 'Bricks 8-Bit', icon: <Blocks size={20} />, prompt: 'Classic brick-based pixel art, retro building blocks construction, 8-bit architecture, vibrant primary colors, stylized blocky textures, LEGO-inspired digital art, nostalgic toy aesthetic, sharp geometric edges', category: 'pixel' },
  { id: 'classic-vintage', name: 'Classic Vintage', icon: <Camera size={20} />, prompt: 'Authentic classic vintage photography, heavy film grain, sepia and warm brown tones, faded edges, timeless historical aesthetic, nostalgic 35mm film feel, Leica-style depth of field, dusty texture, antique portrait quality', category: 'photo' },
  { id: 'professional-corporate', name: 'Professional Corp', icon: <UserCheck size={20} />, prompt: 'Ultra-professional corporate headshot, high-end business attire, clean neutral studio background, executive lighting setup, sharp focus on eyes, confident posture, minimal depth of field, high-resolution portrait, magazine cover quality', category: 'portrait' },
  { id: 'professionalLinkedIn', name: 'LinkedIn Pro', icon: <Briefcase size={20} />, prompt: 'Premium LinkedIn professional profile photo, modern business casual, bright airy office background with soft bokeh, approachable and friendly expression, natural daylighting, high-end DSLR quality, clean professional composition', category: 'portrait' },
  { id: 'professional-envato', name: 'Envato Studio', icon: <Palette size={20} />, prompt: 'Creative professional portfolio photo, artistic smart casual, vibrant colorful studio background, creative tools visible, dynamic pose, modern lighting, high-energy creative professional vibe, sharp and clear', category: 'portrait' },
  { id: 'watercolor', name: 'Watercolor', icon: <Paintbrush size={20} />, prompt: 'Professional watercolor painting, soft bleeding colors, expressive wet-on-wet technique, delicate paper texture, artistic hand-painted look, dreamy ethereal atmosphere, splash effects, fine brushwork, pastel tones', category: 'art' },
  { id: 'oil-painting', name: 'Oil Painting', icon: <Frame size={20} />, prompt: 'Masterpiece oil painting, thick impasto brushstrokes, rich heavy textures, dramatic chiaroscuro lighting, Renaissance-inspired color palette, museum quality canvas texture, deep saturated colors, classical art style', category: 'art' },
  { id: 'acrylic-art', name: 'Acrylic Art', icon: <Paintbrush size={20} />, prompt: 'Modern acrylic art, bold and vibrant colors, contemporary expressive style, visible layered brushwork, high contrast, abstract elements, energetic composition, gallery-ready modern art aesthetic', category: 'art' },
  { id: 'sketch-pencil', name: 'Pencil Sketch', icon: <Pencil size={20} />, prompt: 'Highly detailed pencil sketch, realistic graphite shading, hand-drawn paper texture, fine cross-hatching, artistic linework, rough construction lines, architectural drawing style, graphite on white paper', category: 'art' },
  { id: 'watercolor-landscape', name: 'Watercolor Landscape', icon: <Mountain size={20} />, prompt: 'Ethereal watercolor landscape, soft flowing gradients, misty mountains, serene natural scene, artistic transparency, atmospheric depth, peaceful zen aesthetic, fine art painting', category: 'art' },
  { id: '3d-render', name: '3D Render', icon: <Box size={20} />, prompt: 'High-end 3D computer render, Octane Render style, photorealistic materials, subsurface scattering, advanced ray-tracing, Unreal Engine 5 aesthetic, volumetric fog, extremely detailed textures, 8k resolution', category: 'digital' },
  { id: 'illustration-digital', name: 'Digital Illustration', icon: <Monitor size={20} />, prompt: 'Modern digital illustration, clean vector style, flat design with depth, vibrant complementary colors, commercial art aesthetic, sleek and polished, trendy tech illustration style', category: 'digital' },
  { id: 'neon-portrait', name: 'Neon Portrait', icon: <Lightbulb size={20} />, prompt: 'Moody neon portrait, vibrant LED backlight, cyberpunk color scheme (purple and blue), dramatic shadows, glowing skin reflections, cinematic urban night atmosphere, rainy street reflections', category: 'photo' },
  { id: 'film-noir', name: 'Film Noir', icon: <Clapperboard size={20} />, prompt: 'Classic 1930s-1940s film noir cinematic style, stark black and white high-contrast lighting (chiaroscuro), dramatic shadows, smoke and misty atmosphere, period-accurate detective aesthetic including trench coats, fedoras, and vintage accessories, gritty 35mm film grain, moody urban mystery vibe', category: 'photo' },
  { id: 'golden-hour', name: 'Golden Hour', icon: <Sun size={20} />, prompt: 'Breathtaking golden hour photography, warm glowing sunset light, long soft shadows, ethereal light leaks, natural sun flare, beautiful warm skin tones, peaceful summer evening atmosphere', category: 'photo' },
  { id: 'cinematic', name: 'Cinematic', icon: <Video size={20} />, prompt: 'Epic cinematic movie still, anamorphic lens flare, wide aspect ratio, dramatic Hollywood lighting, color graded (teal and orange), high production value, intense emotional atmosphere, 35mm film look', category: 'photo' },
];

const IMAGE_MODELS = [
  { id: 'imagen-3.0-fast-generate-001', name: 'Imagen 3 Fast', description: 'Balanced speed & quality' },
  { id: 'imagen-3.0-generate-001', name: 'Imagen 3 High', description: 'Highest visual fidelity' },
  { id: 'openai/dall-e-3', name: 'DALL-E 3 (OpenRouter)', description: 'OpenAI latest model' },
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4 Preview', description: 'Next-gen fast generation' },
];

const ASPECT_RATIOS = [
  { id: '16:9', name: 'Landscape', icon: <Monitor size={18} /> },
  { id: '9:16', name: 'Portrait', icon: <Smartphone size={18} /> },
  { id: '1:1', name: 'Square', icon: <Square size={18} /> },
  { id: '4:3', name: 'Standard', icon: <Layout size={18} /> },
  { id: '21:9', name: 'Ultrawide', icon: <StretchHorizontal size={18} /> },
];

const IMAGE_SIZES = [
  { id: '1024x1024', name: 'Square 1K' },
  { id: '1792x1024', name: 'Landscape 2K' },
  { id: '1024x1792', name: 'Portrait 2K' },
  { id: '1536x1024', name: 'Photo' },
  { id: '1024x1536', name: 'Portrait' },
];

type EditorMode = 'generate' | 'edit';

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, initialImage, onSave, user: providedUser }) => {
  const authContext = useContext(AuthContext);
  const user = providedUser || authContext?.user;
  const [editorMode, setEditorMode] = useState<EditorMode>('generate');
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1792x1024');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [brushColor, setBrushColor] = useState('rgba(255, 0, 0, 0.6)');
  const [mode, setMode] = useState<'brush' | 'erase'>('brush');
  const [selectedTemplate, setSelectedTemplate] = useState<StyleTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGenie, setShowGenie] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number, y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasWidth = 600;
  const canvasHeight = 400;

  useEffect(() => {
    if (isOpen && initialImage) {
      setImage(initialImage);
      setEditorMode('edit');
      setEditedImage(null);
    }
  }, [isOpen, initialImage]);

  useEffect(() => {
    if (!image || !imageCanvasRef.current || !maskCanvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const ctx = imageCanvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
        const x = (canvasWidth - img.width * scale) / 2;
        const y = (canvasHeight - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
    };
    img.src = image;
  }, [image]);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, cssX: 0, cssY: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const mouseEvent = e as React.MouseEvent;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    return {
      x: cssX * (canvasWidth / rect.width),
      y: cssY * (canvasHeight / rect.height),
      cssX,
      cssY
    };
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCanvasCoords(e);
    
    ctx.beginPath();
    ctx.lineWidth = brushSize * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }
    
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    setLastPoint({ x, y });
  }, [isDrawing, getCanvasCoords, brushSize, brushColor, mode, lastPoint]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y, cssX, cssY } = getCanvasCoords(e);
    setCursorPos({ x: cssX, y: cssY });
    setIsDrawing(true);
    draw(e);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y, cssX, cssY } = getCanvasCoords(e);
    setCursorPos({ x: cssX, y: cssY });
    if (isDrawing) {
      draw(e);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    setLastPoint(null);
    setCursorPos(null);
  };

  const clearMask = () => {
    const ctx = maskCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setEditedImage(null);
        setEditorMode('edit');
        clearMask();
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = (template: StyleTemplate) => {
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
    } else {
      setSelectedTemplate(template);
    }
  };

  const getMaskBase64 = () => {
    if (!maskCanvasRef.current) return null;
    const canvas = maskCanvasRef.current;
    
    // Create a temporary canvas for the white-on-black mask required by Imagen
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    // Fill with black (area to preserve)
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the mask strokes
    const originalCtx = canvas.getContext('2d');
    if (!originalCtx) return '';
    
    const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const maskData = tempCtx.createImageData(canvas.width, canvas.height);
    const mData = maskData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const val = alpha > 10 ? 255 : 0;
      mData[i] = val;
      mData[i + 1] = val;
      mData[i + 2] = val;
      mData[i + 3] = 255;
    }
    
    tempCtx.putImageData(maskData, 0, 0);
    return tempCanvas.toDataURL('image/png').split(',')[1];
  };

  const getSourceImageBase64 = () => {
    if (!imageCanvasRef.current) return null;
    return imageCanvasRef.current.toDataURL('image/png').split(',')[1];
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setEditedImage(null);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const fullPrompt = selectedTemplate ? `Subject: ${prompt}. Style Context: ${selectedTemplate.prompt}` : prompt;
      const apiPath = '/api/gemini'; // Force all to /api/gemini for robustness and fallback support
      
      const idToken = user ? await user.getIdToken() : null;

      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` })
        },
        body: JSON.stringify({
          action: 'generateImage',
          payload: {
            model: selectedModel,
            prompt: fullPrompt,
            aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9'
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Image generation failed');
      }

      const result = await response.json();
      
      // Handle both backend response formats
      let imageUrl = result.imageBase64 || (result.predictions?.[0]?.bytesBase64Encoded) || '';
      
      if (imageUrl && !imageUrl.startsWith('data:')) {
        imageUrl = `data:image/png;base64,${imageUrl}`;
      }

      if (imageUrl) {
        setEditedImage(imageUrl);
        setGeneratedImages(prev => [imageUrl, ...prev]);
        setEditorMode('edit');
      } else {
        throw new Error('No image in response');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Image generation failed:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !image) return;

    setIsProcessing(true);
    setEditedImage(null);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const sourceImageBase64 = getSourceImageBase64();
      const maskImageBase64 = getMaskBase64();
      
      const fullPrompt = selectedTemplate ? `Subject: ${prompt}. Style Context: ${selectedTemplate.prompt}` : prompt;
      
      // For editing/inpainting, we must use an Imagen model that supports masks
      const editModel = selectedModel.startsWith('gemini') ? 'imagen-3.0-fast-generate-001' : selectedModel;
      
      const idToken = user ? await user.getIdToken() : null;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` })
        },
        body: JSON.stringify({
          action: 'generateImage',
          payload: {
            model: editModel,
            prompt: fullPrompt,
            sourceImage: sourceImageBase64,
            maskImage: maskImageBase64,
            aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9'
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Image editing failed');
      }

      const result = await response.json();
      let imageUrl = result.imageBase64 || (result.predictions?.[0]?.bytesBase64Encoded) || '';
      
      if (imageUrl && !imageUrl.startsWith('data:')) {
        imageUrl = `data:image/png;base64,${imageUrl}`;
      }

      if (imageUrl) {
        setEditedImage(imageUrl);
        setGeneratedImages(prev => [imageUrl, ...prev]);
      } else {
        throw new Error('No image in response');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Image editing failed:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  const handleDownload = () => {
    const url = editedImage || image;
    if (!url) return;
    const link = document.createElement('a');
    link.download = `image_${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handleReset = () => {
    setEditedImage(null);
    clearMask();
    setPrompt('');
    setSelectedTemplate(null);
    setGeneratedImages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-teal-100 my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 sm:p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner border border-white/30">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight">Estudio de Imagen</h2>
              <p className="text-teal-100 text-[10px] uppercase tracking-widest font-bold">Generar • Editar • Transformar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 sm:w-10 h-8 sm:h-10 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center transition-colors font-black text-sm sm:text-base"
          >
            ✕
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-teal-50 p-2 gap-2 border-b border-teal-100 shrink-0">
          <button
            onClick={() => setEditorMode('generate')}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${editorMode === 'generate' ? 'bg-teal-500 text-white shadow-lg' : 'bg-transparent text-teal-900/40 hover:bg-teal-100'}`}
          >
            <Sparkles size={16} /> Generar
          </button>
          <button
            onClick={() => setEditorMode('edit')}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${editorMode === 'edit' ? 'bg-teal-500 text-white shadow-lg' : 'bg-transparent text-teal-900/40 hover:bg-teal-100'}`}
          >
            <Brush size={16} /> Editar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-cyan-50">
          {editorMode === 'generate' ? (
            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">🤖 Modelo (OpenRouter)</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none bg-white shadow-sm"
                >
                   {IMAGE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size & Shape */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">📐 Proporción</label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${aspectRatio === ratio.id 
                          ? 'bg-teal-500 text-white shadow-lg' 
                          : 'bg-white text-teal-700 hover:bg-teal-50 border border-teal-200'}`}
                      >
                        {ratio.icon} {ratio.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">📏 Tamaño</label>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_SIZES.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setImageSize(size.id)}
                        className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${imageSize === size.id 
                          ? 'bg-cyan-500 text-white shadow-lg' 
                          : 'bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-200'}`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wide">
                    <Target size={16} className="text-teal-500" /> Prompt
                  </label>
                  <button
                    onClick={() => setShowGenie(true)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 transition-colors"
                  >
                    <Wand2 size={12} /> Prompt Genie
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="w-full p-4 rounded-2xl border-2 border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none font-medium text-gray-700 bg-white shadow-sm resize-none"
                  rows={3}
                />
                
                {showGenie && (
                  <PromptGenie 
                    isOpen={showGenie}
                    onClose={() => setShowGenie(false)}
                    onApply={(enhancedPrompt) => {
                      setPrompt(enhancedPrompt);
                      setShowGenie(false);
                    }}
                    initialPrompt={prompt}
                    theme="light"
                    mode="image"
                  />
                )}
              </div>

              {/* Style Templates */}
              <div>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  {showTemplates ? 'Ocultar Estilos' : '20 Estilos Disponibles'}
                  <RotateCcw size={14} className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                </button>
                
                {showTemplates && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {STYLE_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={`p-3 rounded-xl text-left transition-all border-2 ${selectedTemplate?.id === template.id 
                          ? 'bg-purple-100 border-purple-500 shadow-lg scale-105' 
                          : 'bg-white border-transparent hover:border-purple-200 hover:shadow-md'}`}
                      >
                        <div className="text-xl mb-1">{template.icon}</div>
                        <div className="text-xs font-black text-gray-800">{template.name}</div>
                        <div className="text-[9px] text-gray-400 uppercase">{template.category}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={isProcessing ? handleStop : handleGenerate}
                disabled={!prompt.trim()}
                className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 active:scale-95
                  ${isProcessing || !prompt.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl'}`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin" /> Detener
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap size={24} /> Generar Imagen
                  </span>
                )}
              </button>

              {/* Generated Images */}
              {generatedImages.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">🖼️ Imágenes Generadas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {generatedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setImage(img); setEditorMode('edit'); }}
                        className="relative rounded-xl overflow-hidden border-2 border-teal-200 hover:border-teal-500 transition-all"
                      >
                        <img src={img} alt="Generated" className="w-full h-32 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 px-2 font-bold">
                          Editar
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload */}
              <div className="flex justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-6 bg-teal-500 text-white rounded-full font-bold shadow-lg hover:bg-teal-600 hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <ImageIcon size={18} /> Subir Imagen
                </button>
              </div>

              {/* Canvas */}
              {image && (
                <>
                  <div 
                    ref={containerRef}
                    className="relative mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-teal-200 bg-gray-900"
                    style={{ width: canvasWidth, height: canvasHeight, maxWidth: '100%' }}
                  >
                    <canvas
                      ref={imageCanvasRef}
                      width={canvasWidth}
                      height={canvasHeight}
                      className="absolute top-0 left-0"
                    />
                    <canvas
                      ref={maskCanvasRef}
                      width={canvasWidth}
                      height={canvasHeight}
                      className="absolute top-0 left-0 cursor-none touch-none z-40"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                      onTouchStart={handleMouseDown}
                      onTouchMove={handleMouseMove}
                      onTouchEnd={handleMouseUp}
                    />
                    {editedImage && (
                      <img 
                        src={editedImage} 
                        alt="Edited result"
                        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-30"
                      />
                    )}
                    {cursorPos && (
                      <div 
                        className="absolute pointer-events-none border-2 border-white mix-blend-difference rounded-full z-50"
                        style={{
                          left: cursorPos.x,
                          top: cursorPos.y,
                          width: brushSize * 2,
                          height: brushSize * 2,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                  </div>

                  {/* Tools */}
                  <div className="flex flex-wrap items-center gap-3 justify-center">
                    <div className="flex bg-white rounded-full p-1 shadow-md border border-teal-100">
                      <button
                        onClick={() => setMode('brush')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mode === 'brush' ? 'bg-teal-500 text-white shadow' : 'text-teal-700 hover:bg-teal-50'}`}
                      >
                        <Brush size={16} /> Brush
                      </button>
                      <button
                        onClick={() => setMode('erase')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mode === 'erase' ? 'bg-red-500 text-white shadow' : 'text-red-700 hover:bg-red-50'}`}
                      >
                        <Eraser size={16} /> Erase
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-teal-100">
                      <span className="text-xs font-bold text-teal-700 uppercase">Size:</span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20 sm:w-28 accent-teal-500"
                      />
                      <span className="text-xs font-black text-teal-900 w-6">{brushSize}</span>
                    </div>

                    <button
                      onClick={clearMask}
                      className="px-4 py-2 bg-white text-red-600 rounded-full font-bold text-sm shadow-md border border-red-100 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Clear
                    </button>
                  </div>

                  {/* Styles for editing */}
                  <div>
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span>✨</span>
                      {showTemplates ? 'Ocultar Estilos' : 'Aplicar Estilo'}
                      <span className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {showTemplates && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {STYLE_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className={`p-3 rounded-xl text-left transition-all border-2 ${selectedTemplate?.id === template.id 
                              ? 'bg-purple-100 border-purple-500 shadow-lg' 
                              : 'bg-white border-transparent hover:border-purple-200'}`}
                          >
                            <div className="text-xl mb-1">{template.icon}</div>
                            <div className="text-xs font-black text-gray-800">{template.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prompt for edit */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wide">
                        <Target size={16} className="text-teal-500" /> ¿Qué quieres cambiar?
                      </label>
                      <button
                        onClick={() => setShowGenie(true)}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 transition-colors"
                      >
                        <Wand2 size={12} /> Prompt Genie
                      </button>
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Add a cowboy hat, remove the sun, make it look like 80s anime..."
                      className="w-full p-4 rounded-2xl border-2 border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none font-medium text-gray-700 bg-white shadow-sm resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={handleEdit}
                    disabled={!prompt.trim() || isProcessing || !image}
                    className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 active:scale-95
                      ${isProcessing || !prompt.trim() || !image
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl'}`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" /> Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap size={20} /> Generar Edición
                      </span>
                    )}
                  </button>
                </>
              )}

              {!image && (
                <div className="text-center py-12 text-gray-400">
                  <div className="flex justify-center mb-4">
                    <ImageIcon size={48} className="opacity-20" />
                  </div>
                  <p className="font-bold">Sube una imagen para comenzar a editar</p>
                </div>
              )}
            </div>
          )}

          {/* Download */}
          {(editedImage || image) && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDownload}
                className="py-3 px-6 bg-teal-500 text-white rounded-full font-bold shadow-lg hover:bg-teal-600 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Download size={18} /> Descargar Imagen
              </button>
            </div>
          )}

          {/* Reset */}
          {(editedImage || prompt || selectedTemplate) && (
            <div className="mt-2 flex justify-center">
              <button
                onClick={handleReset}
                className="py-2 px-4 text-orange-600 font-bold text-sm hover:underline flex items-center gap-1"
              >
                <RotateCcw size={14} /> Reiniciar
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ImageEditorModal;