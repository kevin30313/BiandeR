import { useNavigate } from 'react-router-dom';
import { Smartphone, ClipboardList, ChefHat, ReceiptText, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.1),rgba(255,255,255,0))] text-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Contenedor Principal */}
      <div className="max-w-xl w-full text-center">
        
        {/* Badge superior minimalista */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium mb-6 shadow-inner">
          <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>BiandeR Core • Realtime WebSockets Active</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-white">
          BiandeR <span className="font-light text-slate-400">OS</span>
        </h1>
        <p className="text-slate-400 mb-10 text-base font-normal">
          Plataforma de gestión y control operativo para restobares
        </p>

        {/* Tarjetas de Accesos */}
        <div className="grid gap-3 text-left">
          
          {/* Cliente */}
          <div
            onClick={() => navigate('/menu/1')}
            className="group relative p-4.5 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-slate-900 hover:border-sky-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-sky-400 group-hover:text-sky-300 group-hover:border-sky-500/30 transition-colors">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-slate-200 group-hover:text-white transition-colors">Menú Cliente (Mesa #1)</div>
                <div className="text-xs text-slate-500">Simulación de pre-orden digital interactiva</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Garzón */}
          <div
            onClick={() => navigate('/waiter')}
            className="group relative p-4.5 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-slate-900 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/30 transition-colors">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-slate-200 group-hover:text-white transition-colors">Panel de Garzón</div>
                <div className="text-xs text-slate-500">Validación de comandas y control de mesas</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Cocina */}
          <div
            onClick={() => navigate('/kitchen')}
            className="group relative p-4.5 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-slate-900 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-amber-400 group-hover:text-amber-300 group-hover:border-amber-500/30 transition-colors">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-slate-200 group-hover:text-white transition-colors">Pantalla Cocina (KDS)</div>
                <div className="text-xs text-slate-500">Flujo de preparación en tiempo real</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Caja */}
          <div
            onClick={() => navigate('/cashier')}
            className="group relative p-4.5 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-slate-900 hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/30 transition-colors">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-slate-200 group-hover:text-white transition-colors">Panel de Caja</div>
                <div className="text-xs text-slate-500">Cierre de cuentas y transacciones</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Admin */}
          <div
            onClick={() => navigate('/login')}
            className="group relative p-4.5 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-slate-900 hover:border-slate-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-300 group-hover:text-white group-hover:border-slate-500/30 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-slate-200 group-hover:text-white transition-colors">Administración & Login</div>
                <div className="text-xs text-slate-500">Control maestro y accesos corporativos</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-slate-600 font-mono tracking-wider">
          BIANDER ARCHITECTURE • PRODUCTION READY
        </div>

      </div>
    </div>
  );
};

export default HomeSelector;