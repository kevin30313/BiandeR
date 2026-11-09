import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ClipboardList, ChefHat, ReceiptText, ShieldCheck, ArrowRight, Flame } from 'lucide-react';

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111110] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.12),rgba(17,17,16,0))] text-[#f5f5f4] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Contenedor Principal */}
      <div className="max-w-xl w-full text-center">
        
        {/* Símbolo / Ilustración de Marca Minimalista (Tipo Logotipo Gastronómico) */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6 shadow-lg shadow-amber-950/30">
          <UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />
        </div>

        {/* Título de Marca */}
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight mb-2 text-amber-50 font-normal">
          Biande<span className="text-amber-500 font-semibold italic">R</span>
        </h1>
        <p className="text-[#a8a29e] mb-10 text-sm sm:text-base tracking-wide uppercase font-mono">
          Restobar & Cocina en Tiempo Real
        </p>

        {/* Tarjetas de Accesos */}
        <div className="grid gap-3 text-left">
          
          {/* Cliente */}
          <div
            onClick={() => navigate('/menu/1')}
            className="group relative p-4.5 bg-[#1c1c1a]/80 border border-[#292926] rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-[#242421] hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-stone-200 group-hover:text-amber-300 transition-colors">Menú Cliente (Mesa #1)</div>
                <div className="text-xs text-[#78716c]">Pre-orden digital interactiva para comensales</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#78716c] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Garzón */}
          <div
            onClick={() => navigate('/waiter')}
            className="group relative p-4.5 bg-[#1c1c1a]/80 border border-[#292926] rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-[#242421] hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-stone-200 group-hover:text-emerald-300 transition-colors">Panel de Garzón</div>
                <div className="text-xs text-[#78716c]">Validación de comandas y despacho a salón</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#78716c] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Cocina */}
          <div
            onClick={() => navigate('/kitchen')}
            className="group relative p-4.5 bg-[#1c1c1a]/80 border border-[#292926] rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-[#242421] hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-stone-200 group-hover:text-orange-300 transition-colors">Pantalla Cocina (KDS)</div>
                <div className="text-xs text-[#78716c]">Flujo de preparación y tiempos de fuegos</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#78716c] group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Caja */}
          <div
            onClick={() => navigate('/cashier')}
            className="group relative p-4.5 bg-[#1c1c1a]/80 border border-[#292926] rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-[#242421] hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-stone-200 group-hover:text-purple-300 transition-colors">Panel de Caja</div>
                <div className="text-xs text-[#78716c]">Cierre de cuentas, boletas y pagos</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#78716c] group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Admin */}
          <div
            onClick={() => navigate('/login')}
            className="group relative p-4.5 bg-[#1c1c1a]/80 border border-[#292926] rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-[#242421] hover:border-stone-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-500/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-stone-800 border border-stone-700/50 rounded-lg text-stone-300 group-hover:bg-stone-700 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm sm:text-base text-stone-200 group-hover:text-white transition-colors">Administración & Login</div>
                <div className="text-xs text-[#78716c]">Configuración de inventario, recetas y accesos</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#78716c] group-hover:text-stone-300 group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-[#78716c] font-mono tracking-wider">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>BIANDER GASTRONOMY SYSTEM • PRODUCTION READY</span>
        </div>

      </div>
    </div>
  );
};

export default HomeSelector;