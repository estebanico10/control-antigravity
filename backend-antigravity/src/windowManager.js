const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Focuses the correct active Antigravity IDE project window, excluding the daemon window itself.
 */
async function focusAntigravityWindow() {
  const psScript = `
    $wshell = New-Object -ComObject wscript.shell;
    # Get all IDE windows excluding the Control Antigravity daemon window
    $processes = Get-Process | Where-Object { 
      ($_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*') -and 
      ($_.MainWindowTitle -notlike '*Control Antigravity*')
    };

    if (-not $processes) {
      # Fallback: take any process if no excluded ones match
      $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' -and $_.MainWindowTitle -notlike '*backend-antigravity*' };
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
 * Confirms an action by focusing the target IDE window, searching for the 'Proceed' UI button,
 * and performing a UI Automation invocation, mouse click, and keyboard shortcut (Ctrl+Enter / Enter).
 */
async function confirmAction() {
  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    Add-Type -AssemblyName UIAutomationClient;
    Add-Type -AssemblyName UIAutomationTypes;

    $wshell = New-Object -ComObject wscript.shell;
    
    # 1. Target the work project window, ignoring Control Antigravity daemon window
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

      # 2. Search for UI Automation Element ('Proceed', 'Allow', 'Proceder', 'Aceptar')
      $clickedByUI = $false;
      try {
        $rootElem = [System.Windows.Automation.AutomationElement]::FromHandle($targetProc.MainWindowHandle);
        if ($rootElem) {
          $condition = New-Object System.Windows.Automation.OrCondition(
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, "Proceed")),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, "Allow")),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, "Proceder")),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, "Aceptar"))
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
      } catch {
        Write-Output "UI_AUTOMATION_SEARCH_ERR: $($_.Exception.Message)";
      }

      # 3. Send Ctrl+Enter and ENTER keystroke as guaranteed fallback
      [System.Windows.Forms.SendKeys]::SendWait("^{ENTER}");
      Start-Sleep -Milliseconds 100;
      [System.Windows.Forms.SendKeys]::SendWait("{ENTER}");

      if ($clickedByUI) {
        Write-Output "CONFIRMED_VIA_UI_AND_SHORTCUT";
      } else {
        Write-Output "CONFIRMED_VIA_KEYBOARD_SHORTCUT";
      }
    } else {
      [System.Windows.Forms.SendKeys]::SendWait("^{ENTER}");
      [System.Windows.Forms.SendKeys]::SendWait("{ENTER}");
      Write-Output "CONFIRMED_FALLBACK_SHORTCUT";
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
