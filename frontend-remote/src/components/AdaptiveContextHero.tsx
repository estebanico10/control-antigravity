import React from 'react';
import { AlertCircle, FileText, CheckCircle2, Zap, Sparkles, Terminal, Camera } from 'lucide-react';
import { ContextType, EstadoActual } from '../types';

interface AdaptiveContextHeroProps {
  contextType: ContextType;
  estado: EstadoActual;
  hasPlan: boolean;
  onConfirm: () => void;
  onOpenPlan: () => void;
  onOpenLiveScreen: () => void;
}

export const AdaptiveContextHero: React.FC<AdaptiveContextHeroProps> = ({
  contextType,
  estado,
  hasPlan,
  onConfirm,
  onOpenPlan,
  onOpenLiveScreen,
}) => {
  const isPlanState = contextType === 'PLAN_APPROVAL_NEEDED' || hasPlan;
  const isProceedState = estado === 'requiere_confirmacion' || contextType === 'PROCEED_REQUIRED';

  const handleActionClick = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([80, 40, 80]);
    }
    onConfirm();
  };

  if (isPlanState) {
    return (
      <div className="w-full glass-panel rounded-3xl p-6 md:p-8 mb-6 border-indigo-500/50 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/40 shadow-2xl shadow-indigo-900/20">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/40 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Plan Maestro Detectado
          </span>
          <button
            onClick={onOpenLiveScreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" /> Ver PC en Vivo
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Plan de Implementación Listo para Aprobar
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed max-w-xl">
          Antigravity ha estructurado el plan técnico y requiere tu aprobación para comenzar la ejecución de cambios.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleActionClick}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 fill-white" />
            <span>Aprobar Plan y Proceder</span>
          </button>

          <button
            onClick={onOpenPlan}
            className="py-4 px-5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Leer Plan Completo</span>
          </button>
        </div>
      </div>
    );
  }

  if (isProceedState) {
    return (
      <div className="w-full glass-alert rounded-3xl p-6 md:p-8 mb-6 border-red-500/50 bg-gradient-to-br from-red-950/50 via-slate-900/90 to-red-900/30 shadow-2xl shadow-red-900/20 animate-pulse-slow">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/40 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Solicitud Requerida
          </span>
          <button
            onClick={onOpenLiveScreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" /> Captura de Pantalla
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Antigravity Espera Tu Confirmación
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed max-w-xl">
          El proceso ha completado una fase y requiere permiso ("Proceed", "Allow" o aceptar cambios).
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleActionClick}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 via-indigo-600 to-indigo-700 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>Clic en Proceed / Permitir</span>
          </button>

          <button
            onClick={onOpenLiveScreen}
            className="py-4 px-5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>Ver Pantalla PC</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-3xl p-6 mb-6 border-emerald-500/20 bg-emerald-950/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" /> Antigravity Activo & Listo
        </div>
        <button
          onClick={onOpenLiveScreen}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-400" /> Ver PC en Vivo
        </button>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">Sin Solicitudes Pendientes</h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
        El sistema está procesando o en espera de nuevos mensajes. Puedes enviar un mensaje desde la barra inferior o capturar la pantalla.
      </p>
    </div>
  );
};
