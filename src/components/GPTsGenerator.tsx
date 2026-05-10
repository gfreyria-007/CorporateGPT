import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  Database, 
  Save, 
  Sparkles,
  Info,
  Wand2,
  FileText,
  X,
  History,
  Send,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { saveGPT, subscribeToGPTs, deleteGPT } from '../lib/db';
import { processDocuments, ProcessedFile, createRAGContext } from '../lib/secureDocumentHandler';

export function GPTsGenerator({ onClose, onSelect, theme, isMobile = false }: { onClose: () => void, onSelect: (gpt: any) => void, theme: 'light' | 'dark', isMobile?: boolean }) {
  const { user, profile } = useAuth();
  const [currentGptId, setCurrentGptId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [visibility, setVisibility] = useState<'personal' | 'company'>('personal');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewInput, setPreviewInput] = useState('');
  const [previewResponse, setPreviewResponse] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [savedGPTs, setSavedGPTs] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';
  const companyId = profile?.companyId;
  const canCreateCompanyGPT = isAdmin && companyId;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToGPTs(user.uid, (gpts) => {
      const uniqueGpts = Array.from(new Map(gpts.map(g => [g.id, g])).values());
      setSavedGPTs(uniqueGpts.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)));
    }, companyId);
    return () => unsubscribe();
  }, [user, companyId]);

