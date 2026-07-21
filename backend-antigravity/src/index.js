require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { focusAntigravityWindow, confirmAction, gitCommitAndPush } = require('./windowManager');
const { getAntigravityTelemetry } = require('./telemetryScanner');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory State Backup (for standalone / direct local usage)
let localState = {
  id: 1,
  estado_actual: 'inactivo', // 'inactivo' | 'procesando' | 'requiere_confirmacion' | 'confirmado'
  auto_approve: false,
  last_action: null,
  updated_at: new Date().toISOString()
};

// Supabase Setup
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[Supabase] Client initialized successfully.');
  } catch (err) {
    console.warn('[Supabase] Could not initialize client:', err.message);
  }
} else {
  console.log('[Supabase] Running in local standalone mode. Set SUPABASE_URL and SUPABASE_KEY in .env for Cloud Realtime.');
}

/**
 * Handle Remote State Changes & Trigger Physical Windows Automation
 */
async function processStateTrigger(newState, source = 'local') {
  console.log(`[StateTrigger] State changed to "${newState}" (Source: ${source})`);

  if (newState === 'confirmado') {
    console.log('[Automation] Confirm action requested! Focusing window & sending ENTER...');
    await focusAntigravityWindow();
    await confirmAction();
    
    // Reset state to processing
    updateState('procesando', { last_action: 'CONFIRMED' });
  } else if (newState === 'focus') {
    console.log('[Automation] Window focus requested!');
    await focusAntigravityWindow();
    updateState('procesando', { last_action: 'FOCUSED_WINDOW' });
  } else if (newState === 'git_push') {
    console.log('[Automation] Git commit & push requested!');
    const result = await gitCommitAndPush();
    updateState('procesando', { last_action: result.success ? 'GIT_PUSH_SUCCESS' : 'GIT_PUSH_FAILED' });
  } else if (newState === 'requiere_confirmacion' && localState.auto_approve) {
    console.log('[Automation] Auto-Approve active! Auto-confirming immediately...');
    await confirmAction();
    updateState('procesando', { last_action: 'AUTO_APPROVED' });
  }
}

/**
 * Synchronize State locally and to Supabase
 */
async function updateState(estadoActual, extra = {}) {
  localState = {
    ...localState,
    ...extra,
    estado_actual: estadoActual,
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('control_estado').upsert({
        id: 1,
        estado_actual: localState.estado_actual,
        auto_approve: localState.auto_approve,
        last_action: localState.last_action,
        updated_at: localState.updated_at
      });
    } catch (err) {
      console.error('[Supabase] Error updating state:', err.message);
    }
  }
}

// Subscribe to Supabase Realtime changes
if (supabase) {
  supabase
    .channel('antigravity_control_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'control_estado' }, (payload) => {
      console.log('[Supabase Realtime Event]', payload.new);
      if (payload.new && payload.new.estado_actual) {
        if (payload.new.auto_approve !== undefined) {
          localState.auto_approve = payload.new.auto_approve;
        }
        processStateTrigger(payload.new.estado_actual, 'supabase_realtime');
      }
    })
    .subscribe((status) => {
      console.log('[Supabase Realtime Status]', status);
    });
}

// Interval: Telemetry & Log Monitor (every 5s)
setInterval(async () => {
  const telemetry = getAntigravityTelemetry();

  if (supabase) {
    try {
      await supabase.from('antigravity_telemetry').upsert({
        id: 1,
        ...telemetry,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      // Ignore transient errors
    }
  }
}, 5000);

// Local REST API Endpoints
app.get('/api/status', (req, res) => {
  const telemetry = getAntigravityTelemetry();
  res.json({
    state: localState,
    telemetry
  });
});

app.post('/api/action', async (req, res) => {
  const { action, auto_approve } = req.body;

  if (auto_approve !== undefined) {
    localState.auto_approve = Boolean(auto_approve);
  }

  if (action) {
    await processStateTrigger(action, 'http_api');
  } else {
    await updateState(localState.estado_actual);
  }

  res.json({ success: true, state: localState });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🤖 Antigravity Remote Backend Daemon running on http://localhost:${PORT}`);
  console.log(`🔑 Default Login User: Estebanico10`);
  console.log(`====================================================`);
});
