import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, getDocs, updateDoc, doc, setDoc, deleteDoc, onSnapshot, handleFirestoreError, OperationType, addDoc, serverTimestamp } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

interface AdminDashboardProps {
  onClose: () => void;
  onOpenDiagnostics: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onOpenDiagnostics }) => {
  console.log('AdminDashboard Mounting...');
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'errors'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('AdminDashboard useEffect running...');
    const unsubscribeRequests = onSnapshot(
      query(collection(db, 'access_requests'), where('status', '==', 'pending')),
      (snapshot) => {
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'access_requests');
      }
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    const unsubscribeErrors = onSnapshot(
      query(collection(db, 'errors'), where('timestamp', '!=', null)),
      (snapshot) => {
        const errorData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setErrors(errorData.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'errors');
      }
    );

    return () => {
      unsubscribeRequests();
      unsubscribeUsers();
      unsubscribeErrors();
    };
  }, []);

  const handleApprove = async (request: any) => {
    try {
      await updateDoc(doc(db, 'access_requests', request.id), {
        status: 'approved'
      });
      // We don't create the user profile here because we don't have their UID yet.
      // App.tsx will handle creating the approved profile when they next sign in.
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;

    setIsAddingUser(true);
    try {
      // Create an already approved access request
      await addDoc(collection(db, 'access_requests'), {
        email: newUserEmail,
        name: newUserName || newUserEmail.split('@')[0],
        status: 'approved',
        createdAt: serverTimestamp(),
        message: 'Añadido manualmente por administrador'
      });
      setNewUserEmail('');
      setNewUserName('');
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        let successCount = 0;
        const errors: string[] = [];

        for (const row of data) {
          const email = row.email || row.Email || row.EMAIL;
          const name = row.name || row.Name || row.NAME || email?.split('@')[0];

          if (!email || !email.includes('@')) {
            errors.push(`Fila inválida: ${JSON.stringify(row)}`);
            continue;
          }

          try {
            await addDoc(collection(db, 'access_requests'), {
              email: email,
              name: name,
              status: 'approved',
              createdAt: serverTimestamp(),
              message: 'Importado vía CSV'
            });
            successCount++;
          } catch (err) {
            errors.push(`Error con ${email}: ${err}`);
          }
        }

        setImportStatus({ success: successCount, errors });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setImportStatus(null), 5000);
      }
    });
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: true
      });
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de eliminar a este usuario?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateLimit = async (userId: string, newLimit: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        tokensPerDay: newLimit
      });
    } catch (error) {
      console.error('Error updating limit:', error);
    }
  };

  const handleUpdateSubscription = async (userId: string, level: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        subscriptionLevel: level
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDeleteError = async (errorId: string) => {

    try {
      await deleteDoc(doc(db, 'errors', errorId));
    } catch (error) {
      console.error('Error deleting error log:', error);
    }
  };

  const handleClearErrors = async () => {
    if (window.confirm('¿Estás seguro de limpiar todos los registros de error?')) {
      for (const err of errors) {
        await deleteDoc(doc(db, 'errors', err.id));
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('AdminDashboard Rendering JSX, activeTab:', activeTab);
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Panel de Control Techie</h2>
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Administración de Acceso</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>
        </div>

        <div className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sistema Operativo Techie v2.5</span>
            </div>
            <button 
                onClick={onOpenDiagnostics}
                className="text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
                🚀 Correr Diagnóstico Full
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-white/5">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-white/40 hover:text-white/60'}`}
          >
            Solicitudes ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-white/40 hover:text-white/60'}`}
          >
            Usuarios ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('errors')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'errors' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-white/40 hover:text-white/60'}`}
          >
            Errores ({errors.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'requests' ? (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-4xl mb-4 block">📭</span>
                  <p className="text-white/40 font-bold">No hay solicitudes pendientes.</p>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div>
                      <h3 className="text-white font-bold">{req.name}</h3>
                      <p className="text-xs text-blue-400 font-mono">{req.email}</p>
                      {req.message && <p className="text-xs text-white/60 mt-2 italic">"{req.message}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(req)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                      >
                        Aprobar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'errors' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Registros de Error</h3>
                {errors.length > 0 && (
                  <button 
                    onClick={handleClearErrors}
                    className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-all"
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>
              {errors.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="text-white/40 font-bold">No se han registrado errores.</p>
                </div>
              ) : (
                errors.map(err => (
                  <div key={err.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 group hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-red-500/20 text-red-400">
                          {err.operationType}
                        </span>
                        <span className="text-[8px] text-white/40 font-mono">
                          {err.timestamp?.toDate().toLocaleString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteError(err.id)}
                        className="text-white/20 hover:text-red-400 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-white font-mono break-all mb-2">{err.error}</p>
                    <div className="grid grid-cols-2 gap-2 text-[8px] text-white/40 font-mono">
                      <div>Path: <span className="text-blue-400">{err.path || 'N/A'}</span></div>
                      <div>User: <span className="text-blue-400">{err.authInfo?.email || err.authInfo?.userId || 'N/A'}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Import/Add Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Add */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Añadir Manualmente</h3>
                  <form onSubmit={handleAddUser} className="space-y-2">
                    <input 
                      type="text" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nombre (opcional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="Email..."
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <button 
                        type="submit"
                        disabled={isAddingUser}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Añadir
                      </button>
                    </div>
                  </form>
                </div>

                {/* CSV Import */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Importar CSV</h3>
                  <p className="text-[10px] text-white/30 mb-4">El archivo debe tener columnas: <code className="text-blue-400">email, name</code></p>
                  <input 
                    type="file" 
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-blue-400/50 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-xl">📁</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Seleccionar Archivo CSV</span>
                  </button>
                </div>
              </div>

              {/* Import Status */}
              <AnimatePresence>
                {importStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${importStatus.errors.length > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}
                  >
                    Importación finalizada: {importStatus.success} exitosos.
                    {importStatus.errors.length > 0 && (
                      <div className="mt-2 text-red-400">
                        {importStatus.errors.length} errores encontrados.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search and List */}
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-10 py-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">🔍</span>
                </div>

                <div className="space-y-3">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{user.name}</h3>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 font-mono">{user.email}</p>
                        <div className="flex gap-3 mt-1">
                           <span className="text-[8px] text-white/20 uppercase font-black">Uso hoy: {user.dailyUsageCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {!user.isApproved && (
                          <button 
                            onClick={() => handleApproveUser(user.id)}
                            className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-green-500/30 transition-all"
                          >
                            Aprobar
                          </button>
                        )}
                        <div className="text-right">
                          <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Suscripción</label>
                          <select 
                            value={user.subscriptionLevel || 'free'}
                            onChange={(e) => handleUpdateSubscription(user.id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none"
                          >
                            <option value="free" className="bg-[#0f172a]">Básico (Gratis)</option>
                            <option value="basic" className="bg-[#0f172a]">Plan $50 (Conexión Propia)</option>
                            <option value="pro" className="bg-[#0f172a]">Plan $99 (Premium Plus)</option>

                          </select>
                        </div>
                        <div className="text-right">
                          <label className="block text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Límite Diario</label>
                          <input 
                            type="number" 
                            value={user.tokensPerDay}
                            onChange={(e) => handleUpdateLimit(user.id, parseInt(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs text-center focus:outline-none"
                          />
                        </div>

                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-white/20 text-xs font-bold uppercase tracking-widest">
                      No se encontraron usuarios.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
