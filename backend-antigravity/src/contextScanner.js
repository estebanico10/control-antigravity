const fs = require('fs');
const path = require('path');
const os = require('os');

let cachedContext = null;
let lastScanTime = 0;

/**
 * Reads only the tail (last N bytes) of a file efficiently without reading the whole file into memory.
 */
function readTailText(filePath, maxBytes = 16384) {
  try {
    const stat = fs.statSync(filePath);
    const size = stat.size;
    if (size === 0) return '';

    const bytesToRead = Math.min(size, maxBytes);
    const buffer = Buffer.alloc(bytesToRead);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, bytesToRead, size - bytesToRead);
    fs.closeSync(fd);
    return buffer.toString('utf-8');
  } catch (e) {
    return '';
  }
}

/**
 * Scans local Antigravity Brain folder and active window titles efficiently.
 * Cached for 3 seconds to ensure 0% CPU freeze and ultra fast responses.
 */
function scanAntigravityContext() {
  const now = Date.now();
  if (cachedContext && (now - lastScanTime) < 3000) {
    return cachedContext;
  }

  const appDataDir = path.join(os.homedir(), '.gemini', 'antigravity-ide');
  const brainDir = path.join(appDataDir, 'brain');

  let activeConvId = null;
  let latestMtime = 0;
  let implementationPlanText = null;
  let walkthroughText = null;
  let latestAIMessage = '';
  let subagentFinishedNotice = false;
  let activeProjectTitle = 'Antigravity IDE';
  let contextType = 'IDLE';

  try {
    if (fs.existsSync(brainDir)) {
      const convs = fs.readdirSync(brainDir);
      
      // Find most recently modified conversation folder
      for (const convId of convs) {
        if (convId === 'scratch' || convId.startsWith('.')) continue;
        const folderPath = path.join(brainDir, convId);
        try {
          const stat = fs.statSync(folderPath);
          if (stat.isDirectory() && stat.mtimeMs > latestMtime) {
            latestMtime = stat.mtimeMs;
            activeConvId = convId;
          }
        } catch (e) {}
      }

      if (activeConvId) {
        const activePath = path.join(brainDir, activeConvId);

        // 1. Read Implementation Plan
        const planPath = path.join(activePath, 'implementation_plan.md');
        if (fs.existsSync(planPath)) {
          try {
            implementationPlanText = fs.readFileSync(planPath, 'utf-8');
            contextType = 'PLAN_APPROVAL_NEEDED';
          } catch (e) {}
        }

        // 2. Read Walkthrough
        const walkthroughPath = path.join(activePath, 'walkthrough.md');
        if (fs.existsSync(walkthroughPath)) {
          try {
            walkthroughText = fs.readFileSync(walkthroughPath, 'utf-8');
          } catch (e) {}
        }

        // 3. Scan Subagent Tasks in .system_generated/tasks
        const tasksDir = path.join(activePath, '.system_generated', 'tasks');
        if (fs.existsSync(tasksDir)) {
          try {
            const taskFiles = fs.readdirSync(tasksDir);
            for (const tf of taskFiles) {
              const tStat = fs.statSync(path.join(tasksDir, tf));
              if ((now - tStat.mtimeMs) < 30000) {
                subagentFinishedNotice = true;
                break;
              }
            }
          } catch (e) {}
        }

        // 4. Extract Latest AI Message from Logs using Tail Read (Fast & Memory Safe)
        const logsDir = path.join(activePath, '.system_generated', 'logs');
        const transcriptPath = path.join(logsDir, 'transcript.jsonl');
        if (fs.existsSync(transcriptPath)) {
          const tailContent = readTailText(transcriptPath, 32768);
          if (tailContent) {
            const lines = tailContent.trim().split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
              try {
                const entry = JSON.parse(lines[i]);
                if (entry.type === 'PLANNER_RESPONSE' && entry.content) {
                  latestAIMessage = entry.content.slice(-800);
                  break;
                }
              } catch (e) {}
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[ContextScanner] Error scanning context:', err.message);
  }

  if (subagentFinishedNotice || !implementationPlanText) {
    contextType = subagentFinishedNotice ? 'PROCEED_REQUIRED' : 'IDLE';
  }

  cachedContext = {
    active_conversation_id: activeConvId,
    active_project_title: activeProjectTitle,
    context_type: contextType,
    subagent_finished: subagentFinishedNotice,
    implementation_plan: implementationPlanText,
    walkthrough: walkthroughText,
    latest_ai_message: latestAIMessage || 'Antigravity listo en espera de comandos.',
    updated_at: new Date().toISOString()
  };

  lastScanTime = now;
  return cachedContext;
}

module.exports = {
  scanAntigravityContext
};
