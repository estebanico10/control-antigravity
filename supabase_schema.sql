-- ========================================================
-- Schema v2.0 de Supabase para Antigravity Remote Companion
-- ========================================================

-- 1. Tabla de Control de Estado
CREATE TABLE IF NOT EXISTS public.control_estado (
  id INT PRIMARY KEY DEFAULT 1,
  estado_actual TEXT NOT NULL DEFAULT 'inactivo',
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  last_action TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.control_estado (id, estado_actual, auto_approve, last_action)
VALUES (1, 'inactivo', false, 'INIT')
ON CONFLICT (id) DO NOTHING;

-- 2. Tabla de Telemetría (Contexto, Tokens, Tiempo)
CREATE TABLE IF NOT EXISTS public.antigravity_telemetry (
  id INT PRIMARY KEY DEFAULT 1,
  context_remaining_pct INT DEFAULT 100,
  tokens_used INT DEFAULT 0,
  total_context_limit INT DEFAULT 1000000,
  active_conversations INT DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  seconds_until_reset INT DEFAULT 86400,
  status TEXT DEFAULT 'NORMAL',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.antigravity_telemetry (id, context_remaining_pct, tokens_used)
VALUES (1, 100, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de Contexto Inteligente & Planes de Antigravity
CREATE TABLE IF NOT EXISTS public.antigravity_context (
  id INT PRIMARY KEY DEFAULT 1,
  active_conversation_id TEXT,
  context_type TEXT DEFAULT 'IDLE', -- 'PLAN_APPROVAL_NEEDED' | 'PROCEED_REQUIRED' | 'ERROR_DETECTED' | 'IDLE' | 'WORKING'
  implementation_plan TEXT,
  walkthrough TEXT,
  latest_ai_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.antigravity_context (id, context_type, latest_ai_message)
VALUES (1, 'IDLE', 'Antigravity listo en espera de comandos.')
ON CONFLICT (id) DO NOTHING;

-- 4. RLS y Permisos Públicos
ALTER TABLE public.control_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antigravity_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antigravity_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo acceso a control_estado" ON public.control_estado FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a antigravity_telemetry" ON public.antigravity_telemetry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a antigravity_context" ON public.antigravity_context FOR ALL USING (true) WITH CHECK (true);

-- 5. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.control_estado;
ALTER PUBLICATION supabase_realtime ADD TABLE public.antigravity_telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.antigravity_context;
