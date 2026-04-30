
import React, { useState, useRef, useEffect } from 'react';
import { ImageContent, AspectRatio, ImageSize, ImageStyle, LightingStyle } from '../types';
import { STUDIO_STYLES, LIGHTING_PRESETS } from '../constants';

interface ImageCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, aspectRatio: AspectRatio, style: ImageStyle, lighting: LightingStyle, embeddedText?: string, imageSize?: ImageSize, sourceImage?: string) => void;
  onEdit: (source: File | string, prompt: string, maskBase64?: string, style?: ImageStyle, system?: string) => void;
  isLoading: boolean;
  initialEditFile: File | null;
  initialEditUrl: string | null;
  history: ImageContent[];
}

interface CanvasObject {
    id: string;
    type: 'text' | 'drawing' | 'rect' | 'circle' | 'arrow';
    x: number;
    y: number;
    color: string;
    size: number;
    text?: string;
    opacity: number;
    points?: {x: number, y: number}[];
    isEraser?: boolean;
    width?: number; 
    height?: number;
    endX?: number;
    endY?: number;
}

const ASPECT_DIMENSIONS: Record<AspectRatio, string> = {
    '1:1': '1024 x 1024',
    '16:9': '1024 x 576',
    '9:16': '576 x 1024',
    '4:3': '1024 x 768',
    '3:4': '768 x 1024'
};

