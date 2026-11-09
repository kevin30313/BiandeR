import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Smartphone, 
  ClipboardCheck, 
  Flame, 
  CreditCard, 
  Lock, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  Clock,
  Wifi
} from 'lucide-react';

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-zinc-900 flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-white">
      
      {/* HEADER NAVEGABLE COMPLETO */}
      <header className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-zinc-900 font-serif">
                Biande<span className="text-orange-600">R</span>
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase -mt-1">
                Restobar OS
              </span>
            </div>
          </div>

          {/* Badges de estado */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-zinc-600">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              WebSockets en tiempo real activo
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span> Latencia &lt; 15ms</span>
            </div>
          </div>

          {/* Botón rápido de login */}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Acceso Sistema</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL / SECCIÓN HERO */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        
        {/* Banner Superior Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200 text-orange-800 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Ecosistema Operativo Restobar</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mb-4 font-serif leading-tight">
            Selecciona la estación de <span className="text-orange-600 underline decoration-orange-300 decoration-wavy underline-offset-4">trabajo</span>
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg leading-relaxed">
            Explora el flujo continuo entre la pre-orden interactiva del cliente, la validación del garzón, el despacho en cocina y el cierre en caja.
          </p>
        </div>

        {/* BENTO GRID DE MÓDULOS DE ROL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Módulo Cliente (Destacado) */}
          <div
            onClick={() => navigate('/menu/1')}
            className="group relative p-6 bg-white border border-zinc-200/90 rounded-2xl cursor-pointer transition-all duration-300 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-6 -mt-6 transition-all group-hover:bg-orange-100"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-orange-600 uppercase font-mono">Módulo Comensal</span>
              <h2 className="text-xl font-bold text-zinc-900 mt-1 mb-2 group-hover:text-orange-600 transition-colors">
                Menú Digital (Mesa #1)
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Interface optimizada para smartphone. Pre-orden interactiva directa por QR con sincronización en tiempo real.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Probar experiencia de cliente</span>
              <ArrowUpRight className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Módulo Garzón */}
          <div
            onClick={() => navigate('/waiter')}
            className="group relative p-6 bg-white border border-zinc-200/90 rounded-2xl cursor-pointer transition-all duration-300 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase font-mono">Control de Salón</span>
              <h2 className="text-xl font-bold text-zinc-900 mt-1 mb-2 group-hover:text-emerald-600 transition-colors">
                Panel de Garzón
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Validación táctil de comandas recibidas, asignación de mesas y despacho inmediato hacia fuegos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Ver comandas pendientes</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Módulo Cocina (KDS) */}
          <div
            onClick={() => navigate('/kitchen')}
            className="group relative p-6 bg-white border border-zinc-200/90 rounded-2xl cursor-pointer transition-all duration-300 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase font-mono">KDS Producción</span>
              <h2 className="text-xl font-bold text-zinc-900 mt-1 mb-2 group-hover:text-amber-600 transition-colors">
                Pantalla de Cocina
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Gestión de tickets por tiempos de preparación, alertas auditivas y cambio de estado de fuegos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Monitor de tickets</span>
              <ArrowUpRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Módulo Caja */}
          <div
            onClick={() => navigate('/cashier')}
            className="group relative p-6 bg-white border border-zinc-200/90 rounded-2xl cursor-pointer transition-all duration-300 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase font-mono">Facturación & Cierre</span>
              <h2 className="text-xl font-bold text-zinc-900 mt-1 mb-2 group-hover:text-indigo-600 transition-colors">
                Panel de Caja
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Pre-cuenta automatizada, división de pagos por persona y emisión de recibos de venta.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Gestión de cobro</span>
              <ArrowUpRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Módulo Administración & Configuración */}
          <div
            onClick={() => navigate('/login')}
            className="group relative p-6 bg-white border border-zinc-200/90 rounded-2xl cursor-pointer transition-all duration-300 hover:border-zinc-800 hover:shadow-xl hover:shadow-zinc-900/10 flex flex-col justify-between overflow-hidden md:col-span-2 lg:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase font-mono">Panel Maestro</span>
                <h2 className="text-xl font-bold text-zinc-900 mt-1 mb-1 group-hover:text-zinc-700 transition-colors">
                  Administración Central & Usuarios
                </h2>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-lg">
                  Control global de carta, edición de productos, roles de personal (`WAITER`, `KITCHEN`, `CASHIER`) y métricas operativas del negocio.
                </p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap self-start sm:self-center group-hover:bg-orange-600 transition-colors shadow-sm">
                Iniciar Sesión Admin
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER ESTRUCTURADO Y ELEGANTE */}
      <footer className="w-full border-t border-zinc-200 bg-white py-6 px-6 mt-12 text-zinc-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 font-serif">BiandeR OS</span>
            <span>• Arquitectura SaaS Restobar en Tiempo Real</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-400 font-mono text-[11px]">
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-500" /> Socket.io Online</span>
            <span>Node.js / Express</span>
            <span>React + Vite</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomeSelector;