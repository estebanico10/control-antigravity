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
 * Captures a cropped screenshot of the active target Antigravity IDE project window,
 * ignoring the daemon window itself.
 */
async function captureAntigravityScreen() {
  const tempImgPath = path.join(os.tmpdir(), `antigravity_screen_${Date.now()}.jpg`).replace(/\\/g, '/');
  
  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms;
    Add-Type -AssemblyName System.Drawing;

    $signature = @'
      [DllImport("user32.dll")]
      public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
      public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
      }
'@
    $win32 = Add-Type -MemberDefinition $signature -Name "Win32Utils" -Namespace "Win32" -PassThru;

    $wshell = New-Object -ComObject wscript.shell;
    
    # 1. Target active work project window, ignoring Control Antigravity daemon window
    $processes = Get-Process | Where-Object { 
      ($_.MainWindowTitle -like '*Antigravity*' -or $_.MainWindowTitle -like '*Visual Studio Code*' -or $_.MainWindowTitle -like '*Cursor*') -and 
      ($_.MainWindowTitle -notlike '*Control Antigravity*')
    };

    if (-not $processes) {
      $processes = Get-Process | Where-Object { $_.MainWindowTitle -like '*Antigravity*' };
    }

    if ($processes -and $processes[0].MainWindowHandle -ne [IntPtr]::Zero) {
      $targetProc = $processes[0];
      $wshell.AppActivate($targetProc.Id);
      Start-Sleep -Milliseconds 200;

      $rect = New-Object Win32.Win32Utils+RECT;
      $win32::GetWindowRect($targetProc.MainWindowHandle, [ref]$rect);

      $width = [Math]::Max(100, $rect.Right - $rect.Left);
      $height = [Math]::Max(100, $rect.Bottom - $rect.Top);

      $bmp = New-Object System.Drawing.Bitmap($width, $height);
      $graphics = [System.Drawing.Graphics]::FromImage($bmp);
      $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, (New-Object System.Drawing.Size($width, $height)));

      $bmp.Save('${tempImgPath}', [System.Drawing.Imaging.ImageFormat]::Jpeg);
      $graphics.Dispose();
      $bmp.Dispose();
      Write-Output "CROPPED_WINDOW_SCREENSHOT_SAVED";
    } else {
      # Fallback to full screen if no specific window found
      $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds;
      $bmp = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height);
      $graphics = [System.Drawing.Graphics]::FromImage($bmp);
      $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size);
      $bmp.Save('${tempImgPath}', [System.Drawing.Imaging.ImageFormat]::Jpeg);
      $graphics.Dispose();
      $bmp.Dispose();
      Write-Output "FULLSCREEN_FALLBACK_SAVED";
    }
  `;

  try {
    const stdout = await runPowerShellScript(psScript);
    console.log('[ScreenCapture]', stdout);

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