const handleSave = async () => {
    if (!user || !name) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const gptData: any = {
        ...(currentGptId && { id: currentGptId }),
        name: name || '',
        description: description || '',
        instructions: instructions || '',
        isPublic: isAdmin ? isPublic : false,
        visibility: visibility,
        companyId: visibility === 'company' ? companyId : null,
        files: files.map(f => ({ 
          name: f.name || '', 
          size: f.size || '', 
          type: f.type || '',
          content: f.content || null
        }))
      };
      
      Object.keys(gptData).forEach(key => gptData[key] === undefined && delete gptData[key]);
      
      const savePromise = saveGPT(user.uid, gptData, visibility === 'company' ? companyId : undefined);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout saving GPT")), 10000));
      
      const id = await Promise.race([savePromise, timeoutPromise]) as string;
      if (id) { 
        setCurrentGptId(id); 
        setSaveStatus('saved'); 
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
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
    setVisibility('personal');
    setFiles([]);
  };

  const loadGPT = (gpt: any) => {
    setCurrentGptId(gpt.id);
    setName(gpt.name);
    setDescription(gpt.description || '');
    setInstructions(gpt.instructions || '');
    setIsPublic(gpt.isPublic || false);
    setVisibility(gpt.visibility || 'personal');
    setFiles(gpt.files || []);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user || !window.confirm("Delete this GPT?")) return;
    await deleteGPT(user.uid, id);
    if (currentGptId === id) handleNew();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    
    try {
      const processedFiles = await processDocuments(uploadedFiles);
      setFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('File processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreviewSend = async () => {
    if (!user || !previewInput.trim() || isPreviewLoading) return;
    setIsPreviewLoading(true);
    setPreviewResponse('');
    const userMsg = previewInput;
    setPreviewInput('');
    try {
      // Get ID token for authentication
      const idToken = await user.getIdToken();
      
      // Use secure RAG context - only includes safe, parsed content
      const fileContext = createRAGContext(files);
      const fullInstructions = [instructions, fileContext].filter(Boolean).join('\n\n---\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{ role: 'user', content: userMsg }],
          instructions: fullInstructions || null,
          temperature: 0.7,
          maxTokens: 800,
          docsOnly: files.length > 0 // Enable document context mode
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

  const GPTCard = ({ gpt }: { gpt: any }) => {
    const isCompanyGPT = gpt.visibility === 'company' && gpt.companyId;
    const canDelete = gpt.userId === user?.uid || profile?.role === 'super-admin';
    return (
    <button 
      onClick={() => loadGPT(gpt)}
      className={cn("w-full p-4 rounded-2xl border text-left transition-all group relative",
        currentGptId === gpt.id 
          ? (theme === 'dark' ? 'bg-blue-600/20 border-blue-600/50 text-white' : 'bg-blue-600/10 border-blue-600/30 text-blue-600 shadow-lg') 
          : (theme === 'dark' ? 'bg-white/2 border-white/5 text-slate-400 hover:bg-white/5' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white shadow-sm hover:shadow-md')
      )}
    >
      <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-black tracking-tight">{gpt.name}</p>
            {gpt.isPublic && (
              <span className="text-[7px] font-black bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Global</span>
            )}
            {isCompanyGPT && (
              <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Company</span>
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
            {canDelete && (
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
};

  return (
    <div className={cn("flex-1 flex flex-col h-full transition-colors duration-500 relative z-50",
      theme === 'dark' ? "bg-corporate-950 text-slate-200" : "bg-white text-corporate-900"
    )}>
      <header className={cn("h-16 border-b flex flex-col sm:flex-row items-center justify-between px-2 sm:px-6 py-2 sm:py-0 shrink-0 backdrop-blur-xl gap-2",
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
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-wrap justify-end max-w-full overflow-x-auto">
          <button 
            onClick={handleNew}
            className={cn("flex items-center gap-2 px-2 sm:px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
              theme === 'dark' ? "bg-white/5 border-white/5 text-slate-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
             <Plus size={14} /> <span className="hidden sm:inline">Create New</span>
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
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Guardando...' : saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'error' ? '✗ Error' : (currentGptId ? 'Update GPT' : 'Save GPT')}
          </button>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white/5 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden overflow-y-auto lg:overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={cn("border-r flex flex-col shrink-0 w-full lg:w-80 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-auto",
                theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-100 shadow-xl z-20"
              )}
            >
              <div className="p-6 border-b border-inherit flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Database size={14} /> Available GPTs
                 </h3>
                 <span className="text-[10px] font-black bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded-full">{savedGPTs.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {savedGPTs.map(gpt => (
                   <GPTCard key={gpt.id} gpt={gpt} />
                 ))}
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

        {/* Editor */}
        <div className={cn("flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 transition-all",
          theme === 'dark' ? "bg-slate-900 shadow-inner" : "bg-slate-100/30"
        )}>
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
                    {currentGptId ? 'Edit GPT' : 'New GPT'}
                  </h3>
               </div>
               <button 
                 onClick={() => setShowHistory(!showHistory)}
                 className={cn("p-2 rounded-lg transition-all", showHistory ? "text-blue-500 bg-blue-500/10" : "text-slate-500 hover:text-blue-600 bg-white shadow-sm border border-slate-200")}
               >
                  <History size={18} />
               </button>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Name</label>
                  <input 
                   type="text" value={name} onChange={(e) => setName(e.target.value)}
                   className={cn("w-full border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all",
                     theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 shadow-sm"
                   )}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                  <textarea 
                   value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                   className={cn("w-full border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none",
                     theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 shadow-sm"
                   )}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Instructions</label>
                  <textarea 
                    value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={6}
                    className={cn("w-full border rounded-3xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none",
                      theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-200 shadow-sm"
                    )}
                  />
               </div>

{isAdmin && (
                  <div className={cn("p-6 rounded-3xl border flex items-center justify-between",
                    theme === 'dark' ? "bg-white/5 border-white/5 shadow-xl" : "bg-white border-slate-100 shadow-sm"
                  )}>
                     <div className="flex items-center gap-4">
                        <ShieldCheck size={20} className="text-blue-600" />
                        <div>
                           <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Enterprise Availability</p>
                           <p className="text-xs font-bold text-slate-500">Make this global for all users.</p>
                        </div>
                     </div>
                     <button onClick={() => setIsPublic(!isPublic)} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", isPublic ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400")}>
                        {isPublic ? 'GLOBAL ACTIVE' : 'PRIVATE'}
                     </button>
                  </div>
                )}

                {canCreateCompanyGPT && (
                  <div className={cn("p-6 rounded-3xl border flex items-center justify-between",
                    theme === 'dark' ? "bg-white/5 border-white/5 shadow-xl" : "bg-white border-slate-100 shadow-sm"
                  )}>
                     <div className="flex items-center gap-4">
                        <Database size={20} className="text-emerald-600" />
                        <div>
                           <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Company GPT</p>
                           <p className="text-xs font-bold text-slate-500">Share with your company team.</p>
                        </div>
                     </div>
                     <button onClick={() => setVisibility(visibility === 'company' ? 'personal' : 'company')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", visibility === 'company' ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400")}>
                        {visibility === 'company' ? 'COMPANY' : 'PERSONAL'}
                     </button>
                  </div>
                )}

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Knowledge Base</label>
                     <label className="flex items-center gap-2 text-[10px] font-black text-blue-500 cursor-pointer">
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
                        {isProcessing ? 'Processing...' : 'Add files'}
                        <input 
                          type="file" 
                          multiple 
                          accept=".txt,.md,.csv,.pdf,.docx,.xlsx,.xls"
                          className="hidden" 
                          onChange={handleFileUpload} 
                          disabled={isProcessing} 
                        />
                     </label>
                  </div>
<div className="grid gap-3">
                      {files.map(f => (
                        <div key={f.id} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all", 
                          f.isSafe ? (theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-100") : "bg-red-500/10 border-red-500/30"
                        )}>
                           <div className="flex items-center gap-3">
                              {f.isSafe ? <FileText size={18} className="text-blue-500" /> : <ShieldAlert size={18} className="text-red-500" />}
                              <div>
                                 <p className="text-xs font-bold flex items-center gap-2">
                                   {f.name}
                                   <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase", 
                                     f.contentType === 'text' ? 'bg-slate-500/20 text-slate-400' :
                                     f.contentType === 'excel' ? 'bg-emerald-500/20 text-emerald-500' :
                                     f.contentType === 'pdf' ? 'bg-red-500/20 text-red-500' :
                                     f.contentType === 'word' ? 'bg-blue-500/20 text-blue-500' :
                                     'bg-slate-500/20 text-slate-400'
                                   )}>
                                     {f.contentType}
                                   </span>
                                 </p>
                                 <p className="text-[10px] font-black text-slate-500 uppercase">{f.size}</p>
                                 {!f.isSafe && f.error && (
                                   <p className="text-[9px] text-red-400 mt-1">{f.error}</p>
                                 )}
                              </div>
                           </div>
                           <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={cn("w-full lg:w-1/3 flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l transition-all",
          theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-100"
        )}>
           <header className="h-14 border-b flex items-center px-8 hidden lg:flex">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preview Chat</span>
           </header>
           
           <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
              <AnimatePresence mode="wait">
                 {!name ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                       <Sparkles size={40} className="text-slate-700" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign a name to preview</p>
                    </motion.div>
                 ) : (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                       <div className="flex flex-col items-center space-y-3 mb-8">
                          <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                             <Sparkles size={36} />
                          </div>
                          <h3 className="text-xl font-black">{name}</h3>
                          <button onClick={() => onSelect({ id: currentGptId, name, description, instructions, files })} className="px-8 py-3 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all">Use this GPT</button>
                       </div>

                       <div className={cn("flex-1 mb-4 p-4 rounded-2xl text-sm font-medium overflow-y-auto custom-scrollbar", theme === 'dark' ? "bg-white/5 text-slate-200" : "bg-slate-50 text-slate-700")}>
                          {previewResponse || <span className="opacity-30 italic">No messages yet...</span>}
                          {isPreviewLoading && <div className="mt-2 flex items-center gap-2 text-blue-500"><Loader2 size={12} className="animate-spin" /> Thinking...</div>}
                       </div>

                       <div className="relative">
                          <input 
                            type="text" value={previewInput} onChange={(e) => setPreviewInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePreviewSend()}
                            placeholder={`Ask ${name}...`}
                            className={cn("w-full border rounded-full py-4 pl-6 pr-14 text-sm font-bold shadow-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all",
                              theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-white border-slate-100"
                            )}
                          />
                          <button onClick={handlePreviewSend} disabled={!previewInput.trim() || isPreviewLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 disabled:bg-slate-300 rounded-full flex items-center justify-center text-white transition-all"><Send size={14} /></button>
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
