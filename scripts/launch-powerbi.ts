import { execSync, spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs";

function findPowerBI(): string | null {
  // Check AppX packages
  try {
    const output = execSync('powershell -NoProfile -Command "(Get-AppxPackage *PowerBI*).InstallLocation"', {
      encoding: "utf-8",
    }).trim();
    if (output && fs.existsSync(output)) {
      const candidate = path.join(output, "bin", "PBIDesktop.exe");
      if (fs.existsSync(candidate)) return candidate;
      const candidateRoot = path.join(output, "PBIDesktop.exe");
      if (fs.existsSync(candidateRoot)) return candidateRoot;
    }
  } catch (e) {
    // ignore
  }

  const standardPaths = [
    "C:\\Program Files\\Microsoft Power BI Desktop\\bin\\PBIDesktop.exe",
    "C:\\Program Files (x86)\\Microsoft Power BI Desktop\\bin\\PBIDesktop.exe",
  ];

  for (const p of standardPaths) {
    if (fs.existsSync(p)) return p;
  }

  return null;
}

const pbiExe = findPowerBI();
console.log("Power BI Desktop executable:", pbiExe);

const pbipPath = path.join(
  os.homedir(),
  "Downloads",
  "Global_Retail_E-Commerce_Sales_PowerBI",
  "Global_Retail_E-Commerce_Sales.pbip"
);

console.log("Target PBIP file exists?", fs.existsSync(pbipPath), pbipPath);

if (fs.existsSync(pbipPath)) {
  // Launch Power BI with the target file
  console.log("Launching Power BI Desktop with:", pbipPath);
  try {
    // Using start command to open with registered protocol/app
    execSync(`start "" "${pbipPath}"`, { shell: "cmd.exe" });
    console.log("Launched successfully via Windows shell!");
  } catch (err) {
    console.error("Launch error:", err);
  }
}
