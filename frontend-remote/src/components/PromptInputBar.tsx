import React, { useState, useRef } from 'react';
import { Send, MessageSquare, Image, Check, Sparkles } from 'lucide-react';
import { getSavedConfig } from '../lib/supabase';

export const PromptInputBar: React.FC = () => {
  const [promptText, setPromptText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = getSavedConfig();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImageBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendPromptOrImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() && !selectedImageBase64) return;

    setIsSending(true);
    try {
      // 1. Send image if selected
      if (selectedImageBase64) {
        await fetch(`${config.localApiUrl}/api/inject-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: selectedImageBase64 })
        });
      }

      // 2. Send text prompt if typed
      if (promptText.trim()) {
        await fetch(`${config.localApiUrl}/api/inject-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: promptText })
        });
      }

      setPromptText('');
      setSelectedImageBase64(null);
      setSentNotice('Enviado e inyectado en Antigravity');
      setTimeout(() => setSentNotice(null), 3000);
    } catch (err) {
      console.error('Error sending prompt or image:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-4 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Escribir Prompt / Adjuntar Imagen (JPG)
        </span>
        {sentNotice && (
          <span className="text-[11px] text-emerald-400 font-semibold animate-pulse flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {sentNotice}
          </span>
        )}
      </div>

      {selectedImageBase64 && (
        <div className="mb-3 p-2 rounded-2xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={selectedImageBase64} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
            <span className="text-xs text-indigo-300 font-semibold">Imagen Lista para Pegar en Antigravity</span>
          </div>
          <button
            onClick={() => setSelectedImageBase64(null)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
          >
            Quitar
          </button>
        </div>
      )}

      <form onSubmit={handleSendPromptOrImage} className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
          title="Adjuntar Imagen / Foto"
        >
          <Image className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Escribe tu prompt o adjunta una imagen..."
          className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs md:text-sm font-medium transition"
        />

        <button
          type="submit"
          disabled={isSending || (!promptText.trim() && !selectedImageBase64)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
        >
          {isSending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
