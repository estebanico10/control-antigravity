const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Runs a PowerShell script using UTF-16LE Base64 encoding to prevent all command line string escaping errors.
 */
async function runPowerShellScript(scriptText) {
  const encodedScript = Buffer.from(scriptText, 'utf16le').toString('base64');
  const command = `powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedScript}`;
  const { stdout, stderr } = await execPromise(command);
  if (stderr && stderr.trim()) {
    console.warn('[PowerShell Warning]', stderr.trim());
  }
  return stdout.trim();
}

/**
 * Focuses the correct active Antigravity IDE project window, excluding the daemon window itself.
 */
async function focusAntigravityWindow() {
  const psScript = `
    $wshell = New-Object -ComObject wscript.shell;
    $processes = Get-Process | Where-Object { 
      ($_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*') -and 
      ($_.MainWindowTitle -notlike '*Control Antigravity*')
    };

    if (-not $processes) {
      $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' };
    }

    if ($processes) {
      $targetProc = $processes[0];
      $wshell.AppActivate($targetProc.Id);
      Write-Output "FOCUSED: $($targetProc.MainWindowTitle)";
    } else {
      Write-Output "WINDOW_NOT_FOUND";
    }
  `;

  try {
    const stdout = await runPowerShellScript(psScript);
    console.log('[WindowManager]', stdout);
    return stdout.includes('FOCUSED');
  } catch (error) {
    console.error('[WindowManager] Error focusing window:', error.message);
    return false;
  }
}

/**
 * Selects a specific GitHub account ('estebanico10', 'iecejerusalen-eng', 'naomyalvarado2026')
 * in the VS Code / Antigravity modal and clicks the 'Continue' button.
 */
async function selectGitHubAccount(accountName = 'estebanico10') {
  const safeAccountName = accountName.replace(/'/g, '');

  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    Add-Type -AssemblyName UIAutomationClient;
    Add-Type -AssemblyName UIAutomationTypes;

    $wshell = New-Object -ComObject wscript.shell;
    $processes = Get-Process | Where-Object { 
      ($_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*') -and 
      ($_.MainWindowTitle -notlike '*Control Antigravity*')
    };

    if (-not $processes) {
      $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' };
    }

    if ($processes) {
      $targetProc = $processes[0];
      $wshell.AppActivate($targetProc.Id);
      Start-Sleep -Milliseconds 200;

      $selected = $false;
      try {
        $rootElem = [System.Windows.Automation.AutomationElement]::FromHandle($targetProc.MainWindowHandle);
        if ($rootElem) {
          # 1. Search account element matching accountName
          $accCond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, '${safeAccountName}');
          $accElem = $rootElem.FindFirst([System.Windows.Automation.TreeScope]::Subtree, $accCond);

          if ($accElem) {
            $invokeAcc = $accElem.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern);
            if ($invokeAcc) { $invokeAcc.Invoke(); }
            $selected = $true;
            Write-Output "SELECTED_ACCOUNT: ${safeAccountName}";
          }

          Start-Sleep -Milliseconds 150;

          # 2. Search & click 'Continue' button
          $contCond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Continue');
          $contBtn = $rootElem.FindFirst([System.Windows.Automation.TreeScope]::Subtree, $contCond);

          if ($contBtn) {
            $invokeCont = $contBtn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern);
            if ($invokeCont) { $invokeCont.Invoke(); }
            Write-Output "CLICKED_CONTINUE_BUTTON";
          }
        }
      } catch {
        Write-Output "UI_AUTOMATION_ERR: $($_.Exception.Message)";
      }

      # Guaranteed Fallback: Send ENTER
      [System.Windows.Forms.SendKeys]::SendWait('{ENTER}');
      Write-Output "ACCOUNT_SELECTION_EXECUTED";
    }
  `;

  try {
    const stdout = await runPowerShellScript(psScript);
    console.log('[WindowManager]', stdout);
    return { success: true, message: stdout };
  } catch (error) {
    console.error('[WindowManager] Error selecting account:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Confirms an action by focusing the target IDE window, searching for the 'Proceed' UI button,
 * and performing a UI Automation invocation, mouse click, and keyboard shortcut (Ctrl+Enter / Enter).
 */
async function confirmAction() {
  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    Add-Type -AssemblyName UIAutomationClient;
    Add-Type -AssemblyName UIAutomationTypes;

    $wshell = New-Object -ComObject wscript.shell;
    $processes = Get-Process | Where-Object { 
      ($_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*') -and 
      ($_.MainWindowTitle -notlike '*Control Antigravity*')
    };

    if (-not $processes) {
      $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' };
    }

    if ($processes) {
      $targetProc = $processes[0];
      $wshell.AppActivate($targetProc.Id);
      Start-Sleep -Milliseconds 250;

      $clickedByUI = $false;
      try {
        $rootElem = [System.Windows.Automation.AutomationElement]::FromHandle($targetProc.MainWindowHandle);
        if ($rootElem) {
          $condition = New-Object System.Windows.Automation.OrCondition(
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Proceed')),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Allow')),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Proceder')),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Aceptar'))
          );

          $buttons = $rootElem.FindAll([System.Windows.Automation.TreeScope]::Subtree, $condition);
          if ($buttons -and $buttons.Count -gt 0) {
            foreach ($btn in $buttons) {
              try {
                $invokePattern = $btn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern);
                if ($invokePattern) {
                  $invokePattern.Invoke();
                  $clickedByUI = $true;
                  Write-Output "INVOKED_UI_BUTTON: $($btn.Current.Name)";
                  break;
                }
              } catch {}
            }
          }
        }
      } catch {}

      [System.Windows.Forms.SendKeys]::SendWait('^{ENTER}');
      Start-Sleep -Milliseconds 150;
      [System.Windows.Forms.SendKeys]::SendWait('{ENTER}');

      if ($clickedByUI) {
        Write-Output "CONFIRMED_VIA_UI_AND_SHORTCUT";
      } else {
        Write-Output "CONFIRMED_VIA_KEYBOARD_SHORTCUT";
      }
    } else {
      [System.Windows.Forms.SendKeys]::SendWait('^{ENTER}');
      [System.Windows.Forms.SendKeys]::SendWait('{ENTER}');
      Write-Output "CONFIRMED_FALLBACK_SHORTCUT";
    }
  `;

  try {
    const stdout = await runPowerShellScript(psScript);
    console.log('[WindowManager]', stdout);
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
  selectGitHubAccount,
  gitCommitAndPush
};
