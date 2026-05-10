import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  X, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  Zap,
  ArrowRight,
  Shield,
  CreditCard,
  Key,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface CompanyPanelProps {
  onClose: () => void;
  theme: 'light' | 'dark';
  lang: 'en' | 'es';
}

export const CompanyPanel: React.FC<CompanyPanelProps> = ({ onClose, theme, lang }) => {
  const { user, profile } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isScaling, setIsScaling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = profile?.companyId;

  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    // Subscribe to Company Data
    const unsubscribeCompany = onSnapshot(doc(db, 'companies', companyId), (snap) => {
      if (snap.exists()) {
        setCompany({ id: snap.id, ...snap.data() });
      }
    });

    // Subscribe to Members
    const q = query(collection(db, 'users'), where('companyId', '==', companyId));
    const unsubscribeMembers = onSnapshot(q, (snap) => {
      const membersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(membersData);
      setIsLoading(false);
    });

    return () => {
      unsubscribeCompany();
      unsubscribeMembers();
    };
  }, [companyId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !company) return;

    if ((members.length || 0) >= company.totalSeats) {
      setError(lang === 'en' ? 'No seats remaining. Neural scaling required.' : 'No quedan asientos disponibles. Se requiere escalado neuronal.');
      return;
    }

    try {
      setError(null);
      const inviteRef = doc(db, 'invites', inviteEmail.toLowerCase());
      await setDoc(inviteRef, {
        email: inviteEmail.toLowerCase(),
        companyId: company.id,
        role: 'member',
        invitedBy: user?.uid,
        createdAt: serverTimestamp()
      });

      setInviteEmail('');
      alert(lang === 'en' ? 'Neural invitation dispatched!' : '¡Invitación neuronal enviada!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleScaleUp = async () => {
    if (!company?.stripeSubscriptionId) {
      alert(lang === 'en' ? 'Subscription not found.' : 'Suscripción no encontrada.');
      return;
    }

    const additionalSeats = prompt(lang === 'en' ? 'How many additional seats to add?' : '¿Cuántos asientos adicionales desea agregar?');
    if (!additionalSeats || isNaN(parseInt(additionalSeats))) return;

    const newTotal = company.totalSeats + parseInt(additionalSeats);
    
    try {
      setIsScaling(true);
      setError(null);
      const idToken = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/subscription/update-quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: company.stripeSubscriptionId,
          quantity: newTotal,
          companyId: company.id,
          idToken
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(lang === 'en' ? `Neural workspace scaled to ${newTotal} seats!` : `¡Espacio neuronal escalado a ${newTotal} asientos!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScaling(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === user?.uid) return;
    if (!window.confirm(lang === 'en' ? 'De-authorize member?' : '¿Desautorizar miembro?')) return;

    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        companyId: null,
        companyRole: null,
        role: 'user'
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleAccess = async (memberId: string, type: 'corporate' | 'junior', currentVal: boolean) => {
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        [`permissions.${type}`]: !currentVal
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20" />
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col h-full", 
      theme === 'dark' ? "bg-corporate-950 text-white" : "bg-white text-slate-900"
    )}>
      <header className={cn("h-16 border-b flex items-center justify-between px-5 md:px-8 shrink-0",
        theme === 'dark' ? "border-white/5" : "border-slate-100"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase">{lang === 'en' ? 'Workspace Governance' : 'Gobernanza de Workspace'}</h2>
            <div className="flex items-center gap-2">
               <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{company?.name || 'Enterprise Neural Space'}</p>
               <span className="w-1 h-1 bg-slate-500 rounded-full" />
               <span className="text-[9px] font-bold text-slate-500 uppercase hidden sm:inline">{company?.totalSeats || 0} SEATS</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full transition-all">
          <X size={22} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-12 custom-scrollbar">
        {/* Seats Summary & Scaling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
          <div className={cn("p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border relative overflow-hidden group",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-2xl shadow-slate-200/40"
          )}>
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <button 
                onClick={handleScaleUp}
                disabled={isScaling}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-600/20"
              >
                {isScaling ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
                {lang === 'en' ? 'SCALE UP' : 'ESCALAR'}
              </button>
            </div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{lang === 'en' ? 'Assigned Capacity' : 'Capacidad Asignada'}</h3>
            <p className="text-5xl font-black tracking-tighter">
              {members.length} <span className="text-2xl text-slate-400 font-bold">/ {company?.totalSeats || 10}</span>
            </p>
            <div className="mt-6 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (members.length / (company?.totalSeats || 10)) * 100)}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
              />
            </div>
            <p className="mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {members.length >= (company?.totalSeats || 10) 
                ? (lang === 'en' ? 'WORKSPACE SATURATED' : 'WORKSPACE SATURADO') 
                : (lang === 'en' ? `${(company?.totalSeats || 10) - members.length} SEATS AVAILABLE` : `${(company?.totalSeats || 10) - members.length} ASIENTOS DISPONIBLES`)}
            </p>
          </div>

          <div className={cn("p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border col-span-1 lg:col-span-2 relative overflow-hidden",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-2xl shadow-slate-200/40"
          )}>
             <div className="flex items-center gap-5 mb-8">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <UserPlus size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-black uppercase tracking-tight">{lang === 'en' ? 'Neural Onboarding' : 'Onboarding Neuronal'}</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Propagate access via encrypted corporate link' : 'Propaga el acceso vía enlace corporativo cifrado'}</p>
                </div>
             </div>
             <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 relative z-10">
                <div className="flex-1 relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 transition-colors group-focus-within:text-blue-500">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="corporate@domain.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className={cn("w-full py-6 pl-20 pr-8 rounded-[2rem] text-lg font-black outline-none border transition-all shadow-inner",
                      theme === 'dark' ? "bg-white/5 border-white/5 text-white focus:border-blue-500 focus:bg-white/10" : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white"
                    )}
                  />
                </div>
                <button 
                  type="submit"
                  className="px-10 py-6 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {lang === 'en' ? 'DISPATCH' : 'DESPACHAR'} <ArrowRight size={18} />
                </button>
             </form>
             {error && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-[10px] font-black text-red-500 mt-4 uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                 <ShieldCheck size={14} /> {error}
               </motion.div>
             )}
          </div>
        </div>

        {/* Members — card list on mobile, table on desktop */}
        <div className={cn("rounded-[2.5rem] border overflow-hidden",
          theme === 'dark' ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"
        )}>
          {/* Section header */}
          <div className="px-6 py-5 border-b border-inherit flex items-center justify-between">
            <div>
              <h3 className="text-base font-black uppercase tracking-tighter">{lang === 'en' ? 'Active Identities' : 'Identidades Activas'}</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{lang === 'en' ? 'Verified Workspace Personnel' : 'Personal Verificado del Workspace'}</p>
            </div>
            <div className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
              {members.length} {lang === 'en' ? 'Authorized' : 'Authorized'}
            </div>
          </div>

          {/* Empty state */}
          {members.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'No active identities' : 'No hay identidades activas en este momento.'}</p>
              <p className="text-[9px] text-slate-500 mt-1">{lang === 'en' ? 'Invite members to get started.' : 'comenzar.'}</p>
            </div>
          )}

          {/* Desktop table (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 border-b border-inherit">
                  <th className="px-8 py-5">{lang === 'en' ? 'Identity' : 'Identidad'}</th>
                  <th className="px-8 py-5">{lang === 'en' ? 'Access Status' : 'Estado de Acceso'}</th>
                  <th className="px-8 py-5">{lang === 'en' ? 'Security Layer' : 'Capa de Seguridad'}</th>
                  <th className="px-8 py-5">{lang === 'en' ? 'Ecosystem Access' : 'Acceso al Ecosistema'}</th>
                  <th className="px-8 py-5 text-right">{lang === 'en' ? 'Control' : 'Control'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                          {m.photoURL ? <img src={m.photoURL} alt="" className="w-full h-full object-cover rounded-2xl" /> : m.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight">{m.displayName || 'Neural Entity'}</p>
                          <p className="text-[10px] font-bold text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase border",
                        m.lastActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", m.lastActive ? "bg-emerald-500" : "bg-amber-500")} />
                        {m.lastActive ? 'SYNC' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase">{m.authProvider || 'MAGIC'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleAccess(m.id, 'corporate', m.permissions?.corporate !== false)}
                          className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all",
                            m.permissions?.corporate !== false ? "bg-blue-600/10 text-blue-500 border-blue-600/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                          )}>Corp</button>
                        <button onClick={() => handleToggleAccess(m.id, 'junior', m.permissions?.junior === true)}
                          className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all",
                            m.permissions?.junior === true ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                          )}>Junior</button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {m.id !== user?.uid ? (
                        <button onClick={() => handleRemoveMember(m.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase">
                          {lang === 'en' ? 'OWNER' : 'DUE\u00d1O'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards (shown only on mobile) */}
          <div className="md:hidden divide-y divide-inherit">
            {members.map(m => (
              <div key={m.id} className="p-5 space-y-4">
                {/* Identity row */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                    {m.photoURL ? <img src={m.photoURL} alt="" className="w-full h-full object-cover rounded-2xl" /> : m.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm tracking-tight truncate">{m.displayName || 'Neural Entity'}</p>
                    <p className="text-[10px] font-bold text-slate-500 truncate">{m.email}</p>
                  </div>
                  <span className={cn("shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase border",
                    m.lastActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", m.lastActive ? "bg-emerald-500" : "bg-amber-500")} />
                    {m.lastActive ? 'SYNC' : 'PENDING'}
                  </span>
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleAccess(m.id, 'corporate', m.permissions?.corporate !== false)}
                      className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all tap-target touch-manipulation",
                        m.permissions?.corporate !== false ? "bg-blue-600/10 text-blue-500 border-blue-600/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                      )}>Corporate</button>
                    <button onClick={() => handleToggleAccess(m.id, 'junior', m.permissions?.junior === true)}
                      className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all tap-target touch-manipulation",
                        m.permissions?.junior === true ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                      )}>Junior</button>
                  </div>
                  {m.id !== user?.uid ? (
                    <button onClick={() => handleRemoveMember(m.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all tap-target touch-manipulation">
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase">
                      {lang === 'en' ? 'OWNER' : 'DUE\u00d1O'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Matrix */}
        <div className={cn("p-10 rounded-[3.5rem] border flex flex-col md:flex-row items-center gap-10",
          theme === 'dark' ? "bg-blue-600/5 border-blue-600/20" : "bg-blue-50 border-blue-100 shadow-inner"
        )}>
          <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl shadow-blue-600/40 relative">
             <ShieldCheck size={40} />
             <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-blue-50 dark:border-corporate-950 flex items-center justify-center">
                <Zap size={14} />
             </div>
          </div>
          <div className="space-y-3">
             <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">{lang === 'en' ? 'ZDR SECURITY PROTOCOL ACTIVE' : 'PROTOCOLO ZDR ACTIVO'}</h4>
             <p className="text-xs font-bold leading-relaxed text-slate-500 dark:text-blue-200/60 uppercase tracking-wider">
               {lang === 'en' 
                 ? 'This workspace enforces strict identity validation. Any new corporate email added must authorize their session via secure neural link. Access scaling is synchronized with Stripe billing systems for real-time seat availability.' 
                 : 'Este workspace aplica una validación de identidad estricta. Cualquier correo corporativo nuevo debe autorizar su sesión mediante un enlace seguro. El escalado de acceso se sincroniza con Stripe en tiempo real.'}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyPanel;
