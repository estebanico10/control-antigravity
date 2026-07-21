import React, { useState } from 'react';
import { Github, CheckCircle, Sparkles } from 'lucide-react';
import { getSavedConfig } from '../lib/supabase';

interface GitHubAccountSelectorProps {
  onAccountSelected?: (accountName: string) => void;
}

export const GitHubAccountSelector: React.FC<GitHubAccountSelectorProps> = ({ onAccountSelected }) => {
  const [selectedAcc, setSelectedAcc] = useState<string | null>(null);
  const [loadingAcc, setLoadingAcc] = useState<string | null>(null);
  const config = getSavedConfig();

  const accounts = [
    { id: 'estebanico10', label: 'estebanico10 (Principal)' },
    { id: 'iecejerusalen-eng', label: 'iecejerusalen-eng' },
    { id: 'naomyalvarado2026', label: 'naomyalvarado2026' }
  ];

  const handleSelectAccount = async (accountName: string) => {
    setLoadingAcc(accountName);
    try {
      const res = await fetch(`${config.localApiUrl}/api/select-github-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: accountName })
      });

      if (res.ok) {
        setSelectedAcc(accountName);
        if (onAccountSelected) onAccountSelected(accountName);
        setTimeout(() => setSelectedAcc(null), 3000);
      }
    } catch (e) {
      console.error('Error selecting GitHub account:', e);
    } finally {
      setLoadingAcc(null);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 mb-6 border-indigo-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Selector Remoto de Cuentas GitHub
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Modal 'Select an account'</span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Si aparece el modal emergente de inicio de sesión de GitHub en tu PC, toca tu cuenta para seleccionarla y presionar <b>Continue</b> automáticamente:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          const isSelected = selectedAcc === acc.id;
          const isLoading = loadingAcc === acc.id;

          return (
            <button
              key={acc.id}
              onClick={() => handleSelectAccount(acc.id)}
              disabled={isLoading}
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/70 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Github className="w-4 h-4" />
                </div>
                <span>{acc.label}</span>
              </div>
              {isSelected ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : isLoading ? (
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <span className="text-[10px] text-indigo-400">Elegir</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
