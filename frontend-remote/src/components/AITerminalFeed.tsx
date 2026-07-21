import React from 'react';
import { Terminal, Copy, Check, Sparkles } from 'lucide-react';

interface AITerminalFeedProps {
  latestAIMessage: string;
}

export const AITerminalFeed: React.FC<AITerminalFeedProps> = ({ latestAIMessage }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(latestAIMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-xs font-mono font-semibold text-slate-300 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Antigravity Terminal Output
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
          title="Copiar respuesta de la IA"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      <div className="w-full p-4 rounded-2xl bg-[#070a12] border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-56 scrollbar-thin">
        <div className="flex items-center gap-2 text-indigo-400 mb-2 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" /> Mensaje Reciente de Antigravity:
        </div>
        <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
          {latestAIMessage || 'Antigravity está en segundo plano listo para recibir instrucciones.'}
        </pre>
      </div>
    </div>
  );
};
