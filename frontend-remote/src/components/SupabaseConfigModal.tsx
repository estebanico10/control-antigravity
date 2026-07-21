import React, { useState } from 'react';
import { X, Save, Server, Wifi } from 'lucide-react';
import { saveConfig, getSavedConfig } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const currentConfig = getSavedConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [localApiUrl, setLocalApiUrl] = useState(currentConfig.localApiUrl || 'http://192.168.1.18:3001');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(supabaseUrl.trim(), supabaseKey.trim(), localApiUrl.trim());
    onConfigSaved();
    onClose();
  };

  const setPcIpPreset = () => {
    setLocalApiUrl('http://192.168.1.18:3001');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border-indigo-500/20 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configurar Conexión Celular & PC</h2>
            <p className="text-xs text-slate-400">IP Local de tu Computadora y Supabase Realtime</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Wifi className="w-3.5 h-3.5" /> IP Server Local de tu PC
              </span>
              <button
                type="button"
                onClick={setPcIpPreset}
                className="text-[11px] text-amber-400 hover:underline font-mono"
              >
                Auto-llenar (http://192.168.1.18:3001)
              </button>
            </label>
            <input
              type="text"
              value={localApiUrl}
              onChange={(e) => setLocalApiUrl(e.target.value)}
              placeholder="http://192.168.1.18:3001"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dirección IP Wi-Fi de tu PC. Necesaria cuando estás conectado en la misma red Wi-Fi.
            </p>
          </div>

          <hr className="border-slate-800/80 my-2" />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Project URL (Conexión Remota Mundial)
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar & Conectar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
