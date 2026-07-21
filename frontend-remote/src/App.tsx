import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, getSavedConfig } from './lib/supabase';
import { EstadoActual, ControlEstado, TelemetryData, AntigravityContext } from './types';
import { LoginModal } from './components/LoginModal';
import { StatusHeader } from './components/StatusHeader';
import { AdaptiveContextHero } from './components/AdaptiveContextHero';
import { GitHubAccountSelector } from './components/GitHubAccountSelector';
import { PredefinedPrompts } from './components/PredefinedPrompts';
import { TelemetryCard } from './components/TelemetryCard';
import { QuickActions } from './components/QuickActions';
import { AITerminalFeed } from './components/AITerminalFeed';
import { LiveScreenView } from './components/LiveScreenView';
import { ImplementationPlanViewer } from './components/ImplementationPlanViewer';
import { PromptInputBar } from './components/PromptInputBar';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { NetworkAssistantAlert } from './components/NetworkAssistantAlert';
import { Sparkles, Terminal } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('control');
  const [estado, setEstado] = useState<EstadoActual>('inactivo');
  const [autoApprove, setAutoApprove] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [context, setContext] = useState<AntigravityContext | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isLiveScreenOpen, setIsLiveScreenOpen] = useState<boolean>(false);
  const [isPlanViewerOpen, setIsPlanViewerOpen] = useState<boolean>(false);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  // Auth Check
  useEffect(() => {
    const auth = localStorage.getItem('antigravity_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const config = getSavedConfig();

  // Local HTTP API Fallback Action
  const sendLocalApiAction = useCallback(async (action?: EstadoActual, nextAutoApprove?: boolean) => {
    try {
      const res = await fetch(`${config.localApiUrl}/api/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, auto_approve: nextAutoApprove })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setEstado(data.state.estado_actual);
          setAutoApprove(data.state.auto_approve);
        }
      }
    } catch (e) {}
  }, [config.localApiUrl]);

  // Sync state via Supabase Realtime or local polling
  const initSync = useCallback(() => {
    const supabase = getSupabaseClient();

    if (supabase) {
      setIsConnected(true);

      supabase.from('control_estado').select('*').eq('id', 1).single().then(({ data }) => {
        if (data) {
          setEstado(data.estado_actual);
          setAutoApprove(data.auto_approve);
        }
      });

      supabase.from('antigravity_telemetry').select('*').eq('id', 1).single().then(({ data }) => {
        if (data) setTelemetry(data);
      });

      supabase.from('antigravity_context').select('*').eq('id', 1).single().then(({ data }) => {
        if (data) setContext(data);
      });

      const channel = supabase
        .channel('antigravity_remote_v2')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'control_estado' }, (payload) => {
          const newData = payload.new as ControlEstado;
          if (newData) {
            setEstado(newData.estado_actual);
            if (newData.auto_approve !== undefined) setAutoApprove(newData.auto_approve);
            if (newData.last_action) {
              setLastActionStatus(newData.last_action);
              setTimeout(() => setLastActionStatus(null), 4000);
            }
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'antigravity_telemetry' }, (payload) => {
          const newData = payload.new as TelemetryData;
          if (newData) setTelemetry(newData);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'antigravity_context' }, (payload) => {
          const newData = payload.new as AntigravityContext;
          if (newData) setContext(newData);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setIsConnected(false);
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${config.localApiUrl}/api/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.state) {
              setEstado(data.state.estado_actual);
              setAutoApprove(data.state.auto_approve);
            }
            if (data.telemetry) setTelemetry(data.telemetry);
            if (data.context) setContext(data.context);
            setIsConnected(true);
          }
        } catch (e) {
          setIsConnected(false);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [config.localApiUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = initSync();
      return cleanup;
    }
  }, [isAuthenticated, initSync]);

  const handleUpdateEstado = async (newEstado: EstadoActual) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('control_estado').upsert({
        id: 1,
        estado_actual: newEstado,
        auto_approve: autoApprove,
        updated_at: new Date().toISOString()
      });
    } else {
      await sendLocalApiAction(newEstado, autoApprove);
    }
  };

  const handleToggleAutoApprove = async () => {
    const nextVal = !autoApprove;
    setAutoApprove(nextVal);
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('control_estado').upsert({
        id: 1,
        estado_actual: estado,
        auto_approve: nextVal,
        updated_at: new Date().toISOString()
      });
    } else {
      await sendLocalApiAction(undefined, nextVal);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('antigravity_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const isActionRequired = estado === 'requiere_confirmacion' || context?.context_type === 'PROCEED_REQUIRED';
  const hasPlan = Boolean(context?.implementation_plan);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-start radial-bg selection:bg-indigo-500 selection:text-white pb-24">
      <div className="w-full max-w-4xl">
        <StatusHeader
          estado={estado}
          autoApprove={autoApprove}
          isConnected={isConnected}
          onOpenSettings={() => setIsConfigOpen(true)}
          onLogout={handleLogout}
        />

        {lastActionStatus && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Acción Ejecutada: <span className="font-mono text-white">{lastActionStatus}</span>
          </div>
        )}

        <NetworkAssistantAlert
          isConnected={isConnected}
          onOpenSettings={() => setIsConfigOpen(true)}
        />

        {/* Tab 1: Control (Main Dashboard) */}
        {(activeTab === 'control') && (
          <div className="space-y-6">
            <AdaptiveContextHero
              contextType={context?.context_type || 'IDLE'}
              estado={estado}
              hasPlan={hasPlan}
              onConfirm={() => handleUpdateEstado('confirmado')}
              onOpenPlan={() => setIsPlanViewerOpen(true)}
              onOpenLiveScreen={() => setIsLiveScreenOpen(true)}
            />

            <GitHubAccountSelector
              onAccountSelected={(acc) => setLastActionStatus(`Cuenta GitHub Elegida: ${acc}`)}
            />

            <QuickActions
              autoApprove={autoApprove}
              onToggleAutoApprove={handleToggleAutoApprove}
              onSendConfirm={() => handleUpdateEstado('confirmado')}
              onGitPush={() => handleUpdateEstado('git_push')}
              onFocusWindow={() => handleUpdateEstado('focus')}
            />

            <TelemetryCard telemetry={telemetry} />
          </div>
        )}

        {/* Tab 2: Pantalla PC */}
        {(activeTab === 'screen') && (
          <div className="space-y-6">
            <div className="p-4 glass-panel rounded-3xl border-indigo-500/20 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Monitor de PC en Vivo</h3>
              <p className="text-xs text-slate-400 mb-4">Captura directa de la pantalla de Antigravity IDE</p>
              <button
                onClick={() => setIsLiveScreenOpen(true)}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Abrir Captura a Pantalla Completa 📸
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Plan Maestro */}
        {(activeTab === 'plan') && (
          <div className="space-y-6">
            <div className="p-4 glass-panel rounded-3xl border-indigo-500/20">
              <h3 className="text-lg font-bold text-white mb-2">Plan de Implementación Activo</h3>
              <div className="bg-[#070a12] p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap">
                {context?.implementation_plan || 'No hay un plan activo en este momento.'}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Prompts & Chat */}
        {(activeTab === 'prompts') && (
          <div className="space-y-6">
            <PromptInputBar />
            <PredefinedPrompts
              onSelectPrompt={(p) => setLastActionStatus(`Prompt Enviado: ${p.slice(0, 25)}...`)}
            />
            <AITerminalFeed latestAIMessage={context?.latest_ai_message || ''} />
          </div>
        )}

        {/* Tab 5: Settings */}
        {(activeTab === 'settings') && (
          <div className="space-y-6">
            <div className="p-6 glass-panel rounded-3xl border-indigo-500/20 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Configuración de Conexión</h3>
              <p className="text-xs text-slate-400 mb-4">Ajustes de Supabase Realtime y Backend Local</p>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Abrir Panel de Credenciales
              </button>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-500 pt-6 border-t border-slate-800/80 flex items-center justify-between mt-8">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Antigravity Remote Companion v3.5
          </span>
          <span>Desarrollado para @Estebanico10</span>
        </footer>
      </div>

      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        hasPlan={hasPlan}
        isActionRequired={isActionRequired}
      />

      <LiveScreenView
        isOpen={isLiveScreenOpen}
        onClose={() => setIsLiveScreenOpen(false)}
      />

      <ImplementationPlanViewer
        isOpen={isPlanViewerOpen}
        planMarkdown={context?.implementation_plan || null}
        onClose={() => setIsPlanViewerOpen(false)}
        onApprovePlan={() => handleUpdateEstado('confirmado')}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={initSync}
      />
    </div>
  );
}

export default App;
