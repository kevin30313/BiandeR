import { useNavigate } from 'react-router-dom';

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] text-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Contenedor Principal */}
      <div className="max-w-lg w-full text-center">
        
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]"></span>
          Engine v2.4 • Realtime WebSockets Active
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          BiandeR OS
        </h1>
        <p className="text-slate-400 mb-10 text-base sm:text-lg">
          Sistema operativo inteligente para restobares de alta rotación
        </p>

        {/* Tarjetas de Accesos */}
        <div className="grid gap-3.5">
          
          {/* Cliente */}
          <div
            onClick={() => navigate('/menu/1')}
            className="group p-5 bg-slate-900/80 border border-sky-500/20 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-sky-400 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(56,189,248,0.15)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="text-2xl p-2.5 bg-sky-500/10 rounded-lg group-hover:scale-110 transition-transform">📱</div>
              <div>
                <div className="font-semibold text-base text-slate-100 group-hover:text-sky-300 transition-colors">Menú Cliente (Mesa #1)</div>
                <div className="text-xs text-slate-400">Simulación de pre-orden digital interactiva</div>
              </div>
            </div>
            <span className="text-sky-400 font-bold text-lg transition-transform group-hover:translate-x-1">➔</span>
          </div>

          {/* Garzón */}
          <div
            onClick={() => navigate('/waiter')}
            className="group p-5 bg-slate-900/80 border border-emerald-500/20 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-emerald-400 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="text-2xl p-2.5 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">📋</div>
              <div>
                <div className="font-semibold text-base text-slate-100 group-hover:text-emerald-300 transition-colors">Panel de Garzón</div>
                <div className="text-xs text-slate-400">Validación de comandas y control de mesas</div>
              </div>
            </div>
            <span className="text-emerald-400 font-bold text-lg transition-transform group-hover:translate-x-1">➔</span>
          </div>

          {/* Cocina */}
          <div
            onClick={() => navigate('/kitchen')}
            className="group p-5 bg-slate-900/80 border border-orange-500/20 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-orange-400 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.15)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="text-2xl p-2.5 bg-orange-500/10 rounded-lg group-hover:scale-110 transition-transform">👨‍🍳</div>
              <div>
                <div className="font-semibold text-base text-slate-100 group-hover:text-orange-300 transition-colors">Pantalla Cocina (KDS)</div>
                <div className="text-xs text-slate-400">Flujo de preparación en tiempo real</div>
              </div>
            </div>
            <span className="text-orange-400 font-bold text-lg transition-transform group-hover:translate-x-1">➔</span>
          </div>

          {/* Caja */}
          <div
            onClick={() => navigate('/cashier')}
            className="group p-5 bg-slate-900/80 border border-purple-500/20 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-purple-400 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.15)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="text-2xl p-2.5 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">💳</div>
              <div>
                <div className="font-semibold text-base text-slate-100 group-hover:text-purple-300 transition-colors">Panel de Caja</div>
                <div className="text-xs text-slate-400">Cierre de cuentas y pagos</div>
              </div>
            </div>
            <span className="text-purple-400 font-bold text-lg transition-transform group-hover:translate-x-1">➔</span>
          </div>

          {/* Admin */}
          <div
            onClick={() => navigate('/login')}
            className="group p-5 bg-slate-900/80 border border-slate-700/40 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(148,163,184,0.15)] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="text-2xl p-2.5 bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">🔐</div>
              <div>
                <div className="font-semibold text-base text-slate-100 group-hover:text-slate-200 transition-colors">Administración & Login</div>
                <div className="text-xs text-slate-400">Control total del sistema y accesos</div>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-lg transition-transform group-hover:translate-x-1">➔</span>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-10 text-xs text-slate-500">
          BiandeR Architecture © 2026 • Powered by React & Node.js
        </div>

      </div>
    </div>
  );
};

export default HomeSelector;