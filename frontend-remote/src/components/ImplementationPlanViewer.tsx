import React from 'react';
import { FileText, X, CheckCircle, Sparkles } from 'lucide-react';

interface ImplementationPlanViewerProps {
  isOpen: boolean;
  planMarkdown: string | null;
  onClose: () => void;
  onApprovePlan: () => void;
}

export const ImplementationPlanViewer: React.FC<ImplementationPlanViewerProps> = ({
  isOpen,
  planMarkdown,
  onClose,
  onApprovePlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-3xl glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/30 flex flex-col max-h-[85vh] radial-bg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Plan de Implementación <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-xs text-slate-400">Documento de Arquitectura de Antigravity</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin font-sans text-xs md:text-sm text-slate-200 leading-relaxed bg-[#070a12] p-5 rounded-2xl border border-slate-800/80 mb-4 whitespace-pre-wrap font-mono">
          {planMarkdown || 'No hay un plan de implementación activo en este momento.'}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
          >
            Cerrar Visor
          </button>
          <button
            onClick={() => {
              onApprovePlan();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <CheckCircle className="w-4 h-4" /> Aprobar e Iniciar Ejecución
          </button>
        </div>
      </div>
    </div>
  );
};
