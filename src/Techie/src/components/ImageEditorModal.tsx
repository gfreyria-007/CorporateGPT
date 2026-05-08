import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string;
}

interface StyleTemplate {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  category: string;
}

const STYLE_TEMPLATES: StyleTemplate[] = [
  { id: '80s-anime', name: '80s Anime', icon: '🎞️', prompt: '1980s anime style, retro vaporwave aesthetic, cel-shaded, bold outlines, vibrant neon colors', category: 'anime' },
  { id: 'modern-anime', name: 'Modern Anime', icon: '🎌', prompt: 'Modern anime style, clean linework, soft shading, vibrant colors, detailed backgrounds', category: 'anime' },
  { id: 'cyberpunk-2099', name: 'Office 2099', icon: '🏢', prompt: 'Cyberpunk office 2099, futuristic workspace, neon lights, holographic displays, high-tech corporate', category: 'office' },
  { id: 'pixel-art-kawai', name: 'Kawai 8-Bit', icon: '👾', prompt: 'Kawaii pixel art, cute chibi style, 8-bit retro gaming aesthetic, vibrant colors, adorable character', category: 'pixel' },
  { id: 'pixel-bricks', name: 'Bricks 8-Bit', icon: '🧱', prompt: 'Brick pixel art, retro building blocks style, 8-bit architecture, classic video game aesthetic', category: 'pixel' },
  { id: 'classic-vintage', name: 'Classic Vintage', icon: '📷', prompt: 'Classic vintage photography, film grain, warm tones, timeless aesthetic, nostalgic feel', category: 'photo' },
  { id: 'professional-corporate', name: 'Professional Corp', icon: '👔', prompt: 'Professional corporate headshot, business attire, clean background, executive portrait', category: 'portrait' },
  { id: 'professionalLinkedIn', name: 'LinkedIn Pro', icon: '💼', prompt: 'LinkedIn professional profile photo, business casual, clean office background, approachable yet professional', category: 'portrait' },
  { id: 'professional-envato', name: 'Envato Studio', icon: '🎨', prompt: 'Professional creative portfolio photo, casual smart, vibrant background, friendly confident look', category: 'portrait' },
  { id: 'watercolor', name: 'Watercolor', icon: '🎨', prompt: 'Watercolor painting, soft flowing colors, artistic painted look, delicate brushstrokes, dreamy ethereal', category: 'art' },
  { id: 'oil-painting', name: 'Oil Painting', icon: '🖼️', prompt: 'Classical oil painting, rich textured brushwork, dramatic lighting, Renaissance inspired, museum quality', category: 'art' },
  { id: 'acrylic-art', name: 'Acrylic Art', icon: '🖌️', prompt: 'Modern acrylic painting, bold colors, contemporary art style, vibrant expressive brushwork', category: 'art' },
  { id: 'sketch-pencil', name: 'Pencil Sketch', icon: '✏️', prompt: 'Detailed pencil sketch, realistic shading, hand-drawn aesthetic, fine linework', category: 'art' },
  { id: 'watercolor-landscape', name: 'Watercolor Landscape', icon: '🏔️', prompt: 'Watercolor landscape painting, soft flowing colors, natural scene, dreamy atmosphere', category: 'art' },
  { id: '3d-render', name: '3D Render', icon: '🎮', prompt: '3D computer rendered, photorealistic, high detail, modern CGI aesthetic', category: 'digital' },
  { id: 'illustration-digital', name: 'Digital Illustration', icon: '💻', prompt: 'Digital illustration, vector style, clean lines, vibrant colors, modern artwork', category: 'digital' },
  { id: 'neon-portrait', name: 'Neon Portrait', icon: '💡', prompt: 'Neon lighting portrait, colorful LED lights, cyberpunk aesthetic, dramatic moody atmosphere', category: 'photo' },
  { id: 'film-noir', name: 'Film Noir', icon: '🎬', prompt: 'Film noir style, black and white, dramatic shadows, classic cinematic look', category: 'photo' },
  { id: 'golden-hour', name: 'Golden Hour', icon: '🌅', prompt: 'Golden hour photography, warm sunset light, soft glow, natural beauty lighting', category: 'photo' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎥', prompt: 'Cinematic movie style, dramatic lighting, film grain, epic composition, movie poster aesthetic', category: 'photo' },
];

const IMAGE_MODELS = [
  // Google Gemini - uses existing /api/gemini endpoint
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash ⭐', description: 'Fast & reliable', category: 'Google' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Preview', description: 'Latest experimental', category: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Stable option', category: 'Google' },
];

const ASPECT_RATIOS = [
  { id: '16:9', name: 'Landscape', icon: '🖥️' },
  { id: '9:16', name: 'Portrait', icon: '📱' },
  { id: '1:1', name: 'Square', icon: '⬜' },
  { id: '4:3', name: 'Standard', icon: '📐' },
  { id: '21:9', name: 'Ultrawide', icon: '📊' },
];

const IMAGE_SIZES = [
  { id: '1024x1024', name: 'Square 1K' },
  { id: '1792x1024', name: 'Landscape 2K' },
  { id: '1024x1792', name: 'Portrait 2K' },
  { id: '1536x1024', name: 'Photo' },
  { id: '1024x1536', name: 'Portrait' },
];

type EditorMode = 'generate' | 'edit';

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, initialImage }) => {
  const [editorMode, setEditorMode] = useState<EditorMode>('generate');
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1792x1024');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [brushColor, setBrushColor] = useState('rgba(239, 68, 68, 0.5)');
  const [mode, setMode] = useState<'brush' | 'erase'>('brush');
  const [selectedTemplate, setSelectedTemplate] = useState<StyleTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

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
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * (canvasWidth / rect.width),
      y: (clientY - rect.top) * (canvasHeight / rect.height)
    };
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = mode === 'brush' ? brushColor : 'rgba(0,0,0,0)';
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, [isDrawing, getCanvasCoords, brushSize, brushColor, mode]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = mode === 'brush' ? brushColor : 'rgba(0,0,0,0)';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
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
    setSelectedTemplate(template);
    setPrompt(prev => prev ? `${prev}. ${template.prompt}` : template.prompt);
    setShowTemplates(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setEditedImage(null);
    setAbortController(new AbortController());

    try {
      const fullPrompt = selectedTemplate ? `${prompt}. ${selectedTemplate.prompt}` : prompt;

      // Use same /api/techie endpoint that works in the chat
      const response = await fetch('/api/techie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateImage',
          payload: {
            model: 'black-forest-labs/flux-1-schnell',
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
      
      // Same response format as chat
      let imageUrl = result.imageBase64 || '';
      
      // Format as data URL if needed
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
      if (error.name === 'AbortError') {
        console.log('Generation cancelled');
        return;
      }
      console.error('Image generation failed:', error);
      const msg = error.message || 'Image service unavailable';
      alert(msg.includes('500') || msg.includes('failed') 
        ? 'Image generation unavailable. Try again.' 
        : `Failed: ${msg}`);
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
    // Image editing temporarily unavailable - use generate instead
    alert('Image editing uses the same generation. Try generating a new image with your desired changes!');
    setEditorMode('generate');
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
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-inner border border-white/30">
              🎨
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
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${editorMode === 'generate' ? 'bg-teal-500 text-white shadow-lg' : 'bg-transparent text-teal-900/40 hover:bg-teal-100'}`}
          >
            ✨ Generar
          </button>
          <button
            onClick={() => setEditorMode('edit')}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${editorMode === 'edit' ? 'bg-teal-500 text-white shadow-lg' : 'bg-transparent text-teal-900/40 hover:bg-teal-100'}`}
          >
            🖌️ Editar
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
                      {model.name} - {model.description} ({model.category})
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
                <label className="block text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">🎯 Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="w-full p-4 rounded-2xl border-2 border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none font-medium text-gray-700 bg-white shadow-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Style Templates */}
              <div>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>✨</span>
                  {showTemplates ? 'Ocultar Estilos' : '20 Estilos Disponibles'}
                  <span className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`}>▼</span>
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
                  <span className="flex items-center justify-center gap-2" onClick={handleStop}>
                    <span>⏹️</span> Detener
                  </span>
                ) : (
                  '🚀 Generar Imagen'
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
                  <span>📁</span> Subir Imagen
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
                      className="absolute top-0 left-0 cursor-crosshair touch-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleMouseDown}
                      onTouchMove={handleMouseMove}
                      onTouchEnd={handleMouseUp}
                    />
                    {editedImage && (
                      <img 
                        src={editedImage} 
                        alt="Edited result"
                        className="absolute top-0 left-0 w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Tools */}
                  <div className="flex flex-wrap items-center gap-3 justify-center">
                    <div className="flex bg-white rounded-full p-1 shadow-md border border-teal-100">
                      <button
                        onClick={() => setMode('brush')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'brush' ? 'bg-teal-500 text-white shadow' : 'text-teal-700 hover:bg-teal-50'}`}
                      >
                        🖌️ Brush
                      </button>
                      <button
                        onClick={() => setMode('erase')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'erase' ? 'bg-red-500 text-white shadow' : 'text-red-700 hover:bg-red-50'}`}
                      >
                        🧹 Erase
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
                      className="px-4 py-2 bg-white text-red-600 rounded-full font-bold text-sm shadow-md border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      🗑️ Clear
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
                    <label className="block text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">
                      🎯 ¿Qué quieres cambiar?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="例: Add a cowboy hat, remove the sun, make it look like 80s anime..."
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
                        <span className="animate-spin">⏳</span> Procesando...
                      </span>
                    ) : (
                      '🚀 Generar Edición'
                    )}
                  </button>
                </>
              )}

              {!image && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-4">🖼️</div>
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
                <span>💾</span> Descargar Imagen
              </button>
            </div>
          )}

          {/* Reset */}
          {(editedImage || prompt || selectedTemplate) && (
            <div className="mt-2 flex justify-center">
              <button
                onClick={handleReset}
                className="py-2 px-4 text-orange-600 font-bold text-sm hover:underline"
              >
                🔄 Reiniciar
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