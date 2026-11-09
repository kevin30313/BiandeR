import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Smartphone, 
  ChefHat, 
  Receipt, 
  ArrowRight, 
  Flame,
  Radio,
  ConciergeBell
} from 'lucide-react';

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080707] text-stone-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      
      {/* Luces de Fondo (Glow de Fuegos / Bar) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* HEADER TIPO BARBER / BISTRO MODERN */}
      <header className="w-full border-b border-stone-800/60 bg-[#080707]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Neón Gastronómico */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-[1px] shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <div className="w-full h-full bg-stone-950 rounded-[11px] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-stone-100 uppercase font-mono">
                BIANDE<span className="text-amber-500">R</span>
              </span>
              <span className="block text-[9px] font-mono tracking-[0.3em] text-stone-500 uppercase -mt-1">
                NEXT-GEN RESTOBAR
              </span>
            </div>
          </div>

          {/* Badge de Conexión Live */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline text-stone-300">WEBSOCKET ENGINE LIVE</span>
          </div>

          {/* Login estilizado */}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/50 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase transition-all hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            LOGIN ADMIN
          </button>
        </div>
      </header>

      {/* HERO SECTION IMPONENT */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center relative z-10">
        
        {/* Intro */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-4">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Sistema Operativo de Alta Concurrencia</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-none uppercase">
            Control de Mando <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              En Tiempo Real
            </span>
          </h1>
          <p className="text-stone-400 text-base sm:text-lg max-w-xl font-light">
            Selecciona la terminal para interactuar con la arquitectura en vivo. Sin recargas, sin retrasos de cocina.
          </p>
        </div>

        {/* LAYOUT ASIMÉTRICO (DESTRUCTURADO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Módulo Cliente - TARJETA PRINCIPAL DESTACADA (7 Cols) */}
          <div
            onClick={() => navigate('/menu/1')}
            className="lg:col-span-7 group relative p-8 bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-stone-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Smartphone className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                  EXPERIENCIA COMENSAL
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                📱 Menú Pre-Orden QR (Mesa #1)
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed max-w-md font-light">
                Interfaz ultra rápida para smartphones. El cliente arma la orden en la mesa sin esperar que el garzón tipee plato por plato.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-stone-800/80 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-400 group-hover:text-amber-400 transition-colors">
                [ PROBAR SIMULACIÓN DE CLIENTE ]
              </span>
              <div className="w-10 h-10 rounded-full bg-stone-800 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Columna Derecha (5 Cols) - Garzón, Cocina y Caja */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-5">
            
            {/* Garzón */}
            <div
              onClick={() => navigate('/waiter')}
              className="group p-6 bg-stone-900/60 border border-stone-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ConciergeBell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Panel de Garzón
                  </h3>
                  <p className="text-xs text-stone-400 font-light">Validación y control de salón</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Cocina */}
            <div
              onClick={() => navigate('/kitchen')}
              className="group p-6 bg-stone-900/60 border border-stone-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-orange-500/60 hover:shadow-[0_0_25px_rgba(249,115,22,0.15)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                    Pantalla Cocina (KDS)
                  </h3>
                  <p className="text-xs text-stone-400 font-light">Fuegos y tiempos en vivo</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Caja */}
            <div
              onClick={() => navigate('/cashier')}
              className="group p-6 bg-stone-900/60 border border-stone-800 rounded-3xl cursor-pointer transition-all duration-300 hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    Panel de Caja
                  </h3>
                  <p className="text-xs text-stone-400 font-light">Pre-cuentas y cobro</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER CYBER/BISTRO */}
      <footer className="w-full border-t border-stone-800/60 bg-stone-950/80 backdrop-blur-md py-5 px-6 text-stone-500 text-xs font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-bold">BIANDER OS</span>
            <span className="text-stone-700">|</span>
            <span>RESTOBAR MANAGEMENT SYSTEM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-600">
            <span>REACT + VITE</span>
            <span>NODE.JS</span>
            <span>POSTGRESQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomeSelector;