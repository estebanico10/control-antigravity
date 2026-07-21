import React from 'react';
import { Cloud, Settings, ExternalLink } from 'lucide-react';

interface NetworkAssistantAlertProps {
  isConnected: boolean;
  onOpenSettings: () => void;
}

export const NetworkAssistantAlert: React.FC<NetworkAssistantAlertProps> = ({
  isConnected,
  onOpenSettings,
}) => {
  if (isConnected) return null;

  return (
    <div className="w-full glass-panel rounded-3xl p-5 mb-6 border-amber-500/30 bg-amber-950/20">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            Modo Standalone / Red Local Detectada
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Para controlar Antigravity desde tu celular desde cualquier lugar sin bloqueos de red local del navegador (Mixed Content), configura gratis tu proyecto de <b>Supabase Realtime</b>.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurar Supabase</span>
            </button>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
            >
              <span>Crear Cuenta Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
