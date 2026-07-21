import React from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { EstadoActual } from '../types';

interface ConfirmationBannerProps {
  estado: EstadoActual;
  onConfirm: () => void;
  onFocusWindow: () => void;
}

export const ConfirmationBanner: React.FC<ConfirmationBannerProps> = ({
  estado,
  onConfirm,
  onFocusWindow,
}) => {
  if (estado !== 'requiere_confirmacion') {
    return (
      <div className="w-full glass-panel rounded-2xl p-6 mb-6 text-center border-emerald-500/20 bg-emerald-950/10">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Sin Solicitudes Pendientes</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Antigravity está ejecutando o en espera de nuevos comandos. Recibirás una alerta cuando requiera confirmación.
        </p>
      </div>
    );
  }

  const handleConfirm = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    onConfirm();
  };

  return (
    <div className="w-full glass-alert rounded-3xl p-6 md:p-8 mb-6 text-center border-red-500/50 bg-gradient-to-b from-red-950/40 to-slate-900/90 shadow-2xl shadow-red-900/20 animate-pulse-slow">
      <div className="w-16 h-16 rounded-2xl bg-red-600/30 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/40 shadow-lg shadow-red-600/30">
        <AlertCircle className="w-8 h-8 animate-bounce" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/40">
        Solicitud Requerida
      </span>

      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Antigravity Espera Tu Confirmación
      </h2>
      <p className="text-xs md:text-sm text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
        El proceso ha finalizado una fase y requiere permiso ("Proceder siempre", "Permitir" o aceptar cambios).
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <button
          onClick={handleConfirm}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 via-indigo-600 to-indigo-700 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>Aceptar y Proceder</span>
        </button>

        <button
          onClick={onFocusWindow}
          className="py-4 px-5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4 text-indigo-400" />
          <span>Abrir Ventana PC</span>
        </button>
      </div>
    </div>
  );
};
