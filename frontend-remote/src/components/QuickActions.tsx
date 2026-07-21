import React from 'react';
import { GitCommit, Monitor, CheckCircle, Zap } from 'lucide-react';

interface QuickActionsProps {
  autoApprove: boolean;
  onToggleAutoApprove: () => void;
  onSendConfirm: () => void;
  onGitPush: () => void;
  onFocusWindow: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  autoApprove,
  onToggleAutoApprove,
  onSendConfirm,
  onGitPush,
  onFocusWindow,
}) => {
  return (
    <div className="w-full glass-panel rounded-3xl p-6 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          Acciones Rápidas & Control
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Manual Confirm Button */}
        <button
          onClick={onSendConfirm}
          className="p-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-left transition group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white">Enviar Enter / Aceptar</span>
            <span className="block text-xs text-slate-400 mt-0.5">Confirma acción remota</span>
          </div>
        </button>

        {/* Git Commit & Push Button */}
        <button
          onClick={onGitPush}
          className="p-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-left transition group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white">Git Commit & Push</span>
            <span className="block text-xs text-slate-400 mt-0.5">Sube cambios a GitHub</span>
          </div>
        </button>

        {/* Focus Window Button */}
        <button
          onClick={onFocusWindow}
          className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white">Enfocar Antigravity</span>
            <span className="block text-xs text-slate-400 mt-0.5">Trae app al frente en PC</span>
          </div>
        </button>

        {/* Auto Approve Toggle Card */}
        <div
          onClick={onToggleAutoApprove}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
            autoApprove
              ? 'bg-amber-500/20 border-amber-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${autoApprove ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors ${autoApprove ? 'bg-amber-500' : 'bg-slate-800'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoApprove ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
          <div>
            <span className="block text-sm font-bold text-white">Modo Auto-Aprobar</span>
            <span className="block text-xs text-slate-400 mt-0.5">
              {autoApprove ? 'Aprobación automática ACTIVA' : 'Confirmación manual activa'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
