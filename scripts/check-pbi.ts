import { execSync } from "child_process";

const psScript = `
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  public class User32 {
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

$list = New-Object System.Collections.Generic.List[Object]
[User32]::EnumWindows({
  param($hWnd, $lParam)
  if ([User32]::IsWindowVisible($hWnd)) {
    $len = [User32]::GetWindowTextLength($hWnd)
    if ($len -gt 0) {
      $sb = New-Object System.Text.StringBuilder ($len + 1)
      [User32]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
      $pid = 0
      [User32]::GetWindowThreadProcessId($hWnd, [ref]$pid) | Out-Null
      $title = $sb.ToString()
      if ($title -match 'Power BI|Error|Retail|MetricWeave') {
        $list.Add([PSCustomObject]@{
          Hwnd = $hWnd
          Pid = $pid
          Title = $title
        })
      }
    }
  }
  return $true
}, [IntPtr]::Zero) | Out-Null

$list | ConvertTo-Json
`;

try {
  const res = execSync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`, {
    encoding: "utf-8",
  });
  console.log("Visible windows:", res);
} catch (e: any) {
  console.error("Error checking windows:", e.message);
}
