import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedData {
  headers: string[];
  rows: any[][];
  summary: string;
  dataTypes: Record<string, string>;
}

export async function parseDataFile(file: File): Promise<ParsedData> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          if (data.length === 0) {
            throw new Error('CSV file is empty');
          }
          
          const headers = Object.keys(data[0]);
          const rows = data.map(row => headers.map(header => row[header]));
          const dataTypes = analyzeDataTypes(data, headers);
          const summary = generateDataSummary(headers, rows, dataTypes);
          
          resolve({ headers, rows, summary, dataTypes });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

async function parseJSON(file: File): Promise<ParsedData> {
  const text = await file.text();
  const jsonData = JSON.parse(text);
  
  // Handle different JSON structures
  let data: any[];
  if (Array.isArray(jsonData)) {
    data = jsonData;
  } else if (jsonData.data && Array.isArray(jsonData.data)) {
    data = jsonData.data;
  } else if (typeof jsonData === 'object') {
    // Convert object to array of key-value pairs
    data = Object.entries(jsonData).map(([key, value]) => ({ key, value }));
  } else {
    throw new Error('JSON file must contain an array of objects or an object with a data array');
  }
  
  if (data.length === 0) {
    throw new Error('JSON file contains no data');
  }
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header]));
  const dataTypes = analyzeDataTypes(data, headers);
  const summary = generateDataSummary(headers, rows, dataTypes);
  
  return { headers, rows, summary, dataTypes };
}

async function parseExcel(file: File): Promise<ParsedData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  if (jsonData.length === 0) {
    throw new Error('Excel file is empty');
  }
  
  const headers = Object.keys(jsonData[0] as object);
  const rows = jsonData.map(row => headers.map(header => (row as any)[header]));
  const dataTypes = analyzeDataTypes(jsonData, headers);
  const summary = generateDataSummary(headers, rows, dataTypes);
  
  return { headers, rows, summary, dataTypes };
}

function analyzeDataTypes(data: any[], headers: string[]): Record<string, string> {
  const types: Record<string, string> = {};
  
  headers.forEach(header => {
    const values = data.map(row => row[header]).filter(val => val !== null && val !== undefined && val !== '');
    
    if (values.length === 0) {
      types[header] = 'unknown';
      return;
    }
    
    const sample = values.slice(0, 100); // Sample first 100 values
    
    // Check if all values are numbers
    if (sample.every(val => !isNaN(Number(val)) && val !== '')) {
      // Check if they're integers or floats
      const hasDecimals = sample.some(val => String(val).includes('.'));
      types[header] = hasDecimals ? 'float' : 'integer';
    }
    // Check if values look like dates
    else if (sample.some(val => !isNaN(Date.parse(val)))) {
      types[header] = 'date';
    }
    // Check if values are boolean-like
    else if (sample.every(val => ['true', 'false', '1', '0', 'yes', 'no'].includes(String(val).toLowerCase()))) {
      types[header] = 'boolean';
    }
    // Default to string
    else {
      types[header] = 'string';
    }
  });
  
  return types;
}

function generateDataSummary(headers: string[], rows: any[][], dataTypes: Record<string, string>): string {
  const totalRows = rows.length;
  const totalColumns = headers.length;
  
  const typeDistribution = Object.values(dataTypes).reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let summary = `Dataset contains ${totalRows} rows and ${totalColumns} columns.\n\n`;
  summary += `Columns: ${headers.join(', ')}\n\n`;
  summary += `Data types:\n`;
  
  Object.entries(typeDistribution).forEach(([type, count]) => {
    summary += `- ${count} ${type} column(s)\n`;
  });
  
  // Add some insights about the data
  summary += `\nKey insights:\n`;
  
  const numericColumns = headers.filter(h => ['integer', 'float'].includes(dataTypes[h]));
  const dateColumns = headers.filter(h => dataTypes[h] === 'date');
  const categoryColumns = headers.filter(h => dataTypes[h] === 'string');
  
  if (numericColumns.length > 0) {
    summary += `- ${numericColumns.length} numeric columns suitable for charts and metrics\n`;
  }
  if (dateColumns.length > 0) {
    summary += `- ${dateColumns.length} date columns for time-series analysis\n`;
  }
  if (categoryColumns.length > 0) {
    summary += `- ${categoryColumns.length} categorical columns for grouping and filtering\n`;
  }
  
  return summary;
}

export function generateDataPrompt(parsedData: ParsedData, userPrompt: string): string {
  // Import the reasoning engine locally to avoid circular dependencies
  const { createDataReasoningEngine } = require('./data-reasoning');
  
  // Create the reasoning engine and generate intelligent prompt
  const reasoningEngine = createDataReasoningEngine(parsedData);
  return reasoningEngine.generateIntelligentPrompt(userPrompt);
}

export function generateBasicDataPrompt(parsedData: ParsedData, userPrompt: string): string {
  const { headers, rows, summary, dataTypes } = parsedData;
  
  let prompt = `${userPrompt}\n\n`;
  prompt += `I have uploaded a dataset with the following structure:\n\n`;
  prompt += summary;
  prompt += `\n\nColumn details:\n`;
  
  headers.forEach(header => {
    const type = dataTypes[header];
    const sampleValues = rows.slice(0, 3).map(row => row[headers.indexOf(header)]).filter(val => val !== null && val !== undefined);
    prompt += `- ${header} (${type}): ${sampleValues.join(', ')}${sampleValues.length < rows.length ? '...' : ''}\n`;
  });
  
  prompt += `\n\nPlease create a dashboard that visualizes this data effectively. Use appropriate chart types based on the data types:`;
  prompt += `\n- Use line/bar charts for numeric data over time`;
  prompt += `\n- Use pie/donut charts for categorical distributions`;
  prompt += `\n- Include summary cards for key metrics`;
  prompt += `\n- Add filters for interactive exploration`;
  prompt += `\n\nMake sure to use the actual column names and data types from my dataset.`;
  
  return prompt;
}