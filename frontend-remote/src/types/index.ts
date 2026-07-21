export type EstadoActual = 
  | 'inactivo' 
  | 'procesando' 
  | 'requiere_confirmacion' 
  | 'confirmado' 
  | 'focus' 
  | 'git_push';

export interface ControlEstado {
  id: number;
  estado_actual: EstadoActual;
  auto_approve: boolean;
  last_action?: string;
  updated_at: string;
}

export interface TelemetryData {
  context_remaining_pct: number;
  tokens_used: number;
  total_context_limit: number;
  active_conversations: number;
  last_active: string;
  seconds_until_reset: number;
  status: 'NORMAL' | 'LOW_CONTEXT';
  updated_at?: string;
}
