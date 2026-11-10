import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Flame, 
  Terminal, 
  Activity, 
  Sparkles 
} from 'lucide-react';
import { WorkflowPipeline } from '../components/WorkflowPipeline';

// SVGs estilizados estilo Dark Craft / Bistro Modern
const SmartphoneSVG = () => (
  <svg className="w-6 h-6 stroke-amber-400 fill-none" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
    <path d="M12 18h.01" />
  </svg>
);

const WaiterBellSVG = () => (
  <svg className="w-6 h-6 stroke-emerald-400 fill-none" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1 9 9 0 0 1 12 0Z" />
    <path d="M12 4a3 3 0 0 0-3 3v2h6V7a3 3 0 0 0-3-3Z" />
    <path d="M12 2v2" />
    <path d="M4 21h16" />
  </svg>
);

const KitchenChefSVG = () => (
  <svg className="w-6 h-6 stroke-orange-500 fill-none" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.8a4.5 4.5 0 1 1 2.61-8.29 5 5 0 1 1 6.78 0A4.5 4.5 0 1 1 18 13.8" />
    <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4Z" />
    <path d="M10 17h4" />
  </svg>
);

const CashierRegisterSVG = () => (
  <svg className="w-6 h-6 stroke-purple-400 fill-none" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h10" />
    <path d="M7 12h4" />
    <path d="M7 16h2" />
    <path d="M15 14l2 2 4-4" />
  </svg>
);

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col justify-between font-sans selection:bg-orange-600 selection:text-white">
      
      {/* HEADER EN CAJA NEGRA HIGH-CONTRAST */}
      <header className="w-full bg-[#09090B] text-zinc-100 border-b border-zinc-800 sticky top-0 z-50 px-4 sm:px-8 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-[1px] shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#09090B] rounded-[11px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-tight text-white uppercase">
                Biande<span className="text-orange-500 italic">R</span>
              </span>
              <span className="block text-[9px] font-mono tracking-[0.25em] text-zinc-400 uppercase -mt-1">
                Restobar OS • Commercial
              </span>
            </div>
          </div>

          {/* Badge de Estado Realtime */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-zinc-300">WEBSOCKETS REALTIME ACTIVE</span>
          </div>

          {/* Botón Acceso Admin */}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase transition-all hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ACCESO ADMIN</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION DE ALTO IMPACTO EN FONDO BLANCO HUESO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 flex-1 w-full flex flex-col justify-center">
        
        {/* Encabezado Editorial */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Arquitectura Comercial B2B</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-zinc-950 mb-4 leading-none">
            Control Operativo <br />
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 bg-clip-text text-transparent italic">
              En Tiempo Real
            </span>
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Selecciona la terminal activa para interactuar con la arquitectura continua entre comensales, salón, cocina y caja.
          </p>
        </div>

        {/* BENTO GRID RESPONSIVO CON TARJETAS NEGRAS Y EFECTOS GLOW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Módulo Cliente - TARJETA PRINCIPAL NEGRA DESTACADA (7 cols en escritorio) */}
          <div
            onClick={() => navigate('/menu/1')}
            className="lg:col-span-7 group relative p-6 sm:p-8 bg-[#09090B] text-white border border-zinc-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-amber-500/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col justify-between overflow-hidden min-h-[280px]"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none"></div>
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <SmartphoneSVG />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                  EXPERIENCIA QR
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                Menú Pre-Orden Digital (Mesa #1)
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md font-light">
                Interfaz optimizada para smartphones. Permite al comensal armar su pedido en tiempo real reduciendo tiempos de espera en salón.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-xs font-mono text-amber-400 tracking-wide font-medium">
                  EXPERIENCIA MÓVIL ACTIVA
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl group-hover:bg-amber-500 group-hover:text-black transition-all">
                <span>Abrir Menú QR</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-amber-400 group-hover:text-black" />
              </div>
            </div>
          </div>

          {/* Columna Derecha (5 cols en escritorio) - Garzón, Cocina y Caja */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-5">
            
            {/* Panel de Garzón */}
            <div
              onClick={() => navigate('/waiter')}
              className="group p-5 bg-[#09090B] text-white border border-zinc-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <WaiterBellSVG />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Panel de Garzón
                  </h3>
                  <p className="text-xs text-zinc-400 font-light">Validación y control de salón</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Pantalla Cocina (KDS) */}
            <div
              onClick={() => navigate('/kitchen')}
              className="group p-5 bg-[#09090B] text-white border border-zinc-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-orange-500/60 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <KitchenChefSVG />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-orange-400 transition-colors">
                    Pantalla Cocina (KDS)
                  </h3>
                  <p className="text-xs text-zinc-400 font-light">Fuegos y tiempos en vivo</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Panel de Caja */}
            <div
              onClick={() => navigate('/cashier')}
              className="group p-5 bg-[#09090B] text-white border border-zinc-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-purple-500/60 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CashierRegisterSVG />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-purple-400 transition-colors">
                    Panel de Caja
                  </h3>
                  <p className="text-xs text-zinc-400 font-light">Pre-cuentas y cobro</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>

          </div>

        </div>

        {/* PIPELINE DE FLUJO EN TIEMPO REAL INTEGRADO */}
        <WorkflowPipeline />

      </main>

      {/* FOOTER EN CAJA NEGRA CORPORATIVA */}
      <footer className="w-full bg-[#09090B] text-zinc-400 border-t border-zinc-800 py-6 px-4 sm:px-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-bold font-serif">BiandeR OS</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-300">RESTOBAR MANAGEMENT SYSTEM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>REACT + TS</span>
            <span>NODE.JS</span>
            <span>POSTGRESQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomeSelector;