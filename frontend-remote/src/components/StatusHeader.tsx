import React from 'react';
import { Cpu, Settings, LogOut, Radio, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { EstadoActual } from '../types';

interface StatusHeaderProps {
  estado: EstadoActual;
  autoApprove: boolean;
  isConnected: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  estado,
  autoApprove,
  isConnected,
  onOpenSettings,
  onLogout,
}) => {
  const getStatusBadge = () => {
    if (estado === 'requiere_confirmacion') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-semibold text-xs animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>¡Acción Requerida!</span>
        </div>
      );
    }
    if (autoApprove) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold text-xs">
          <Zap className="w-4 h-4" />
          <span>Auto-Aprobar Activo</span>
        </div>
      );
    }
    if (estado === 'procesando') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold text-xs">
          <Cpu className="w-4 h-4 animate-spin" />
          <span>Procesando...</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>En Espera / Listo</span>
      </div>
    );
  };

  return (
    <header className="w-full glass-panel rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border-indigo-500/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg shadow-md shadow-indigo-500/10">
          🚀
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Antigravity Remote
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-500" />
              {isConnected ? 'Realtime Conectado' : 'Conectando / Standalone'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge()}

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition"
          title="Configuración de Supabase / Backend"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
