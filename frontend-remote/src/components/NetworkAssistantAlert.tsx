import React from 'react';
import { Settings, ExternalLink, Wifi, AlertCircle } from 'lucide-react';

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
    <div className="w-full glass-panel rounded-3xl p-5 mb-6 border-amber-500/30 bg-amber-950/20 shadow-xl shadow-amber-950/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Wifi className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            📱 Conectar Celular con tu PC
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Para abrir en tu celular por Wi-Fi, debes escribir obligatoriamente <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-mono font-bold">http://192.168.1.18:3001</code> con <span className="underline decoration-amber-400 font-bold">http://</span> al inicio (si no escribes <span className="font-mono text-amber-300">http://</span> el celular fuerza https y falla).
          </p>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-3 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Para conectar 24/7 sin escribir IPs ni estar en la misma red Wi-Fi, configura Supabase.</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenSettings}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition"
            >
              <Settings className="w-4 h-4" />
              <span>Configurar Supabase 24/7</span>
            </button>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <span>Crear Cuenta Supabase Gratis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
