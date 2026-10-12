import fs from "fs";
import path from "path";
import os from "os";

const targetFolder = path.join(
  os.homedir(),
  "Downloads",
  "Global_Retail_E-Commerce_Sales_PowerBI_Project"
);

console.log("Checking folder:", targetFolder);

const filesToCheck = [
  "Global_Retail_E-Commerce_Sales.pbip",
  "Global_Retail_E-Commerce_Sales.Report/definition.pbir",
  "Global_Retail_E-Commerce_Sales.Report/report.json",
  "Global_Retail_E-Commerce_Sales.SemanticModel/definition.pbism",
  "Global_Retail_E-Commerce_Sales.SemanticModel/model.bim",
];

for (const rel of filesToCheck) {
  const p = path.join(targetFolder, rel);
  if (!fs.existsSync(p)) {
    console.error("MISSING FILE:", p);
    continue;
  }
  const content = fs.readFileSync(p, "utf-8");
  try {
    const parsed = JSON.parse(content);
    console.log(`[VALID JSON] ${rel} (${content.length} chars)`);
  } catch (err: any) {
    console.error(`[INVALID JSON ERROR] in ${rel}:`, err.message);
  }
}
