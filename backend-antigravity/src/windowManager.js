const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Focuses the Antigravity or active IDE window on Windows
 */
async function focusAntigravityWindow() {
  const psScript = `
    $wshell = New-Object -ComObject wscript.shell;
    $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*' };
    if ($processes) {
      $wshell.AppActivate($processes[0].Id);
      Write-Output "FOCUSED: $($processes[0].MainWindowTitle)";
    } else {
      Write-Output "WINDOW_NOT_FOUND";
    }
  `;

  try {
    const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, ' ')}"`;
    const { stdout } = await execPromise(command);
    console.log('[WindowManager]', stdout.trim());
    return stdout.includes('FOCUSED');
  } catch (error) {
    console.error('[WindowManager] Error focusing window:', error.message);
    return false;
  }
}

/**
 * Confirms an action by bringing window to focus and sending {ENTER} key stroke
 */
async function confirmAction() {
  const psScript = `
    $wshell = New-Object -ComObject wscript.shell;
    $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*' };
    if ($processes) {
      $wshell.AppActivate($processes[0].Id);
      Start-Sleep -Milliseconds 150;
      Add-Type -AssemblyName System.Windows.Forms;
      [System.Windows.Forms.SendKeys]::SendWait("{ENTER}");
      Write-Output "CONFIRMED_ENTER";
    } else {
      Add-Type -AssemblyName System.Windows.Forms;
      [System.Windows.Forms.SendKeys]::SendWait("{ENTER}");
      Write-Output "CONFIRMED_FALLBACK_ENTER";
    }
  `;

  try {
    const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, ' ')}"`;
    const { stdout } = await execPromise(command);
    console.log('[WindowManager]', stdout.trim());
    return true;
  } catch (error) {
    console.error('[WindowManager] Error confirming action:', error.message);
    return false;
  }
}

/**
 * Executes git add, commit, and push on the specified directory
 */
async function gitCommitAndPush(targetDir = process.cwd(), commitMsg = 'Auto update via Antigravity Remote') {
  try {
    console.log(`[GitHelper] Running git commit & push in ${targetDir}...`);
    const { stdout: statusOut } = await execPromise(`git status --porcelain`, { cwd: targetDir });
    
    // Always add files
    await execPromise(`git add .`, { cwd: targetDir });

    const safeMsg = commitMsg.replace(/"/g, '\\"');
    try {
      await execPromise(`git commit -m "${safeMsg}"`, { cwd: targetDir });
    } catch (e) {
      console.log('[GitHelper] Commit notice (maybe nothing to commit):', e.message);
    }

    const { stdout: pushOut } = await execPromise(`git push`, { cwd: targetDir });
    console.log('[GitHelper] Push output:', pushOut);
    return { success: true, message: 'Git commit & push successful' };
  } catch (error) {
    console.error('[GitHelper] Error executing git push:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  focusAntigravityWindow,
  confirmAction,
  gitCommitAndPush
};
