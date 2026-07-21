const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Places a JPG/PNG image buffer into the Windows Clipboard and pastes it (Ctrl+V) into Antigravity IDE.
 */
async function injectImageToAntigravity(base64ImageStr) {
  if (!base64ImageStr || typeof base64ImageStr !== 'string') {
    return { success: false, error: 'Base64 image string required' };
  }

  // Remove header data URL if present
  const base64Data = base64ImageStr.replace(/^data:image\/\w+;base64,/, '');
  const tempImgPath = path.join(os.tmpdir(), `remote_upload_${Date.now()}.jpg`);

  try {
    fs.writeFileSync(tempImgPath, Buffer.from(base64Data, 'base64'));

    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms;
      Add-Type -AssemblyName System.Drawing;

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

        $img = [System.Drawing.Image]::FromFile("${tempImgPath.replace(/\\/g, '/')}");
        [System.Windows.Forms.Clipboard]::SetImage($img);
        Start-Sleep -Milliseconds 150;
        [System.Windows.Forms.SendKeys]::SendWait("^v");
        $img.Dispose();
        Write-Output "IMAGE_PASTED_SUCCESSFULLY";
      } else {
        Write-Output "WINDOW_NOT_FOUND";
      }
    `;

    const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, ' ')}"`;
    const { stdout } = await execPromise(command);
    
    // Clean up temporary image file after 2s
    setTimeout(() => {
      try { fs.unlinkSync(tempImgPath); } catch (e) {}
    }, 2000);

    return { success: stdout.includes('IMAGE_PASTED_SUCCESSFULLY') };
  } catch (err) {
    console.error('[ImageInjector] Error injecting image:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  injectImageToAntigravity
};
