import React from 'react';
import { Activity, Clock, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import { TelemetryData } from '../types';

interface TelemetryCardProps {
  telemetry: TelemetryData | null;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ telemetry }) => {
  const data = telemetry || {
    context_remaining_pct: 88,
    tokens_used: 120000,
    total_context_limit: 1000000,
    active_conversations: 1,
    last_active: new Date().toISOString(),
    seconds_until_reset: 43200,
    status: 'NORMAL' as const,
  };

  const formatSecondsToHours = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const pct = data.context_remaining_pct;
  const isLow = pct < 20;

  return (
    <div className="w-full glass-panel rounded-3xl p-6 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Telemetría de Antigravity
        </h3>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
          Gemini 3.6 Flash / Pro
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Context Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Contexto Restante
            </span>
            <span className={`text-sm font-bold font-mono ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
              {pct}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLow
                  ? 'bg-gradient-to-r from-red-600 to-amber-500'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {isLow ? '⚠️ Contexto bajo. Se recomienda resumir.' : 'Capacidad de ventana óptima.'}
          </p>
        </div>

        {/* Tokens Usage */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Tokens Consumidos
            </span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white tracking-tight my-1">
            {data.tokens_used.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">/ {(data.total_context_limit / 1000).toFixed(0)}k</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {data.active_conversations} sesión(es) activa(s)
          </p>
        </div>

        {/* Reset Timer */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Reinicio de Cuota
            </span>
            {isLow && <ShieldAlert className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="text-xl font-extrabold font-mono text-indigo-300 tracking-tight my-1">
            {formatSecondsToHours(data.seconds_until_reset)}
          </div>
          <p className="text-[11px] text-slate-500">
            Renovación automática a medianoche
          </p>
        </div>
      </div>
    </div>
  );
};
