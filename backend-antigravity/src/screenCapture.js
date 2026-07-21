const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');
const path = require('path');
const os = require('os');

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
 * Captures a screenshot of the active Antigravity IDE window (or primary screen fallback)
 * and returns a JPEG base64 string.
 */
async function captureAntigravityScreen() {
  const tempImgPath = path.join(os.tmpdir(), `antigravity_screen_${Date.now()}.jpg`).replace(/\\/g, '/');
  
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
      Start-Sleep -Milliseconds 150;
    }

    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds;
    $bmp = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height);
    $graphics = [System.Drawing.Graphics]::FromImage($bmp);
    $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size);
    
    $bmp.Save('${tempImgPath}', [System.Drawing.Imaging.ImageFormat]::Jpeg);
    $graphics.Dispose();
    $bmp.Dispose();
    Write-Output "SCREENSHOT_SAVED";
  `;

  try {
    await runPowerShellScript(psScript);

    if (fs.existsSync(tempImgPath)) {
      const imgBuffer = fs.readFileSync(tempImgPath);
      const base64Data = imgBuffer.toString('base64');
      
      // Clean up temporary image file
      try { fs.unlinkSync(tempImgPath); } catch (e) {}

      return {
        success: true,
        image_base64: `data:image/jpeg;base64,${base64Data}`,
        timestamp: new Date().toISOString()
      };
    }
    return { success: false, error: 'File not generated' };
  } catch (err) {
    console.error('[ScreenCapture] Error capturing screen:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  captureAntigravityScreen
};
