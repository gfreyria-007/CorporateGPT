import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShieldAlert, 
  Database, 
  Trash2, 
  UserPlus, 
  Download, 
  Upload, 
  CheckCircle2, 
  Ban, 
  X,
  CreditCard,
  BarChart,
  Settings,
  Zap,
  Palette,
  Cpu,
  Monitor
} from 'lucide-react';
import { collection, query, getDocs, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { translations } from '../lib/translations';
import { updateUserRole, updateUserBanStatus, updateUserLimits, updateAppConfig } from '../lib/admin';
import { handleFirestoreError, OperationType } from '../lib/db';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

export const AdminPanel: React.FC<{ onClose: () => void, theme: 'light' | 'dark' }> = ({ onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'flagged' | 'license' | 'settings' | 'studio'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time users listener
    const q = query(collection(db, 'users'), orderBy('lastActive', 'desc'));
    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Real-time config listener
    const unsubscribeConfig = onSnapshot(doc(db, 'admin', 'config'), (doc) => {
      if (doc.exists()) {
        setAppConfig(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'admin/config');
    });

    fetchCredits();

    return () => {
      unsubscribeUsers();
      unsubscribeConfig();
    };
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/admin/credits');
      const data = await res.json();
      setCredits(data.data);
    } catch (err) {
      console.error("Failed to fetch credits", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      console.log("Bulk upload data:", data);
      // Implementation for bulk add would go here
      alert(`Parsed ${data.length} users from file. Bulk addition implementation would proceed here.`);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className={cn("flex-1 flex flex-col h-full animate-in fade-in slide-in-from-right-4 font-sans transition-colors duration-500 relative z-50", 
      theme === 'dark' ? "bg-corporate-950 text-slate-200" : "bg-white text-corporate-900"
    )}>
      <header className={cn("h-20 border-b flex items-center justify-between px-8 z-10 shrink-0",
        theme === 'dark' ? "bg-corporate-950 border-white/5 shadow-2xl" : "bg-white border-corporate-200 shadow-sm"
      )}>
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <ShieldAlert size={22} />
           </div>
           <div>
              <h2 className="text-lg font-black tracking-tighter uppercase">Admin Terminal</h2>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] animate-pulse">Authorized Access Only</p>
           </div>
        </div>
        <button 
          type="button"
          id="close-admin-panel"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }} 
          className="p-2 hover:bg-slate-500/10 rounded-full transition-all text-slate-400 hover:text-red-500"
        >
           <X size={24} />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <nav className={cn("w-72 border-r p-6 space-y-2 transition-all",
          theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200 shadow-xl z-20"
        )}>
           <AdminTabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart size={18} />} label="Overview" theme={theme} />
           <AdminTabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} label="User Management" theme={theme} />
           <AdminTabButton active={activeTab === 'flagged'} onClick={() => setActiveTab('flagged')} icon={<ShieldAlert size={18} />} label="Security Flags" theme={theme} />
           <AdminTabButton active={activeTab === 'license'} onClick={() => setActiveTab('license')} icon={<CheckCircle2 size={18} />} label="Production" theme={theme} />
           <AdminTabButton active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} icon={<Palette size={18} />} label="Studio Config" theme={theme} />
           <AdminTabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="Usage Rules" theme={theme} />
        </nav>

        {/* Console Content */}
        <main className={cn("flex-1 overflow-y-auto p-10 custom-scrollbar",
          theme === 'dark' ? "bg-slate-900" : "bg-slate-100/50"
        )}>
           {activeTab === 'overview' && (
             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <StatsCard 
                    label="Active Credits" 
                    value={`$${credits?.total_credits?.toFixed(2) || '10.00'}`} 
                    desc={`Usage: $${credits?.total_usage?.toFixed(2) || '0.11'}`}
                    icon={<CreditCard className="text-blue-500" />} 
                    color={theme === 'dark' ? "border-blue-500/20 bg-slate-950" : "bg-white border-blue-500/10 shadow-sm"}
                    theme={theme}
                   />
                   <StatsCard 
                    label="Total Users" 
                    value={users.length.toString()} 
                    desc={`${users.filter(u => u.lastActive > Date.now() - 86400000).length} active today`}
                    icon={<Users className="text-emerald-500" />} 
                    color={theme === 'dark' ? "border-emerald-500/20 bg-slate-950" : "bg-white border-emerald-500/10 shadow-sm"}
                    theme={theme}
                   />
                   <StatsCard 
                    label="Security Flags" 
                    value={users.filter(u => u.flagged).length.toString()} 
                    desc="High risk attempts"
                    icon={<ShieldAlert className="text-red-500" />} 
                    color={theme === 'dark' ? "border-red-500/20 bg-slate-950" : "bg-white border-red-500/10 shadow-sm"}
                    theme={theme}
                   />
                </div>

                <div className={cn("border rounded-[3rem] p-8 shadow-inner",
                  theme === 'dark' ? "bg-slate-950 border-white/5 shadow-black/40" : "bg-white border-slate-200"
                )}>
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Real-time Usage Flow</h3>
                     <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">LIVE UPDATES</span>
                   </div>
                   <div className="h-80 flex items-end gap-3 px-4">
                      {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60, 85, 50, 70, 90, 40].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-t-2xl relative group overflow-hidden">
                           <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'users' && (
             <div className="space-y-6">
                <div className={cn("flex justify-between items-center p-8 rounded-[3rem] border shadow-xl",
                   theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
                 )}>
                   <div>
                      <h3 className={cn("text-xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>Active Accounts</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage corporate access levels</p>
                   </div>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-3 px-6 py-3 bg-white/5 text-slate-300 rounded-2xl text-[10px] font-black cursor-pointer hover:bg-white/10 transition-all border border-white/5">
                         <Upload size={14} /> BULK UPLOAD
                         <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                      </label>
                      <button className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest">
                         <UserPlus size={14} /> ADD USER
                      </button>
                   </div>
                </div>

                <div className={cn("rounded-[3rem] border overflow-hidden shadow-2xl",
                   theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
                 )}>
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-white/2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                            <th className="px-8 py-6">Identity</th>
                            <th className="px-8 py-6">Role</th>
                            <th className="px-8 py-6">Usage Efficiency</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {users.map(u => (
                           <tr key={u.id} className="text-sm hover:bg-white/[0.03] transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                                       {u.photoURL ? <img src={u.photoURL} alt="" className="rounded-2xl" /> : u.email?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                       <p className={cn("font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{u.displayName || 'Unnamed User'}</p>
                                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{u.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <select 
                                   value={u.role || 'user'} 
                                   onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                                   className="bg-white/5 border border-white/5 p-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-500 transition-all text-white"
                                 >
                                    <option value="user">USER</option>
                                    <option value="admin" className={theme === 'dark' ? "bg-slate-950" : "bg-white"}>ADMIN</option>
                                    <option value="super-admin" className={theme === 'dark' ? "bg-slate-950 text-red-500" : "bg-white text-red-600"}>SUPER ADMIN</option>
                                 </select>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black text-slate-500">
                                       <span className="flex items-center gap-1">
                                          {u.unlimitedUsage ? <Zap size={10} className="text-yellow-500" /> : null}
                                          {u.queriesUsed || 0}/{u.unlimitedUsage ? '∞' : (u.maxQueries || 5)} QUERIES
                                       </span>
                                       <span>{u.unlimitedUsage ? 'MAX' : Math.round(((u.queriesUsed || 0) / (u.maxQueries || 5)) * 100)}%</span>
                                    </div>
                                    <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                       <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,1)]" style={{ width: `${u.unlimitedUsage ? 100 : Math.min(100, ((u.queriesUsed || 0) / (u.maxQueries || 5)) * 100)}%` }}></div>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase">Images: {u.imagesUsed || 0}/{u.unlimitedUsage ? '∞' : (u.maxImages || 10)}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 {u.banned ? (
                                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">Banned</span>
                                 ) : (
                                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Active</span>
                                 )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button 
                                   onClick={() => updateUserBanStatus(u.id, !u.banned)}
                                   className={cn("p-2 rounded-xl transition-all", 
                                     u.banned 
                                       ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                                       : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                   )}
                                   title={u.banned ? "Unban" : "Ban User"}
                                 >
                                    {u.banned ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'flagged' && (
              <div className="space-y-8">
                 <div className="bg-red-600 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-red-600/30 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div>
                          <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6 backdrop-blur-xl">
                             <ShieldAlert size={32} />
                          </div>
                          <h3 className="text-3xl font-black tracking-tighter mb-2">SECURITY PROTOCOL VIOLATIONS</h3>
                          <p className="text-white/80 text-sm font-bold max-w-lg">
                             Intercepted sessions and restriction bypass attempts. High-risk accounts are automatically isolated for review.
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="grid gap-6">
                    {users.filter(u => u.flagged).map(u => (
                      <div key={u.id} className={cn("p-8 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl",
                        theme === 'dark' ? "bg-slate-950 border-red-500/20" : "bg-white border-red-100"
                      )}>
                         <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                            <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500">
                               <ShieldAlert size={32} />
                            </div>
                            <div>
                               <h4 className={cn("text-lg font-black tracking-tight uppercase", theme === 'dark' ? "text-white" : "text-red-900")}>{u.displayName}</h4>
                               <p className="text-xs text-red-500 font-bold tracking-widest mt-1">{u.flagReason?.toUpperCase()}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => updateUserBanStatus(u.id, true)}
                           className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                         >
                            LOCK ACCOUNT
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
           )}

            {activeTab === 'license' && (
              <div className="space-y-10">
                 <div className={cn("p-10 rounded-[3.5rem] border relative overflow-hidden",
                   theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
                 )}>
                    <div className="flex items-center gap-6 mb-10">
                       <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/20">
                          <CheckCircle2 size={32} />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black tracking-tighter uppercase">Enterprise Governance</h3>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Status: {appConfig?.licenseStatus || 'TRIAL ACTIVE'}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valid From</label>
                                <input 
                                  type="date" 
                                  defaultValue={appConfig?.licenseValidFrom?.split('T')[0]} 
                                  className={cn("w-full p-4 rounded-2xl text-xs font-bold outline-none", theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100")} 
                                  onChange={(e) => updateAppConfig({ licenseValidFrom: new Date(e.target.value).toISOString() })}
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valid To</label>
                                <input 
                                  type="date" 
                                  defaultValue={appConfig?.licenseValidTo?.split('T')[0]} 
                                  className={cn("w-full p-4 rounded-2xl text-xs font-bold outline-none", theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100")} 
                                  onChange={(e) => updateAppConfig({ licenseValidTo: new Date(e.target.value).toISOString() })}
                                />
                             </div>
                          </div>

                          <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/20">
                             <div className="flex items-center gap-3 mb-2">
                                <BarChart size={16} className="text-blue-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">License Health</p>
                             </div>
                             <p className="text-xs font-medium text-slate-400">
                                {appConfig?.licenseValidTo ? `The current license is valid until ${new Date(appConfig.licenseValidTo).toLocaleDateString()}.` : 'No license found.'} 
                                {appConfig?.licenseValidTo && new Date(appConfig.licenseValidTo).getTime() < Date.now() + 604800000 ? (
                                  <span className="text-red-500 font-bold block mt-2">LICENSE EXPIRES IN LESS THAN 7 DAYS. RENEW NOW.</span>
                                ) : <span className="text-emerald-500 font-bold block mt-2">Active & Secure</span>}
                             </p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Low Balance Threshold (USD)</label>
                             <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</div>
                                <input 
                                  type="number" 
                                  defaultValue={appConfig?.openRouterThreshold || 5} 
                                  className={cn("w-full p-6 pl-12 rounded-[2rem] text-xl font-black outline-none", theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100 text-slate-900 border-slate-200")} 
                                  onChange={(e) => updateAppConfig({ openRouterThreshold: parseFloat(e.target.value) })}
                                />
                             </div>
                             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter mt-1 px-4">Automatic alerts sent to super-admins when credits fall below this limit.</p>
                          </div>

                          <div className="p-6 rounded-3xl bg-emerald-600/5 border border-emerald-600/20">
                             <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert size={16} className="text-emerald-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Production Stability</p>
                             </div>
                             <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400 uppercase">Production Mode Activation</p>
                                <button 
                                  onClick={() => updateAppConfig({ isProduction: !appConfig?.isProduction })}
                                  className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                    appConfig?.isProduction ? "bg-emerald-600 text-white" : "bg-slate-500/20 text-slate-400"
                                  )}
                                >
                                   {appConfig?.isProduction ? 'PRODUCTION ACTIVE' : 'DEVELOPMENT'}
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'settings' && (
             <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={cn("space-y-8 p-10 rounded-[3.5rem] border shadow-2xl",
                   theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
                 )}>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                         <Settings size={24} />
                      </div>
                      <div>
                        <h3 className={cn("text-xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>Global Usage Constraints</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enforce strict limits system-wide</p>
                      </div>
                   </div>
                   
                   <div className="grid gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 text-blue-400">Daily Query Allowance</label>
                         <input type="number" defaultValue={5} className="w-full bg-white/5 border border-white/5 p-6 rounded-[2rem] font-black text-xl outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Monthly Data Quota</label>
                         <input type="number" defaultValue={100} className="w-full bg-white/5 border border-white/5 p-6 rounded-[2rem] font-black text-xl outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all" />
                      </div>
                      <button className={cn("w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all",
                         theme === 'dark' ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10"
                       )}>
                         Sync Global Rules
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'studio' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="max-w-4xl space-y-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h3 className="text-2xl font-black tracking-tight mb-2">Studio Protocol Configuration</h3>
                         <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage visual styles and content generation parameters</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 bg-blue-600 rounded-[3.5rem] text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden group">
                         <div className="relative z-10">
                            <h4 className="text-xl font-black mb-2">Visual Templates</h4>
                            <div className="space-y-3">
                               {[
                                 { id: 'professional', name: 'Boardroom (Corporate)' },
                                 { id: 'scientific', name: 'Data Lab (Scientific)' },
                                 { id: 'classic', name: 'Sketchbook (Classic)' },
                                 { id: 'neubrutalist', name: 'Brutalist (Modern)' }
                               ].map(s => {
                                 const isActive = appConfig?.enabledVisualTemplates?.includes(s.id) ?? true;
                                 return (
                                   <div key={s.id} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                      <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                                      <button 
                                        onClick={() => {
                                          const current = appConfig?.enabledVisualTemplates || ['professional', 'scientific', 'classic', 'neubrutalist'];
                                          const next = isActive ? current.filter((id: string) => id !== s.id) : [...current, s.id];
                                          updateAppConfig({ enabledVisualTemplates: next });
                                        }}
                                        className={cn("w-10 h-5 rounded-full relative transition-all", isActive ? "bg-white" : "bg-white/20")}
                                      >
                                         <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all", isActive ? "right-1 bg-blue-600" : "left-1 bg-white/40")} />
                                      </button>
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className={cn("p-8 rounded-[3rem] border shadow-2xl transition-all", 
                            theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
                         )}>
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                  <Monitor size={20} />
                               </div>
                               <h4 className="text-sm font-black uppercase tracking-tight">Display Configuration</h4>
                            </div>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center px-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Force White Canvas</span>
                                  <button 
                                    onClick={() => updateAppConfig({ forceWhiteCanvas: !appConfig?.forceWhiteCanvas })}
                                    className={cn("w-10 h-5 rounded-full relative transition-all", appConfig?.forceWhiteCanvas ? "bg-emerald-500" : "bg-slate-500/30")}
                                  >
                                     <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", appConfig?.forceWhiteCanvas ? "right-1" : "left-1")} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

const AdminTabButton = ({ active, onClick, icon, label, theme }: any) => (
  <button 
    onClick={onClick}
    className={cn("w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
      active 
        ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] z-10' 
        : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100')
    )}
  >
    {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-blue-600 -z-10" />}
    <span className={cn("transition-transform group-hover:scale-110", active ? "text-white" : (theme === 'dark' ? "text-blue-500" : "text-slate-400"))}>
       {icon}
    </span>
    {label}
  </button>
);

const StatsCard = ({ label, value, desc, icon, color, theme }: any) => (
  <div className={cn("p-8 rounded-[3rem] border shadow-2xl transition-all hover:scale-[1.02]", 
    color,
    theme === 'dark' ? "bg-slate-950 border-white/5" : "bg-white border-slate-100"
  )}>
     <div className="flex justify-between items-start mb-6">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", theme === 'dark' ? "bg-white/5" : "bg-slate-50")}>
           {icon}
        </div>
        <div className={cn("p-1 rounded-lg", theme === 'dark' ? "bg-white/5" : "bg-slate-50")}>
           <BarChart size={12} className={theme === 'dark' ? "text-slate-700" : "text-slate-300"} />
        </div>
     </div>
     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-2">{label}</h4>
     <p className={cn("text-4xl font-black tracking-tighter mb-2", theme === 'dark' ? "text-white" : "text-slate-900")}>{value}</p>
     <div className={cn("h-px w-full mb-3", theme === 'dark' ? "bg-white/5" : "bg-slate-100")} />
     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{desc}</p>
  </div>
);

const Lock = ({ size }: { size: number }) => <ShieldAlert size={size} />;
