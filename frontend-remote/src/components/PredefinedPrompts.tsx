import React, { useState } from 'react';
import { Sparkles, Terminal, GitCommit, Database, CheckSquare, Brain, Palette, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { getSavedConfig } from '../lib/supabase';

interface PredefinedPromptsProps {
  onSelectPrompt?: (promptText: string) => void;
}

export const PredefinedPrompts: React.FC<PredefinedPromptsProps> = ({ onSelectPrompt }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [sendingPrompt, setSendingPrompt] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const config = getSavedConfig();

  const categories = [
    {
      title: '🚀 Automatización & Git',
      icon: GitCommit,
      prompts: [
        'Haz el commit y push tú mismo a GitHub',
        'Sube tú mismo a Supabase conectándote a la terminal (migrations & edge functions)',
        'Ejecuta la revisión de calidad y verifica la compilación con tsc --noEmit',
        'Crea un Pull Request con GitHub CLI gh pr create'
      ]
    },
    {
      title: '🧠 Memoria de Proyecto & PMB-AI',
      icon: Brain,
      prompts: [
        'Actualiza el contexto de esta app en el mpc de pmb ai',
        'Ejecuta prepare y project_overview en pmb-ai para recuperar decisiones',
        'Registra esta decisión arquitectónica con record_keyed_fact en pmb-ai',
        'Guarda las lecciones aprendidas de este error en pmb-ai (find_lessons)'
      ]
    },
    {
      title: '📋 Tareas & Workflow (TickTick)',
      icon: CheckSquare,
      prompts: [
        '¿Qué tareas tengo en TickTick?',
        'Crea una tarea en TickTick para revisar este avance',
        'Revisa el plan de implementación actual y ejecuta los pasos faltantes',
        'Crea el archivo walkthrough.md con los cambios completados'
      ]
    },
    {
      title: '🎨 Diseño & Estética UI/UX',
      icon: Palette,
      prompts: [
        'Aplica el estilo Antigravity Design Expert: glassmorphism, micro-animaciones y paletas HSL',
        'Optimiza la interfaz móvil para que se vea como una app PWA nativa',
        'Asegura accesibilidad WCAG AA y contraste de color óptimo'
      ]
    },
    {
      title: '🔍 Debugging & Calidad',
      icon: Bug,
      prompts: [
        'Inspecciona los logs de error completos y aplica el fix directamente',
        'Limpia todos los console.log, código muerto y comentarios temporales',
        'Añade manejo de errores robusto sin enmascarar excepciones'
      ]
    }
  ];

  const handleSendPredefined = async (promptText: string) => {
    setSendingPrompt(promptText);
    try {
      const res = await fetch(`${config.localApiUrl}/api/inject-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText })
      });

      if (res.ok) {
        if (onSelectPrompt) onSelectPrompt(promptText);
        setSuccessNotice(`Prompt enviado: "${promptText.slice(0, 30)}..."`);
        setTimeout(() => setSuccessNotice(null), 3000);
      }
    } catch (e) {
      console.error('Error sending predefined prompt:', e);
    } finally {
      setSendingPrompt(null);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Prompts Rápidos Predefinidos (Skills & Workflow)
          </span>
        </div>
        <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {successNotice && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-bounce">
          <Terminal className="w-3.5 h-3.5" /> {successNotice}
        </div>
      )}

      {expanded && (
        <div className="space-y-4 pt-1">
          {categories.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <IconComp className="w-3.5 h-3.5 text-indigo-400" />
                  {cat.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.prompts.map((p, pIdx) => {
                    const isSending = sendingPrompt === p;
                    return (
                      <button
                        key={pIdx}
                        onClick={() => handleSendPredefined(p)}
                        disabled={Boolean(sendingPrompt)}
                        className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 hover:text-white text-xs text-left transition transform active:scale-95 flex items-center gap-1.5 shadow-sm"
                      >
                        {isSending ? (
                          <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        )}
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
