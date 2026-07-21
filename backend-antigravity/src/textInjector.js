const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Runs a PowerShell script using UTF-16LE Base64 encoding.
 */
async function runPowerShellScript(scriptText) {
  const encodedScript = Buffer.from(scriptText, 'utf16le').toString('base64');
  const command = `powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedScript}`;
  const { stdout } = await execPromise(command);
  return stdout.trim();
}

/**
 * Focuses the target Antigravity IDE project window and injects user prompt text
 * into the chat box using PowerShell Clipboard paste (SetText + Ctrl+V + Enter).
 */
async function injectTextToAntigravity(textToInject) {
  if (!textToInject || typeof textToInject !== 'string') {
    return { success: false, error: 'Text string required' };
  }

  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    $wshell = New-Object -ComObject wscript.shell;

    $processes = Get-Process | Where-Object { 
      ($_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*') -and 
      ($_.MainWindowTitle -notlike '*Control Antigravity*')
    };

    if (-not $processes) {
      $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' };
    }

    if ($processes) {
      $wshell.AppActivate($processes[0].Id);
      Start-Sleep -Milliseconds 250;

      [System.Windows.Forms.Clipboard]::SetText('${textToInject.replace(/'/g, "''")}');
      Start-Sleep -Milliseconds 100;
      [System.Windows.Forms.SendKeys]::SendWait('^v');
      Start-Sleep -Milliseconds 150;
      [System.Windows.Forms.SendKeys]::SendWait('{ENTER}');

      Write-Output "TEXT_INJECTED_SUCCESSFULLY";
    } else {
      Write-Output "WINDOW_NOT_FOUND";
    }
  `;

  try {
    const stdout = await runPowerShellScript(psScript);
    console.log('[TextInjector]', stdout);
    return { success: stdout.includes('TEXT_INJECTED_SUCCESSFULLY') };
  } catch (error) {
    console.error('[TextInjector] Error injecting text:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  injectTextToAntigravity
};
