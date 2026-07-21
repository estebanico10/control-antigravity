import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { getSavedConfig } from '../lib/supabase';

export const PromptInputBar: React.FC = () => {
  const [promptText, setPromptText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const config = getSavedConfig();

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`${config.localApiUrl}/api/inject-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText })
      });

      if (res.ok) {
        setPromptText('');
        setSentNotice(true);
        setTimeout(() => setSentNotice(false), 3000);
      }
    } catch (err) {
      console.error('Error sending prompt:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-4 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Escribir Instrucción Remota a Antigravity
        </span>
        {sentNotice && (
          <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
            ✓ Enviado a Antigravity
          </span>
        )}
      </div>

      <form onSubmit={handleSendPrompt} className="flex gap-2">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ej: Corrige el estilo de este botón y agrega un test..."
          className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs md:text-sm font-medium transition"
        />
        <button
          type="submit"
          disabled={isSending || !promptText.trim()}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
