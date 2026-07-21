import React, { useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Monitor } from 'lucide-react';
import { getSavedConfig } from '../lib/supabase';

interface LiveScreenViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveScreenView: React.FC<LiveScreenViewProps> = ({ isOpen, onClose }) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const config = getSavedConfig();

  const fetchScreenshot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.localApiUrl}/api/screenshot`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image_base64) {
          setImageBase64(data.image_base64);
        } else {
          setError(data.error || 'No se pudo generar la captura.');
        }
      } else {
        setError('Error conectando con el servidor backend.');
      }
    } catch (err: any) {
      setError('Servidor Daemon no accesible localmente.');
    } finally {
      setLoading(false);
    }
  }, [config.localApiUrl]);

  useEffect(() => {
    if (isOpen) {
      fetchScreenshot();
    }
  }, [isOpen, fetchScreenshot]);

  useEffect(() => {
    if (isOpen && autoRefresh) {
      const interval = setInterval(fetchScreenshot, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh, fetchScreenshot]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 shadow-2xl border border-indigo-500/30 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pantalla PC en Vivo</h3>
              <p className="text-xs text-slate-400">Captura de Ventana Antigravity IDE</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                autoRefresh
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Auto 5s' : 'Auto-Refresco'}</span>
            </button>

            <button
              onClick={fetchScreenshot}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capturar Ahora</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center min-h-[300px] relative">
          {loading && !imageBase64 && (
            <div className="flex flex-col items-center text-indigo-400 gap-2">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium">Capturando pantalla de PC...</span>
            </div>
          )}

          {error && !imageBase64 && (
            <div className="text-red-400 text-xs font-medium p-4 text-center">
              {error}
            </div>
          )}

          {imageBase64 && (
            <img
              src={imageBase64}
              alt="Antigravity Live Screen"
              className="w-full h-full object-contain rounded-xl"
            />
          )}
        </div>
      </div>
    </div>
  );
};
