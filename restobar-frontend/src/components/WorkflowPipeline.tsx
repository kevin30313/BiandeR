import React, { useEffect, useRef } from 'react';
import { Activity, Radio } from 'lucide-react';

export const WorkflowPipeline: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Definición de los nodos del sistema (Mesa QR -> Garzón -> Cocina -> Caja)
    const nodes = [
      { x: width * 0.15, y: height * 0.5, label: 'MENÚ QR', color: '#f59e0b', sub: 'Comensal' },
      { x: width * 0.38, y: height * 0.5, label: 'SALÓN', color: '#10b981', sub: 'Garzón' },
      { x: width * 0.62, y: height * 0.5, label: 'COCINA KDS', color: '#f97316', sub: 'Fuegos' },
      { x: width * 0.85, y: height * 0.5, label: 'CAJA', color: '#a855f7', sub: 'Cobro' },
    ];

    // Partículas de datos viajando por los WebSockets
    let particles: { x: number; y: number; targetX: number; targetY: number; progress: number; speed: number; color: string }[] = [];

    const spawnParticle = () => {
      const startIdx = Math.floor(Math.random() * (nodes.length - 1));
      particles.push({
        x: nodes[startIdx].x,
        y: nodes[startIdx].y,
        targetX: nodes[startIdx + 1].x,
        targetY: nodes[startIdx + 1].y,
        progress: 0,
        speed: 0.015 + Math.random() * 0.01,
        color: nodes[startIdx].color,
      });
    };

    let frameCount = 0;
    const render = () => {
      frameCount++;
      if (frameCount % 45 === 0) spawnParticle();

      ctx.clearRect(0, 0, width, height);

      // Actualizar posiciones de nodos según el ancho actual
      nodes[0].x = width * 0.15; nodes[0].y = height * 0.5;
      nodes[1].x = width * 0.38; nodes[1].y = height * 0.5;
      nodes[2].x = width * 0.62; nodes[2].y = height * 0.5;
      nodes[3].x = width * 0.85; nodes[3].y = height * 0.5;

      // Dibujar líneas de conexión entre nodos
      for (let i = 0; i < nodes.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Dibujar y mover partículas (paquetes WebSocket)
      particles.forEach((p, index) => {
        p.progress += p.speed;
        p.x = p.x + (p.targetX - p.x) * 0.05;
        p.y = p.y + (p.targetY - p.y) * 0.05;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.progress >= 1) {
          particles.splice(index, 1);
        }
      });

      // Dibujar los nodos holográficos
      nodes.forEach((node, idx) => {
        // Círculo exterior con brillo sutil
        ctx.beginPath();
        ctx.arc(node.x, node.y, 24, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9, 9, 11, 0.9)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Texto del nodo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`0${idx + 1}`, node.x, node.y - 32);

        ctx.fillStyle = node.color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(node.label, node.x, node.y + 42);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '9px monospace';
        ctx.fillText(node.sub, node.x, node.y + 55);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full bg-[#09090B] border border-zinc-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl my-12">
      {/* Fondo holográfico difuso */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              HOLOGRAPHIC WEBSOCKET PIPELINE
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white">
            Simulación de Datos en Tiempo Real
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>ESTADO: NODOS SINCRONIZADOS</span>
        </div>
      </div>

      {/* Canvas con la animación fluida */}
      <div className="relative w-full h-[220px] bg-zinc-950/60 rounded-2xl border border-zinc-800/80 overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full absolute inset-0 cursor-crosshair" />
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-zinc-500 pointer-events-none">
          MATH: HTML5 Canvas / WebSocket Stream Simulation
        </div>
      </div>
    </div>
  );
};