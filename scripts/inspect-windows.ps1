Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  public class WinUtils {
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);
    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  }
"@

$targetPid = (Get-Process -Name PBIDesktop -ErrorAction SilentlyContinue | Select-Object -First 1).Id
Write-Host "Target PBIDesktop PID: $targetPid"

$windows = New-Object System.Collections.Generic.List[Object]
[WinUtils]::EnumWindows({
  param($hWnd, $lParam)
  $pid = 0
  [WinUtils]::GetWindowThreadProcessId($hWnd, [ref]$pid) | Out-Null
  if ($pid -eq $targetPid) {
    $len = [WinUtils]::GetWindowTextLength($hWnd)
    $sb = New-Object System.Text.StringBuilder ($len + 1)
    [WinUtils]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
    $vis = [WinUtils]::IsWindowVisible($hWnd)
    $windows.Add([PSCustomObject]@{
      Hwnd = $hWnd
      Visible = $vis
      Title = $sb.ToString()
      Length = $len
    })
  }
  return $true
}, [IntPtr]::Zero) | Out-Null

$windows | Format-Table -AutoSize | Out-String | Write-Host
