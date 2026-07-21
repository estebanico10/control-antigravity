-- ========================================================
-- Schema de Supabase para Antigravity Remote Companion
-- Copia y ejecuta esto en el SQL Editor de tu proyecto Supabase
-- ========================================================

-- 1. Tabla de Control de Estado
CREATE TABLE IF NOT EXISTS public.control_estado (
  id INT PRIMARY KEY DEFAULT 1,
  estado_actual TEXT NOT NULL DEFAULT 'inactivo',
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  last_action TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar registro inicial id = 1
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

-- Asegurar registro inicial id = 1
INSERT INTO public.antigravity_telemetry (id, context_remaining_pct, tokens_used)
VALUES (1, 100, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar RLS y políticas públicas para desarrollo sin fricción
ALTER TABLE public.control_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antigravity_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo acceso a control_estado" ON public.control_estado
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo acceso a antigravity_telemetry" ON public.antigravity_telemetry
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.control_estado;
ALTER PUBLICATION supabase_realtime ADD TABLE public.antigravity_telemetry;
