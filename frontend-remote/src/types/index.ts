export type EstadoActual = 
  | 'inactivo' 
  | 'procesando' 
  | 'requiere_confirmacion' 
  | 'confirmado' 
  | 'focus' 
  | 'git_push'
  | 'proceed'
  | 'approve_plan';

export type ContextType = 
  | 'PLAN_APPROVAL_NEEDED'
  | 'PROCEED_REQUIRED'
  | 'ERROR_DETECTED'
  | 'WAITING_USER_INPUT'
  | 'WORKING'
  | 'IDLE';

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

export interface AntigravityContext {
  active_conversation_id?: string;
  context_type: ContextType;
  implementation_plan?: string;
  walkthrough?: string;
  latest_ai_message: string;
  updated_at?: string;
}
