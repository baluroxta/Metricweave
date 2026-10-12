import { execSync } from "child_process";
import path from "path";
import os from "os";

const pbiExe = "C:\\Program Files\\WindowsApps\\Microsoft.MicrosoftPowerBIDesktop_2.158.1304.0_x64__8wekyb3d8bbwe\\bin\\PBIDesktop.exe";
const pbipFile = path.join(
  os.homedir(),
  "Downloads",
  "Global_Retail_E-Commerce_Sales_PowerBI_Project",
  "Global_Retail_E-Commerce_Sales.pbip"
);

console.log("Testing launch directly with PBIDesktop.exe...");
console.log("Exe:", pbiExe);
console.log("File:", pbipFile);

try {
  // Run PBIDesktop.exe directly with the file as argument
  execSync(`powershell -NoProfile -Command "Start-Process '${pbiExe}' -ArgumentList '\"${pbipFile}\"' -PassThru"`, {
    encoding: "utf-8",
  });
  console.log("Start-Process succeeded!");
} catch (err: any) {
  console.error("Start-Process failed:", err.message);
}
