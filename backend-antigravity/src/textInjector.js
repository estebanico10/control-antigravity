const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Focuses the target Antigravity IDE project window and injects user prompt text
 * into the chat box using PowerShell Clipboard paste (SetText + Ctrl+V + Enter).
 */
async function injectTextToAntigravity(textToInject) {
  if (!textToInject || typeof textToInject !== 'string') {
    return { success: false, error: 'Text string required' };
  }

  // Escape text for PowerShell string
  const safeText = textToInject.replace(/"/g, '`"');

  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    $wshell = New-Object -ComObject wscript.shell;

    # Target work project window excluding Control Antigravity daemon window
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

      # Set text to Clipboard and paste with Ctrl+V
      [System.Windows.Forms.Clipboard]::SetText("${safeText}");
      Start-Sleep -Milliseconds 100;
      [System.Windows.Forms.SendKeys]::SendWait("^v");
      Start-Sleep -Milliseconds 150;
      [System.Windows.Forms.SendKeys]::SendWait("{ENTER}");

      Write-Output "TEXT_INJECTED_SUCCESSFULLY";
    } else {
      Write-Output "WINDOW_NOT_FOUND";
    }
  `;

  try {
    const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, ' ')}"`;
    const { stdout } = await execPromise(command);
    console.log('[TextInjector]', stdout.trim());
    return { success: stdout.includes('TEXT_INJECTED_SUCCESSFULLY') };
  } catch (error) {
    console.error('[TextInjector] Error injecting text:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  injectTextToAntigravity
};
