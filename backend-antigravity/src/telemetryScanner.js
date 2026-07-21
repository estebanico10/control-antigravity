const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Scans local Antigravity directories to calculate current context usage and telemetry metrics.
 */
function getAntigravityTelemetry() {
  const appDataDir = path.join(os.homedir(), '.gemini', 'antigravity-ide');
  const brainDir = path.join(appDataDir, 'brain');

  let activeConversationsCount = 0;
  let totalLogsSize = 0;
  let lastActiveTimestamp = new Date().toISOString();

  try {
    if (fs.existsSync(brainDir)) {
      const convs = fs.readdirSync(brainDir);
      activeConversationsCount = convs.length;

      // Scan log files for activity
      convs.forEach(convId => {
        const logsDir = path.join(brainDir, convId, '.system_generated', 'logs');
        if (fs.existsSync(logsDir)) {
          const logFiles = fs.readdirSync(logsDir);
          logFiles.forEach(file => {
            const stat = fs.statSync(path.join(logsDir, file));
            totalLogsSize += stat.size;
            if (stat.mtime > new Date(lastActiveTimestamp)) {
              lastActiveTimestamp = stat.mtime.toISOString();
            }
          });
        }
      });
    }
  } catch (err) {
    console.error('[TelemetryScanner] Error scanning brain directory:', err.message);
  }

  // Simulated / Estimated token calculations based on active session activity
  // Context window is typically 1,000,000 to 2,000,000 tokens for Gemini 3.6 / Flash models
  const totalContextLimit = 1000000; 
  const estimatedTokensUsed = Math.min(Math.round(totalLogsSize / 3.5), 850000); 
  const contextRemainingPct = Math.max(5, Math.round(((totalContextLimit - estimatedTokensUsed) / totalContextLimit) * 100));
  
  // Calculate next reset time (e.g., daily rolling window or hourly reset)
  const now = new Date();
  const resetTime = new Date(now);
  resetTime.setHours(24, 0, 0, 0); // Next midnight
  const secondsUntilReset = Math.round((resetTime - now) / 1000);

  return {
    context_remaining_pct: contextRemainingPct,
    tokens_used: estimatedTokensUsed,
    total_context_limit: totalContextLimit,
    active_conversations: activeConversationsCount,
    last_active: lastActiveTimestamp,
    seconds_until_reset: secondsUntilReset,
    status: contextRemainingPct < 15 ? 'LOW_CONTEXT' : 'NORMAL'
  };
}

module.exports = {
  getAntigravityTelemetry
};
