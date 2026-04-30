import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Crown, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingCardProps {
  plan: string;
  users: string;
  oldPrice: string;
  newPrice: string;
  features: string[];
  isFeatured?: boolean;
  onBuy: () => void;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const PricingCard = ({ plan, users, oldPrice, newPrice, features, isFeatured, onBuy, children, isLoading }: PricingCardProps) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className={cn(
      "p-8 lg:p-10 rounded-[3rem] border transition-all flex flex-col gap-8 h-full relative overflow-hidden group",
      isFeatured 
        ? "bg-corporate-900 border-blue-600/50 shadow-2xl shadow-blue-500/20 text-white" 
        : "bg-white border-corporate-200 text-corporate-900 shadow-sm hover:shadow-xl dark:bg-corporate-900 dark:border-white/10 dark:text-white"
    )}
  >
    {isFeatured && (
      <div className="absolute top-6 right-6 px-4 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
        Más Popular
      </div>
    )}
    
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", isFeatured ? "bg-blue-600 shadow-lg shadow-blue-500/30" : "bg-slate-100 dark:bg-white/5")}>
          {plan === 'SME' && <Zap size={20} className={isFeatured ? "text-white" : "text-blue-600"} />}
          {plan === 'Professional' && <Shield size={20} className={isFeatured ? "text-white" : "text-blue-600"} />}
          {plan === 'Corporate' && <Crown size={20} className={isFeatured ? "text-white" : "text-blue-600"} />}
        </div>
        <div>
          <h3 className="font-display font-black text-xl tracking-tight uppercase leading-none">{plan}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mt-1">{users} Usuarios</p>
        </div>
      </div>

      <div className="pt-4 border-t border-current/10">
        <p className="text-sm font-bold opacity-40 line-through leading-none">{oldPrice}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl font-display font-black tracking-tighter leading-none">{newPrice}</span>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">MXN/mes</span>
        </div>
      </div>

      {children}
    </div>

    <ul className="space-y-4 flex-1">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Check size={10} className="text-blue-500" />
          </div>
          <span className="text-[11px] font-bold leading-tight uppercase tracking-wider opacity-80">{feature}</span>
        </li>
      ))}
    </ul>

    <button 
      onClick={onBuy}
      disabled={isLoading}
      className={cn(
        "w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95",
        isLoading ? "bg-slate-400 cursor-wait opacity-50" :
        isFeatured 
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/40" 
          : "bg-corporate-900 text-white hover:bg-black dark:bg-white dark:text-corporate-950"
      )}
    >
      {isLoading ? "Redirigiendo..." : "Comprar Ahora"} <Terminal size={14} className={cn("opacity-50", isLoading && "animate-spin")} />
    </button>
  </motion.div>
);

export const PricingSection = () => {
  const [professionalUsers, setProfessionalUsers] = React.useState(10);
  const [isRedirecting, setIsRedirecting] = React.useState<string | null>(null);
  const [showSecureMessage, setShowSecureMessage] = React.useState(false);
  
  const handleBuy = async (plan: string) => {
    setIsRedirecting(plan);
    console.log(`Creating Secure Checkout Session for ${plan}...`);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          qty: plan === 'Professional' ? professionalUsers : 1
        })
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      
      const { url } = await response.json();
      
      setShowSecureMessage(true);
      
      // Delay slightly for UX before redirecting
      setTimeout(() => {
        window.location.href = url;
      }, 1500);

    } catch (error: any) {
      console.error('Stripe Error:', error);
      alert(`Error de conexión con la pasarela: ${error.message}`);
      setIsRedirecting(null);
    }
  };

  return (
    <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-16">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4"
        >
          <Zap size={14} /> Especial Mayo 2026
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-7xl font-display font-black tracking-tighter leading-[0.85] uppercase"
        >
          Elige tu <span className="text-blue-600 underline decoration-blue-600/30 underline-offset-12">Plan Seguro</span>
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-blue-600"
        >
           <div className="w-12 h-[1px] bg-blue-600/20" />
           15% de Descuento Automático Incluido
           <div className="w-12 h-[1px] bg-blue-600/20" />
        </motion.div>
      </div>

      {showSecureMessage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
        >
          <div className="bg-white dark:bg-corporate-900 p-12 rounded-[3rem] border border-blue-600/30 shadow-2xl text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/20 animate-bounce">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-2xl font-display font-black uppercase dark:text-white tracking-tighter">Conectando Pasarela</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-widest leading-relaxed">
              Iniciando túnel seguro ZDR para procesamiento de suscripción {isRedirecting}...
            </p>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2 }}
                 className="h-full bg-blue-600"
               />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PricingCard 
          plan="Starter"
          users="1 Usuario"
          oldPrice="$274 MXN"
          newPrice="$233"
          isLoading={isRedirecting === 'Starter'}
          features={[
            "20,000 Tokens Premium / Día",
            "5 Créditos Multimedia / Día",
            "Auto Router (Elite-Eco)",
            "Acceso a Nano Banana Studio"
          ]}
          onBuy={() => handleBuy('Starter')}
        />
        <PricingCard 
          plan="Professional"
          users={`${professionalUsers} Usuarios`}
          oldPrice={`$${224 * professionalUsers} MXN`}
          newPrice={`$${191 * professionalUsers}`}
          isFeatured
          isLoading={isRedirecting === 'Professional'}
          features={[
             "Todo lo de Starter",
             "Dashboard Admin Multi-tenant",
             "Control de Seguridad ZDR Plus",
             "API Access para ERP/CRM",
             "Soporte Dedicado"
          ]}
          onBuy={() => handleBuy('Professional')}
        >
          <div className="pt-6 space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Cantidad de Usuarios (Min. 10)</label>
                <span className="text-xs font-black text-white">{professionalUsers}</span>
             </div>
             <input 
               type="range" 
               min="10" 
               max="100" 
               step="1"
               value={professionalUsers}
               onChange={(e) => setProfessionalUsers(parseInt(e.target.value))}
               className="w-full h-1 bg-blue-600/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
             <p className="text-[8px] font-bold text-blue-300 uppercase leading-relaxed">
               El usuario que realice el pago será designado como <span className="text-white font-black">Super Admin</span> del espacio de trabajo.
             </p>
          </div>
        </PricingCard>
        <PricingCard 
          plan="Top-Up"
          users="Créditos Eternos"
          oldPrice="Uso Ilimitado"
          newPrice="$50"
          isLoading={isRedirecting === 'Top-Up'}
          features={[
             "+50,000 Tokens de Élite",
             "Nunca caducan",
             "Evitan el Modo Eco Forzado",
             "Se consumen al acabar la cuota diaria"
          ]}
          onBuy={() => handleBuy('Top-Up')}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="max-w-3xl mx-auto p-10 lg:p-12 bg-white dark:bg-blue-600/10 rounded-[4rem] border border-corporate-200 dark:border-blue-500/30 flex flex-col md:flex-row items-center gap-10 text-center md:text-left shadow-2xl dark:shadow-blue-900/20"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-blue-500/30">
          <Terminal size={32} />
        </div>
        <div className="space-y-3 flex-1">
          <h4 className="font-display font-black text-xl tracking-tight uppercase dark:text-blue-400">Modelo de Consumo Transparente</h4>
          <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-white/80 uppercase tracking-widest">
            El costo de los tokens de IA se gestiona de forma independiente mediante una bolsa de saldo prepagada, garantizando transparencia total en el consumo y evitando cargos inesperados.
          </p>
        </div>
      </motion.div>
    </section>
  );
};
