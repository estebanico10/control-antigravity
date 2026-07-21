const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Scans local Antigravity Brain folder and active window titles to determine
 * exact project name, conversation context, and AI messages.
 */
function scanAntigravityContext() {
  const appDataDir = path.join(os.homedir(), '.gemini', 'antigravity-ide');
  const brainDir = path.join(appDataDir, 'brain');

  let activeConvId = null;
  let latestMtime = 0;
  let implementationPlanText = null;
  let walkthroughText = null;
  let latestAIMessage = '';
  let subagentFinishedNotice = false;
  let activeProjectTitle = 'Antigravity IDE';
  let contextType = 'IDLE'; // 'PLAN_APPROVAL_NEEDED' | 'PROCEED_REQUIRED' | 'ERROR_DETECTED' | 'IDLE' | 'WORKING'

  try {
    if (fs.existsSync(brainDir)) {
      const convs = fs.readdirSync(brainDir);
      
      // Find most recently modified conversation folder
      convs.forEach(convId => {
        const folderPath = path.join(brainDir, convId);
        if (fs.statSync(folderPath).isDirectory() && convId !== 'scratch') {
          const stat = fs.statSync(folderPath);
          if (stat.mtimeMs > latestMtime) {
            latestMtime = stat.mtimeMs;
            activeConvId = convId;
          }
        }
      });

      if (activeConvId) {
        const activePath = path.join(brainDir, activeConvId);

        // 1. Read Implementation Plan
        const planPath = path.join(activePath, 'implementation_plan.md');
        if (fs.existsSync(planPath)) {
          implementationPlanText = fs.readFileSync(planPath, 'utf-8');
          contextType = 'PLAN_APPROVAL_NEEDED';
        }

        // 2. Read Walkthrough
        const walkthroughPath = path.join(activePath, 'walkthrough.md');
        if (fs.existsSync(walkthroughPath)) {
          walkthroughText = fs.readFileSync(walkthroughPath, 'utf-8');
        }

        // 3. Scan Subagent Tasks in .system_generated/tasks
        const tasksDir = path.join(activePath, '.system_generated', 'tasks');
        if (fs.existsSync(tasksDir)) {
          const taskFiles = fs.readdirSync(tasksDir);
          const now = Date.now();
          taskFiles.forEach(tf => {
            const tStat = fs.statSync(path.join(tasksDir, tf));
            if ((now - tStat.mtimeMs) < 30000) {
              subagentFinishedNotice = true;
            }
          });
        }

        // 4. Extract Latest AI Message from Logs
        const logsDir = path.join(activePath, '.system_generated', 'logs');
        if (fs.existsSync(logsDir)) {
          const transcriptPath = path.join(logsDir, 'transcript.jsonl');
          if (fs.existsSync(transcriptPath)) {
            const lines = fs.readFileSync(transcriptPath, 'utf-8').trim().split('\n');
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

  return {
    active_conversation_id: activeConvId,
    active_project_title: activeProjectTitle,
    context_type: contextType,
    subagent_finished: subagentFinishedNotice,
    implementation_plan: implementationPlanText,
    walkthrough: walkthroughText,
    latest_ai_message: latestAIMessage || 'Antigravity listo en espera de comandos.',
    updated_at: new Date().toISOString()
  };
}

module.exports = {
  scanAntigravityContext
};
