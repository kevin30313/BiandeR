import React from 'react';
import { Smartphone, Bell, Flame, CreditCard, CheckCircle2 } from 'lucide-react';

export const WorkflowPipeline: React.FC = () => {
  const steps = [
    {
      id: 'qr',
      label: '1. Menú QR',
      sub: 'Comensal ordena',
      icon: Smartphone,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-500/10',
      glowColor: 'shadow-amber-500/20',
    },
    {
      id: 'waiter',
      label: '2. Salón',
      sub: 'Garzón aprueba',
      icon: Bell,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-500/10',
      glowColor: 'shadow-emerald-500/20',
    },
    {
      id: 'kitchen',
      label: '3. Cocina KDS',
      sub: 'Fuegos & Tiempos',
      icon: Flame,
      color: 'text-orange-500',
      borderColor: 'border-orange-500/40',
      bgColor: 'bg-orange-500/10',
      glowColor: 'shadow-orange-500/20',
    },
    {
      id: 'cashier',
      label: '4. Caja',
      sub: 'Cobro & Cierre',
      icon: CreditCard,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-500/10',
      glowColor: 'shadow-purple-500/20',
    },
  ];

  return (
    <div className="w-full bg-[#09090B] border border-zinc-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl my-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">
            ARQUITECTURA WEBSOCKET EN VIVO
          </span>
          <h3 className="text-2xl font-serif font-bold text-white mt-2">
            Flujo Operativo Extremo a Extremo
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>LATENCIA SINK: &lt;15ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative group">
              <div
                className={`p-5 rounded-2xl bg-zinc-950/80 border ${step.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg ${step.glowColor} flex flex-col justify-between h-full`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Paso 0{idx + 1}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                    {step.label}
                  </h4>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    {step.sub}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">
                    STATUS: OK
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};