const ImageCreationModal: React.FC<ImageCreationModalProps> = ({ 
  isOpen, onClose, onGenerate, onEdit, isLoading, initialEditFile, initialEditUrl, history 
}) => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [embeddedText, setEmbeddedText] = useState('');
  const [canvasTextValue, setCanvasTextValue] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Enfoque educativo, sin texto decorativo, fondo limpio.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('none');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'move' | 'text' | 'brush' | 'mask' | 'eraser' | 'arrow' | 'rect' | 'circle'>('brush');
  const [activeColor, setActiveColor] = useState('#1e3a8a');
  
  const [brushSize, setBrushSize] = useState(40);
  const [maskSize, setMaskSize] = useState(80); 
  const [eraserSize, setEraserSize] = useState(40);
  const [textSize, setTextSize] = useState(80); 
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });
  const [showMask, setShowMask] = useState(true);

  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{x: number, y: number} | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProjectDirty, setIsProjectDirty] = useState(false);

  // Inicialización o cambio de archivo/URL externos
  useEffect(() => {
    if (isOpen) {
      if (initialEditFile) {
        handleFileSelect(initialEditFile);
      } else if (initialEditUrl) {
        handleUrlSelect(initialEditUrl);
      } else if (history.length > 0 && !previewUrl && !isProjectDirty) {
        if (mode === 'generate' && prompt === '') {
            handleUrlSelect(history[0].url);
        }
      }
    }
  }, [isOpen, initialEditFile, initialEditUrl]);

  // Sincronización con el historial de resultados de la IA
  useEffect(() => {
    if (history.length > 0 && isLoading === false) {
      const latestUrl = history[0].url;
      // Actualizamos solo si la imagen más reciente no es la que ya estamos viendo
      if (latestUrl !== previewUrl) {
        handleUrlSelect(latestUrl);
        setIsProjectDirty(false); // Reset dirty flag when we receive an AI result
      }
    }
  }, [history, isLoading]);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    resetEditorState();
    setMode('edit');
    setIsProjectDirty(true);
    // Reset file input value so selecting the same file again triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlSelect = (url: string) => {
    setPreviewUrl(url);
    resetEditorState();
    setIsProjectDirty(true);
  };

  const clearMask = () => {
    if (maskCanvasRef.current) {
        const mCtx = maskCanvasRef.current.getContext('2d');
        if (mCtx) {
            mCtx.globalCompositeOperation = 'source-over';
            mCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        }
    }
  };

  const resetEditorState = () => {
    setObjects([]);
    setSelectedObjectId(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setActiveTool('brush');
    setActiveColor('#1e3a8a');
    clearMask();
    
    if (canvasRef.current) {
        const cCtx = canvasRef.current.getContext('2d');
        if (cCtx) cCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleNewProject = () => {
      if (window.confirm('¿Deseas iniciar un nuevo proyecto? Se borrará todo el trabajo actual.')) {
          setPreviewUrl(null);
          setPrompt('');
          setEmbeddedText('');
          setCanvasTextValue('');
          setSelectedStyle('none');
          setAspectRatio('1:1');
          setImageSize('1K');
          resetEditorState();
          setMode('generate');
          setIsProjectDirty(false); 
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const initCanvases = () => {
    const img = imageRef.current;
    if (img && canvasRef.current && maskCanvasRef.current) {
        const w = img.naturalWidth || 1024;
        const h = img.naturalHeight || 1024;
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        maskCanvasRef.current.width = w;
        maskCanvasRef.current.height = h;
        renderCanvas();
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number, color: string, width: number) => {
    const headlen = width * 1.5; 
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(tox, toy);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    objects.forEach(obj => {
        ctx.globalAlpha = obj.opacity;
        ctx.globalCompositeOperation = obj.isEraser ? 'destination-out' : 'source-over';
        if (obj.type === 'drawing') {
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = obj.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            obj.points?.forEach((p, i) => i === 0 ? ctx.moveTo(obj.x + p.x, obj.y + p.y) : ctx.lineTo(obj.x + p.x, obj.y + p.y));
            ctx.stroke();
        } else if (obj.type === 'text') {
            ctx.fillStyle = obj.color;
            ctx.font = `bold ${obj.size}px sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText(obj.text || '', obj.x, obj.y);
            const metrics = ctx.measureText(obj.text || '');
            obj.width = metrics.width;
            obj.height = obj.size;
        } else if (obj.type === 'rect') {
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = obj.size / 4;
            ctx.strokeRect(obj.x, obj.y, (obj.endX || 0) - obj.x, (obj.endY || 0) - obj.y);
        } else if (obj.type === 'circle') {
            const radius = Math.sqrt(Math.pow((obj.endX || 0) - obj.x, 2) + Math.pow((obj.endY || 0) - obj.y, 2));
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = obj.size / 4;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (obj.type === 'arrow') {
            drawArrow(ctx, obj.x, obj.y, obj.endX || 0, obj.endY || 0, obj.color, obj.size / 4);
        }
    });

    ctx.globalCompositeOperation = 'source-over';
    if (isDrawing) {
        if (activeTool === 'brush' || activeTool === 'mask' || activeTool === 'eraser') {
            const isMasking = activeTool === 'mask' || (activeTool === 'eraser' && showMask);
            
            if (isMasking) {
                // If masking, we don't draw on the main canvas preview
                // but we could draw on the mask canvas directly if we wanted.
                // For now, let's keep the red preview on the main canvas if it's the mask tool.
                if (activeTool === 'mask') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = maskSize;
                } else {
                    // Eraser on mask
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.lineWidth = eraserSize;
                }
            } else {
                ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
                ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
                let size = activeTool === 'eraser' ? eraserSize : brushSize;
                ctx.lineWidth = size;
            }
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            currentPath.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.stroke();
        } else if (shapeStart && currentMousePos) {
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = brushSize / 4;
            if (activeTool === 'rect') {
                ctx.strokeRect(shapeStart.x, shapeStart.y, currentMousePos.x - shapeStart.x, currentMousePos.y - shapeStart.y);
            } else if (activeTool === 'circle') {
                const radius = Math.sqrt(Math.pow(currentMousePos.x - shapeStart.x, 2) + Math.pow(currentMousePos.y - shapeStart.y, 2));
                ctx.beginPath();
                ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (activeTool === 'arrow') {
                drawArrow(ctx, shapeStart.x, shapeStart.y, currentMousePos.x, currentMousePos.y, activeColor, brushSize / 4);
            }
        }
    }
  };

  useEffect(() => { renderCanvas(); }, [objects, isDrawing, currentPath, selectedObjectId, activeTool, brushSize, maskSize, eraserSize, shapeStart, currentMousePos]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      const pos = getPointerPos(e);
      setIsProjectDirty(true);
      if (activeTool === 'move') {
          const hit = [...objects].reverse().find(obj => {
              if (obj.type === 'text') {
                  return pos.x >= obj.x && pos.x <= obj.x + (obj.width || 0) &&
                         pos.y >= obj.y && pos.y <= obj.y + (obj.height || 0);
              } else {
                  if (obj.type === 'drawing') {
                      return obj.points?.some(p => Math.abs(pos.x - (obj.x + p.x)) < 15 && Math.abs(pos.y - (obj.y + p.y)) < 15);
                  }
                  return Math.abs(pos.x - obj.x) < 20 && Math.abs(pos.y - obj.y) < 20;
              }
          });
          if (hit) {
              setSelectedObjectId(hit.id);
              setDraggingObjectId(hit.id);
              setDragOffset({ x: pos.x - hit.x, y: pos.y - hit.y });
          } else {
              setSelectedObjectId(null);
              setIsPanning(true);
              const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
              const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
              setLastPanPos({ x: clientX, y: clientY });
          }
          return;
      }
      
      setIsDrawing(true);
      if (activeTool === 'brush' || activeTool === 'mask' || activeTool === 'eraser') {
          setCurrentPath([pos]);
      } else if (activeTool === 'text') {
          const txt = canvasTextValue.trim();
          if (txt) {
              const newObj: CanvasObject = { id: Date.now().toString(), type: 'text', x: pos.x, y: pos.y, color: activeColor, size: textSize, text: txt, opacity: 1 };
              setObjects(prev => [...prev, newObj]);
              setSelectedObjectId(newObj.id);
              setActiveTool('move');
              setCanvasTextValue(''); 
          }
      } else {
          setShapeStart(pos);
          setCurrentMousePos(pos);
      }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
      const pos = getPointerPos(e);
      if (isPanning) {
          const dx = clientX - lastPanPos.x;
          const dy = clientY - lastPanPos.y;
          setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
          setLastPanPos({ x: clientX, y: clientY });
          return;
      }
      if (draggingObjectId) {
          const diffX = pos.x - dragOffset.x - (objects.find(o => o.id === draggingObjectId)?.x || 0);
          const diffY = pos.y - dragOffset.y - (objects.find(o => o.id === draggingObjectId)?.y || 0);
          setObjects(prev => prev.map(obj => {
              if (obj.id === draggingObjectId) {
                  return { 
                      ...obj, 
                      x: pos.x - dragOffset.x, 
                      y: pos.y - dragOffset.y,
                      endX: obj.endX !== undefined ? obj.endX + diffX : undefined,
                      endY: obj.endY !== undefined ? obj.endY + diffY : undefined
                  };
              }
              return obj;
          }));
          return;
      }
      if (!isDrawing) return;
      if (activeTool === 'brush' || activeTool === 'mask' || activeTool === 'eraser') {
          setCurrentPath(prev => [...prev, pos]);
      } else {
          setCurrentMousePos(pos);
      }
  };

  const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingObjectId(null);
      if (isDrawing) {
          if (activeTool === 'brush' || (activeTool as string) === 'eraser') {
              setObjects(prev => [...prev, { id: Date.now().toString(), type: 'drawing', x: 0, y: 0, color: activeTool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor, size: activeTool === 'eraser' ? eraserSize : brushSize, points: currentPath, opacity: 1, isEraser: activeTool === 'eraser' }]);
          } 
          if (activeTool === 'mask' || ((activeTool as string) === 'eraser' && showMask)) {
              const mCtx = maskCanvasRef.current?.getContext('2d');
              if (mCtx) {
                  mCtx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
                  mCtx.strokeStyle = '#FF0000';
                  mCtx.lineWidth = activeTool === 'eraser' ? eraserSize : maskSize;
                  mCtx.lineCap = 'round'; mCtx.lineJoin = 'round';
                  mCtx.beginPath();
                  currentPath.forEach((p, i) => i === 0 ? mCtx.moveTo(p.x, p.y) : mCtx.lineTo(p.x, p.y));
                  mCtx.stroke();
                  mCtx.globalCompositeOperation = 'source-over'; // Reset
              }
          } else if (shapeStart && currentMousePos && (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'arrow')) {
              setObjects(prev => [...prev, { 
                  id: Date.now().toString(), 
                  type: activeTool as any, 
                  x: shapeStart.x, 
                  y: shapeStart.y, 
                  endX: currentMousePos.x, 
                  endY: currentMousePos.y, 
                  color: activeColor, 
                  size: brushSize, 
                  opacity: 1 
              }]);
          }
          setIsDrawing(false);
          setCurrentPath([]);
          setShapeStart(null);
          setCurrentMousePos(null);
      }
  };

  const generateBinaryMask = (): string | undefined => {
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return undefined;
      const mCtx = mCanvas.getContext('2d');
      if (!mCtx) return undefined;
      const imgData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height);
      const data = imgData.data;
      let hasPixels = false;
      for (let i = 0; i < data.length; i += 4) {
          if (data[i+3] > 0) { hasPixels = true; break; }
      }
      if (!hasPixels) return undefined;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = mCanvas.width;
      tempCanvas.height = mCanvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return undefined;
      tCtx.fillStyle = 'black';
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tCtx.globalCompositeOperation = 'source-over';
      tCtx.drawImage(mCanvas, 0, 0); 
      const tempImgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const tempData = tempImgData.data;
      for (let i = 0; i < tempData.length; i += 4) {
          if (tempData[i+3] > 0 && (tempData[i] > 0 || tempData[i+1] > 0 || tempData[i+2] > 0)) {
              tempData[i] = 255; tempData[i+1] = 255; tempData[i+2] = 255; tempData[i+3] = 255;
          }
      }
      tCtx.putImageData(tempImgData, 0, 0);
      return tempCanvas.toDataURL('image/png');
  };

  const getFlattenedComposition = (): string | null => {
      const final = document.createElement('canvas');
      const img = imageRef.current;
      
      // Si no hay imagen de fondo, usamos un lienzo blanco basado en el aspect ratio
      if (!img) {
          const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
          final.width = 1024;
          final.height = (1024 / wRatio) * hRatio;
          const ctx = final.getContext('2d');
          if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, final.width, final.height);
              drawObjectsOnCanvas(ctx);
              return final.toDataURL();
          }
          return null;
      }

      final.width = img.naturalWidth; 
      final.height = img.naturalHeight;
      const ctx = final.getContext('2d');
      if (ctx) {
          ctx.drawImage(img, 0, 0);
          drawObjectsOnCanvas(ctx);
          return final.toDataURL();
      }
      return null;
  };

  const drawObjectsOnCanvas = (ctx: CanvasRenderingContext2D) => {
      objects.forEach(obj => {
          ctx.globalAlpha = obj.opacity;
          ctx.globalCompositeOperation = obj.isEraser ? 'destination-out' : 'source-over';
          if (obj.type === 'drawing') {
              ctx.strokeStyle = obj.color; ctx.lineWidth = obj.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
              ctx.beginPath();
              obj.points?.forEach((p, i) => i === 0 ? ctx.moveTo(obj.x + p.x, obj.y + p.y) : ctx.lineTo(obj.x + p.x, obj.y + p.y));
              ctx.stroke();
          } else if (obj.type === 'text') {
              ctx.fillStyle = obj.color; ctx.font = `bold ${obj.size}px sans-serif`; ctx.textBaseline = 'top';
              ctx.fillText(obj.text || '', obj.x, obj.y);
          } else if (obj.type === 'rect') {
              ctx.strokeStyle = obj.color; ctx.lineWidth = obj.size / 4;
              ctx.strokeRect(obj.x, obj.y, (obj.endX || 0) - obj.x, (obj.endY || 0) - obj.y);
          } else if (obj.type === 'circle') {
              const radius = Math.sqrt(Math.pow((obj.endX || 0) - obj.x, 2) + Math.pow((obj.endY || 0) - obj.y, 2));
              ctx.strokeStyle = obj.color; ctx.lineWidth = obj.size / 4;
              ctx.beginPath(); ctx.arc(obj.x, obj.y, radius, 0, 2 * Math.PI); ctx.stroke();
          } else if (obj.type === 'arrow') {
              drawArrow(ctx, obj.x, obj.y, obj.endX || 0, obj.endY || 0, obj.color, obj.size / 4);
          }
      });
  };

  const handleApplyChanges = () => {
    const finalPrompt = prompt.trim();
    if (!finalPrompt && mode === 'generate') {
        alert("Por favor escribe qué quieres generar.");
        return;
    }
    
    // Si estamos en modo generar pero hay dibujos en el lienzo, enviamos el boceto como base
    const hasDrawings = objects.length > 0;
    const sketchData = hasDrawings ? getFlattenedComposition() : null;

    try {
        if (mode === 'generate') {
          onGenerate(finalPrompt || "Imagen", aspectRatio, selectedStyle, 'none', embeddedText, imageSize, sketchData || undefined);
        } else {
          const flattened = getFlattenedComposition();
          const maskData = generateBinaryMask();
          if (flattened) {
              onEdit(flattened, finalPrompt || "Editar imagen", maskData, selectedStyle, systemPrompt);
          } else {
              alert("Error al procesar la composición de la imagen.");
          }
        }
    } catch (err) {
        console.error("Apply changes failed:", err);
        alert("Ocurrió un error al enviar los cambios a la IA.");
    }
  };

  const handleUndo = () => {
      if (objects.length > 0) {
        setObjects(prev => prev.slice(0, -1));
        setTimeout(renderCanvas, 10);
      }
  };

  const handleDeleteObject = () => {
    if (selectedObjectId) {
      setObjects(prev => prev.filter(obj => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
      setTimeout(renderCanvas, 10);
    }
  };

  const handleSave = () => {
    const dataUrl = getFlattenedComposition();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `techie-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDynamicSizeSlider = () => {
      let label = "Grosor"; let val = brushSize; let min = 2, max = 200;
      let setter = (v: number) => setBrushSize(v);
      if (activeTool === 'text') { label = "Tamaño T"; val = textSize; min = 10; max = 500; setter = (v: number) => setTextSize(v); }
      else if (activeTool === 'mask') { label = "Grosor M"; val = maskSize; min = 2; max = 400; setter = (v: number) => setMaskSize(v); }
      else if (activeTool === 'eraser') { label = "Grosor B"; val = eraserSize; min = 2; max = 300; setter = (v: number) => setEraserSize(v); }
      else if (activeTool === 'move') return null;
      return (
          <div className="flex flex-col w-full">
              <div className="flex justify-between text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                  <span>{label}</span><span>{val}px</span>
              </div>
              <input type="range" min={min} max={max} value={val} onChange={(e) => setter(parseInt(e.target.value))} className="w-full accent-blue-900 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>
      );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col md:flex-row overflow-hidden font-sans text-blue-900">
        <div className="flex-1 bg-white relative flex items-center justify-center p-2 md:p-6 overflow-hidden select-none order-first md:order-last border-b md:border-b-0 md:border-l border-gray-100">
            <div className="absolute top-4 left-4 z-40 max-w-[200px] pointer-events-none">
                <div className="bg-blue-900/95 text-[10px] text-blue-100 p-3 rounded-lg border border-white/20 shadow-2xl backdrop-blur-md font-mono">
                    <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="font-bold uppercase tracking-widest text-[8px]">Techie Arte ✨</span>
                    </div>
                    <div className="space-y-1.5">
                        <p><span className="text-blue-300">MODO:</span> {mode.toUpperCase()}</p>
                        <p><span className="text-blue-300">ESTILO:</span> {STUDIO_STYLES[selectedStyle].label.toUpperCase()}</p>
                        <p className="truncate"><span className="text-blue-300">IDEA:</span> {prompt || 'ESPERANDO...'}</p>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-1 flex flex-col gap-1">
                    <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-blue-900 font-black text-lg">+</button>
                    <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-blue-900 font-black text-lg">-</button>
                    <button onClick={handleUndo} title="Deshacer" disabled={objects.length === 0} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-blue-900 font-black text-lg disabled:opacity-30">⟲</button>
                    <button onClick={clearMask} title="Borrar Máscara" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 font-black text-sm">×</button>
                </div>
            </div>

            <div className="relative transition-transform duration-100" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-blue-900 font-black text-[10px] tracking-widest uppercase bg-white px-4 py-2 rounded-full shadow-md">IA PROCESANDO...</p>
                    </div>
                )}
                <div className={`relative shadow-xl rounded-2xl overflow-hidden bg-white border-4 border-white ${activeTool === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`} style={{ 
                    minWidth: previewUrl ? 'auto' : '512px',
                    minHeight: previewUrl ? 'auto' : '512px',
                }}>
                    {previewUrl ? (
                        <img ref={imageRef} src={previewUrl} className="max-w-[90vw] max-h-[35vh] md:max-h-[75vh] block object-contain" onLoad={initCanvases} referrerPolicy="no-referrer" />
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-8 border-4 border-dashed border-gray-100 rounded-[2rem] bg-white cursor-pointer hover:border-blue-200 transition-all group aspect-square">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-200 group-hover:text-blue-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Empieza a dibujar o<br/>toca aquí para subir tu dibujo</p>
                        </div>
                    )}
                    <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="absolute top-0 left-0 w-full h-full z-10" />
                    <canvas ref={maskCanvasRef} className={`absolute top-0 left-0 w-full h-full z-20 pointer-events-none mix-blend-screen transition-opacity ${showMask ? 'opacity-50' : 'opacity-0'}`} />
                </div>
            </div>
        </div>

        <div className="w-full md:w-80 bg-white flex flex-col p-4 md:p-6 overflow-y-auto shrink-0 z-20 shadow-lg order-last md:order-first border-t md:border-t-0 md:border-r border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <img src="https://catalizia.com/wp-content/uploads/2025/10/cropped-CatalizIA-logo-horizontal-sin-dot-com-scaled-1-313x100.png" className="h-6 md:h-8" referrerPolicy="no-referrer" />
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">✕</button>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button onClick={() => setMode('generate')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg ${mode === 'generate' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400'}`}>CREAR</button>
                <button onClick={() => setMode('edit')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg ${mode === 'edit' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400'}`}>EDITAR</button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">¿Qué quieres dibujar hoy?</label>
                    <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder="Ej: Un perrito astronauta volando en el espacio..." className="w-full p-3 rounded-xl border border-gray-200 text-xs h-16 bg-white resize-none focus:ring-2 focus:ring-blue-900 focus:outline-none" />
                </div>
                
                {mode === 'generate' && (
                  <div className="space-y-4 border-b border-gray-100 pb-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tamaño de tu Lienzo</label>
                        <div className="grid grid-cols-1 gap-2">
                            {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`p-2 border rounded-xl transition-all text-left flex justify-between items-center ${aspectRatio === ratio ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-white text-blue-900 border-gray-200 hover:bg-gray-50'}`}>
                                    <span className="font-black text-xs">{ratio}</span>
                                    <span className={`text-[9px] font-mono opacity-60 ${aspectRatio === ratio ? 'text-white' : 'text-gray-500'}`}>{ASPECT_DIMENSIONS[ratio]} px</span>
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">¿Cómo quieres que se vea? (Estilo)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {Object.keys(STUDIO_STYLES).map((s) => (
                            <button key={s} onClick={() => setSelectedStyle(s as any)} className={`px-2 py-2 rounded-lg text-[9px] font-black border truncate transition-all ${selectedStyle === s ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-gray-100 hover:border-blue-200'}`}>{STUDIO_STYLES[s].label.toUpperCase()}</button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 border-t pt-4">
                    <button title="Mover" onClick={()=>setActiveTool('move')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='move'?'bg-blue-900 text-white border-blue-900':'bg-white border-gray-100 hover:bg-gray-50'}`}>✋</button>
                    <button title="Texto" onClick={()=>setActiveTool('text')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='text'?'bg-blue-900 text-white border-blue-900':'bg-white border-gray-100 hover:bg-gray-50'}`}>T</button>
                    <button title="Pincel" onClick={()=>setActiveTool('brush')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='brush'?'bg-blue-900 text-white border-blue-900':'bg-white border-gray-100 hover:bg-gray-50'}`}>🎨</button>
                    <button title="Borrador" onClick={()=>setActiveTool('eraser')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='eraser'?'bg-gray-800 text-white border-gray-800':'bg-white border-gray-100 hover:bg-gray-50'}`}>🧹</button>
                    <button title="Flecha" onClick={()=>setActiveTool('arrow')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='arrow'?'bg-blue-900 text-white border-blue-900':'bg-white border-gray-100 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 11l5-5-5-5M17 11l5-5-5-5"/></svg>
                    </button>
                    <button title="Rectángulo" onClick={()=>setActiveTool('rect')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='rect'?'bg-blue-900 text-white border-blue-900':'bg-white border-gray-100 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3z"/></svg>
                    </button>
                    <button title="Círculo" onClick={()=>setActiveTool('circle')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='circle'?'bg-blue-900 text-white border-blue-900':'bg-white border-gray-100 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
                    </button>
                    <button title="Máscara" onClick={()=>setActiveTool('mask')} className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${activeTool==='mask'?'bg-red-600 text-white border-red-600':'bg-white border-gray-100 hover:bg-gray-50'}`}>🎭</button>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                        <input type="color" value={activeColor} title="Color de herramienta" onChange={(e)=>setActiveColor(e.target.value)} className="w-8 h-8 cursor-pointer rounded bg-transparent" />
                        {renderDynamicSizeSlider()}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={canvasTextValue} onChange={(e)=>setCanvasTextValue(e.target.value)} placeholder="Texto para el lienzo..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-blue-900 outline-none" />
                        <div className="flex gap-1">
                            <button onClick={handleDeleteObject} disabled={!selectedObjectId} title="Eliminar seleccionado" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <button onClick={handleUndo} disabled={objects.length === 0} title="Deshacer último trazo" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 disabled:opacity-30">⟲</button>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-900 transition-colors py-2">
                        <span>Ajustes de Mago 🧙‍♂️</span>
                        <span>{showAdvanced ? '−' : '+'}</span>
                    </button>
                    {showAdvanced && (
                        <div className="mt-2 space-y-2 animate-fade-in">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Hechizos Secretos ✨</label>
                            <textarea value={systemPrompt} onChange={(e)=>setSystemPrompt(e.target.value)} placeholder="Instrucciones persistentes para la IA..." className="w-full p-2.5 rounded-lg border border-gray-200 text-[10px] h-20 bg-gray-50 resize-none focus:bg-white focus:ring-1 focus:ring-blue-900 outline-none font-mono" />
                        </div>
                    )}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <button onClick={handleApplyChanges} disabled={isLoading} className="w-full py-3.5 font-black rounded-xl shadow-lg bg-blue-900 text-white uppercase tracking-widest text-[11px] hover:bg-black transition-colors disabled:bg-gray-300">
                      {mode === 'generate' ? (objects.length > 0 ? '¡QUE SE HAGA LA MAGIA! 🪄' : 'CREAR MAGIA') : 'MEJORAR DIBUJO'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-white text-blue-900 font-black rounded-xl border border-blue-900/10 text-[9px] uppercase hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            TRAER DIBUJO 📂
                        </button>
                        <button onClick={handleSave} className="py-2.5 bg-white text-blue-900 font-black rounded-xl border border-blue-900/10 text-[9px] uppercase hover:bg-blue-50 transition-colors">GUARDAR ARTE 🖼️</button>
                    </div>
                    <button onClick={handleNewProject} className="py-2.5 bg-gray-100 text-gray-600 font-black rounded-xl text-[9px] uppercase hover:bg-gray-200 transition-colors">LIMPIAR LIENZO 🧼</button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} />
                </div>
            </div>
        </div>
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
        `}</style>
    </div>
  );
};

export default ImageCreationModal;
