import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Database, 
  Save, 
  Sparkles,
  Info,
  Wand2,
  FileText,
  X,
  History,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { saveGPT, subscribeToGPTs, deleteGPT } from '../lib/db';

export function GPTsGenerator({ onClose, onSelect, theme }: { onClose: () => void, onSelect: (gpt: any) => void, theme: 'light' | 'dark' }) {
  const { user, profile } = useAuth();
  const [currentGptId, setCurrentGptId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewInput, setPreviewInput] = useState('');
  const [previewResponse, setPreviewResponse] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [savedGPTs, setSavedGPTs] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToGPTs(user.uid, (gpts) => {
      // Deduplicate by ID to prevent key collisions
      const uniqueGpts = Array.from(new Map(gpts.map(g => [g.id, g])).values());
      setSavedGPTs(uniqueGpts.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user || !name) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const gptData = {
        id: currentGptId,
        name,
        description,
        instructions,
        isPublic: isAdmin ? isPublic : false,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      };
      const id = await saveGPT(user.uid, gptData);
      if (id) { setCurrentGptId(id); setSaveStatus('saved'); }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleNew = () => {
    setCurrentGptId(null);
    setName('');
    setDescription('');
    setInstructions('');
    setIsPublic(false);
    setFiles([]);
  };

  const loadGPT = (gpt: any) => {
    setCurrentGptId(gpt.id);
    setName(gpt.name);
    setDescription(gpt.description || '');
    setInstructions(gpt.instructions || '');
    setIsPublic(gpt.isPublic || false);
    setFiles(gpt.files || []);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user || !window.confirm("Delete this GPT?")) return;
    await deleteGPT(user.uid, id);
    if (currentGptId === id) handleNew();
  };

  const GPTCard = ({ gpt }: { gpt: any }) => (
    <button 
      onClick={() => loadGPT(gpt)}
      className={cn("w-full p-4 rounded-2xl border text-left transition-all group relative",
        currentGptId === gpt.id 
          ? (theme === 'dark' ? 'bg-blue-600/20 border-blue-600/50 text-white' : 'bg-blue-600/10 border-blue-600/30 text-blue-600 shadow-lg') 
          : (theme === 'dark' ? 'bg-white/2 border-white/5 text-slate-400 hover:bg-white/5' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white shadow-sm hover:shadow-md')
      )}
    >
      <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-black tracking-tight">{gpt.name}</p>
            {gpt.isPublic && (
              <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Shared</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(gpt);
              }}
              className="p-1 text-blue-500 hover:text-blue-400 transition-all"
              title="Use this GPT"
            >
                <Sparkles size={14} />
            </button>
            {(gpt.userId === user?.uid || profile?.role === 'super-admin') && (
              <button 
                onClick={(e) => handleDelete(e, gpt.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all"
              >
                  <Trash2 size={14} />
              </button>
            )}
          </div>
      </div>
      <p className="text-[10px] opacity-60 line-clamp-2 leading-relaxed font-medium">{gpt.description || 'No description provided'}</p>
    </button>
  );



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    
    let processed = 0;
    const newFiles: any[] = [];

    uploadedFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          type: f.type,
          size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
          date: new Date().toLocaleDateString(),
          // Read text content for text-based files so it can be injected into instructions
          content: (f.type === 'text/plain' || f.name.endsWith('.txt') || f.name.endsWith('.md'))
            ? (ev.target?.result as string || '').slice(0, 8000)
            : undefined
        });
        processed++;
        if (processed === uploadedFiles.length) {
          setFiles(prev => [...prev, ...newFiles]);
          setIsProcessing(false);
        }
      };
      reader.onerror = () => { processed++; if (processed === uploadedFiles.length) setIsProcessing(false); };
      reader.readAsText(f);
    });
  };

  const handlePreviewSend = async () => {
    if (!previewInput.trim() || isPreviewLoading) return;
    setIsPreviewLoading(true);
    setPreviewResponse('');
    const userMsg = previewInput;
    setPreviewInput('');
    try {
      // Build instructions from GPT config + any text file content
      const fileContext = files
        .filter(f => f.content)
        .map(f => `--- ${f.name} ---\n${f.content}`)
        .join('\n\n');
      const fullInstructions = [instructions, fileContext].filter(Boolean).join('\n\n---\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{ role: 'user', content: userMsg }],
          instructions: fullInstructions || null,
          temperature: 0.7,
          maxTokens: 800,
        })
      });
      const data = await res.json();
      setPreviewResponse(data.choices?.[0]?.message?.content || data.error || 'Sin respuesta');
    } catch (e: any) {
      setPreviewResponse('Error al conectar: ' + e.message);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col h-full transition-colors duration-500 relative z-50",
      theme === 'dark' ? "bg-corporate-950 text-slate-200" : "bg-white text-corporate-900"
    )}>
      <header className={cn("h-16 border-b flex items-center justify-between px-6 shrink-0 backdrop-blur-xl",
        theme === 'dark' ? "bg-corporate-950/80 border-white/5" : "bg-white/80 border-corporate-200 shadow-sm"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Sparkles size={18} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest leading-none">
            Corporate <span className="text-blue-500">GPTs</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleNew}
            className={cn("flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              theme === 'dark' ? "bg-white/5 border-white/5 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
             <Plus size={14} /> Create New
          </button>
          <button 
            disabled={!name || isSaving}
            onClick={handleSave}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl",
              saveStatus === 'saved' ? "bg-emerald-500 text-white shadow-emerald-500/20" :
              saveStatus === 'error' ? "bg-red-500 text-white shadow-red-500/20" :
              name ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20" : "bg-slate-500/10 text-slate-500 cursor-not-allowed shadow-none"
            )}
          >
            {isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Guardando...' : saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'error' ? '✗ Error' : (currentGptId ? 'Update GPT' : 'Save GPT')}
          </button>
          <button 
            type="button"
            id="close-knowledge-bank"
            onClick={() => onClose()} 
            className="absolute top-4 right-6 p-2 text-slate-400 hover:text-red-500 transition-colors z-[100] bg-white/5 rounded-full"
            title="Return to Chat"
          >
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden overflow-y-auto lg:overflow-hidden">
        {/* Sidebar for History/Selection */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={cn("border-r flex flex-col shrink-0 transition-all",
                theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-100 shadow-xl z-20"
              )}
            >
              <div className="p-6 border-b border-inherit flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Database size={14} /> Available GPTs
                 </h3>
                 <span className="text-[10px] font-black bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded-full">{savedGPTs.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {/* Public GPTs Section */}
                 {savedGPTs.some(g => g.isPublic) && (
                   <div className="space-y-3">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Enterprise Shared</p>
                     <div className="space-y-1">
                       {savedGPTs.filter(g => g.isPublic).map(gpt => (
                         <GPTCard key={gpt.id} gpt={gpt} />
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Private GPTs Section */}
                 {savedGPTs.some(g => !g.isPublic) && (
                   <div className="space-y-3">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Your Personas</p>
                     <div className="space-y-1">
                       {savedGPTs.filter(g => !g.isPublic).map(gpt => (
                         <GPTCard key={gpt.id} gpt={gpt} />
                       ))}
                     </div>
                   </div>
                 )}
                 {savedGPTs.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", theme === 'dark' ? "bg-white/5 text-slate-700" : "bg-slate-100 text-slate-300")}>
                         <Database size={24} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No GPTs saved yet</p>
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Side */}
        <div className={cn("flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8 space-y-10 transition-all",
          theme === 'dark' ? "bg-slate-900 shadow-inner" : "bg-slate-100/30"
        )}>
          
          <div className="space-y-4 max-w-2xl mx-auto w-full">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Sparkles size={16} className="text-blue-500" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
                     {currentGptId ? 'Edit GPT' : 'New GPT'}
                   </h3>
                </div>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={cn("p-2 rounded-lg transition-all", showHistory ? "text-blue-500 bg-blue-500/10" : "text-slate-500 hover:text-blue-600 bg-white/5 shadow-sm border border-slate-200")}
                >
                   <History size={18} />
                </button>
             </div>
             
             <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Name</label>
                   <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Assign a name to your GPT"
                    className={cn("w-full border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400",
                      theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    )}
                   />
                </div>

                {/* Description */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                   <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your GPT and what it does"
                    rows={2}
                    className={cn("w-full border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 resize-none",
                      theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    )}
                   />
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between ml-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         Instructions <Info size={12} className="text-slate-400" />
                      </label>
                   </div>
                   <div className="relative group">
                      <textarea 
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Example: You are a horticulturist with experience in natural turf..."
                        rows={6}
                        className={cn("w-full border rounded-3xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 resize-none",
                          theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                        )}
                      />
                   </div>
                </div>

                {/* Knowledge */}
                <div className="space-y-4">
                   {isAdmin && (
                     <div className={cn("p-6 rounded-3xl border flex items-center justify-between",
                       theme === 'dark' ? "bg-white/5 border-white/5 shadow-xl" : "bg-blue-50/50 border-blue-100 shadow-sm"
                     )}>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                              <ShieldCheck size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-0.5">Enterprise Availability</p>
                              <p className="text-xs font-bold text-slate-500">Make this persona global for all company users.</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setIsPublic(!isPublic)}
                          className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            isPublic ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-600/10" : "bg-slate-200 text-slate-400"
                          )}
                        >
                           {isPublic ? 'GLOBAL ACTIVE' : 'PRIVATE'}
                        </button>
                     </div>
                   )}

                   <div className="flex items-center justify-between px-2 border-t border-inherit pt-6">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         Knowledge Base <Info size={12} className="text-slate-400" />
                      </label>
                      <label className="flex items-center gap-2 text-[10px] font-black text-blue-500 cursor-pointer hover:text-blue-400">
                         <Plus size={14} /> Add files
                         <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                      </label>
                   </div>
                   
                   <div className="grid gap-3">
                      {files.map(f => (
                        <div key={f.id} className={cn("flex items-center justify-between p-4 rounded-2xl border group transition-all",
                          theme === 'dark' ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-white border-slate-100 hover:border-blue-200 shadow-sm"
                        )}>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <FileText size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold">{f.name}</p>
                                 <p className="text-[10px] font-black text-slate-500 uppercase mt-1">{f.size}</p>
                              </div>
                           </div>
                           <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                      {files.length === 0 && (
                        <div className="py-10 text-center border-2 border-dashed border-inherit rounded-3xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No expert context added</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className={cn("w-full lg:w-1/3 flex flex-col shrink-0 transition-all border-t lg:border-t-0 lg:border-l",
          theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)] border-slate-100"
        )}>
           <header className={cn("h-14 border-b flex items-center px-8 transition-all hidden lg:flex",
             theme === 'dark' ? "bg-slate-950/50 border-white/5 text-slate-500" : "bg-slate-50/50 border-slate-100 text-slate-400"
           )}>
              <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
           </header>
           
           <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
              <AnimatePresence mode="wait">
                 {!name ? (
                    <motion.div 
                     key="empty"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="flex flex-col items-center gap-6 text-center"
                    >
                       <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center", theme === 'dark' ? "bg-white/5 text-slate-700" : "bg-slate-50 text-slate-200")}>
                          <Sparkles size={40} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 max-w-[200px] leading-relaxed uppercase tracking-[0.2em]">
                          Assign a name to start preview
                       </p>
                    </motion.div>
                 ) : (
                    <motion.div 
                     key="chat"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="w-full h-full flex flex-col pt-12"
                    >
                       <div className="flex-1 flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                             <Sparkles size={44} />
                          </div>
                          <div className="text-center">
                            <h3 className="text-2xl font-black tracking-tight">{name}</h3>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">{description || 'Ready for action'}</p>
                          </div>
                          <button 
                            onClick={() => onSelect({ id: currentGptId, name, description, instructions, files })}
                            className="mt-4 px-10 py-4 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all flex items-center gap-3"
                          >
                             <Sparkles size={18} /> Use this GPT
                          </button>
                       </div>

                       <div className="mt-auto w-full max-w-2xl mx-auto space-y-4">
                          <div className="relative">
                             <input 
                               type="text"
                               value={previewInput}
                               onChange={(e) => setPreviewInput(e.target.value)}
                               placeholder={`Ask ${name}...`}
                               className={cn("w-full border rounded-[2.5rem] py-6 px-10 text-sm font-bold shadow-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all",
                                 theme === 'dark' ? "bg-white/5 border-white/5 text-white placeholder:text-slate-700" : "bg-white border-slate-100 text-slate-900 placeholder:text-slate-400"
                               )}
                             />
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}

