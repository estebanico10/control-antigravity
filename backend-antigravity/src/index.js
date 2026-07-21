require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const localtunnel = require('localtunnel');
const { createClient } = require('@supabase/supabase-js');
const { focusAntigravityWindow, confirmAction, selectGitHubAccount, gitCommitAndPush } = require('./windowManager');
const { getAntigravityTelemetry } = require('./telemetryScanner');
const { captureAntigravityScreen } = require('./screenCapture');
const { scanAntigravityContext } = require('./contextScanner');
const { injectTextToAntigravity } = require('./textInjector');
const { injectImageToAntigravity } = require('./imageInjector');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-Memory State Backup (standalone local usage)
let localState = {
  id: 1,
  estado_actual: 'inactivo',
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
  console.log('[Supabase] Running in local standalone mode.');
}

/**
 * Get Local IPv4 Address
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!iface.address.startsWith('172.')) {
          return iface.address;
        }
      }
    }
  }
  return '192.168.1.18';
}

/**
 * Handle Remote State Changes & Trigger Physical Windows Automation
 */
async function processStateTrigger(newState, source = 'local', extraPayload = {}) {
  console.log(`[StateTrigger] State changed to "${newState}" (Source: ${source})`);

  if (newState === 'confirmado' || newState === 'proceed' || newState === 'approve_plan') {
    console.log('[Automation] Confirm/Proceed action requested! Focusing window & clicking Proceed...');
    await focusAntigravityWindow();
    await confirmAction();
    updateState('procesando', { last_action: 'PROCEED_CONFIRMED' });
  } else if (newState === 'select_github') {
    const accName = extraPayload.account_name || 'estebanico10';
    console.log(`[Automation] Selecting GitHub Account: ${accName}...`);
    await selectGitHubAccount(accName);
    updateState('procesando', { last_action: `GITHUB_ACC_SELECTED_${accName}` });
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
    .subscribe();
}

// Interval: Sync Telemetry & Context Scanner (every 5s)
setInterval(async () => {
  const telemetry = getAntigravityTelemetry();
  const context = scanAntigravityContext();

  if (supabase) {
    try {
      await supabase.from('antigravity_telemetry').upsert({
        id: 1,
        ...telemetry,
        updated_at: new Date().toISOString()
      });

      await supabase.from('antigravity_context').upsert({
        id: 1,
        ...context,
        updated_at: new Date().toISOString()
      });
    } catch (err) {}
  }
}, 5000);

// Local REST API Endpoints
app.get('/api/status', (req, res) => {
  const telemetry = getAntigravityTelemetry();
  const context = scanAntigravityContext();
  res.json({
    state: localState,
    telemetry,
    context
  });
});

app.get('/api/context', (req, res) => {
  const context = scanAntigravityContext();
  res.json(context);
});

app.get('/api/screenshot', async (req, res) => {
  const screenshotResult = await captureAntigravityScreen();
  res.json(screenshotResult);
});

app.post('/api/inject-text', async (req, res) => {
  const { text } = req.body;
  const result = await injectTextToAntigravity(text);
  res.json(result);
});

app.post('/api/inject-image', async (req, res) => {
  const { image } = req.body;
  const result = await injectImageToAntigravity(image);
  res.json(result);
});

app.post('/api/select-github-account', async (req, res) => {
  const { account_name } = req.body;
  const result = await selectGitHubAccount(account_name || 'estebanico10');
  res.json(result);
});

app.post('/api/action', async (req, res) => {
  const { action, auto_approve, account_name } = req.body;

  if (auto_approve !== undefined) {
    localState.auto_approve = Boolean(auto_approve);
  }

  if (action) {
    await processStateTrigger(action, 'http_api', { account_name });
  } else {
    await updateState(localState.estado_actual);
  }

  res.json({ success: true, state: localState });
});

const localIp = getLocalIpAddress();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🤖 Antigravity Remote Backend Daemon v5.5 running!`);
  console.log(`🔑 Default Login User: Estebanico10`);
  console.log(`----------------------------------------------------`);
  console.log(`📶 Wi-Fi IP Local: http://${localIp}:${PORT}`);

  // Non-blocking background tunnel start with 4s timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Tunnel connection timeout')), 4000)
  );

  Promise.race([localtunnel({ port: PORT }), timeoutPromise])
    .then((tunnel) => {
      console.log(`🌐 TÚNEL MUNDIAL AUTOMÁTICO: ${tunnel.url}`);
      console.log(`   (Pega este enlace en la app de tu celular para conectarte desde 4G/5G)`);
      console.log(`====================================================`);
    })
    .catch(() => {
      console.log(`🌐 Túnel local listo para Wi-Fi en http://${localIp}:${PORT}`);
      console.log(`====================================================`);
    });
});
