import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

interface DataImportResult {
  headers: string[];
  rows: any[][];
  summary: string;
  dataTypes: Record<string, string>;
  fileId: string;
  totalRows: number;
}

async function getStoredFile(fileId: string): Promise<Buffer | null> {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const fileName = files.find(f => f.startsWith(fileId));
    
    if (!fileName) return null;
    
    const filePath = path.join(UPLOAD_DIR, fileName);
    return await fs.readFile(filePath);
  } catch (error) {
    console.error('Error reading stored file:', error);
    return null;
  }
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

async function importDataFromStoredFile(fileId: string, originalFileName: string): Promise<DataImportResult> {
  const fileBuffer = await getStoredFile(fileId);
  if (!fileBuffer) {
    throw new Error('File not found');
  }

  const fileExtension = getFileExtension(originalFileName);
  
  switch (fileExtension) {
    case 'csv':
      return await importCSVFromBuffer(fileBuffer, fileId);
    case 'json':
      return await importJSONFromBuffer(fileBuffer, fileId);
    case 'xlsx':
    case 'xls':
      return await importExcelFromBuffer(fileBuffer, fileId);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

async function importCSVFromBuffer(buffer: Buffer, fileId: string): Promise<DataImportResult> {
  return new Promise((resolve, reject) => {
    const csvText = buffer.toString('utf-8');
    
    Papa.parse(csvText, {
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
          
          resolve({ 
            headers, 
            rows, 
            summary, 
            dataTypes, 
            fileId,
            totalRows: rows.length 
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => reject(error)
    });
  });
}

async function importJSONFromBuffer(buffer: Buffer, fileId: string): Promise<DataImportResult> {
  const jsonText = buffer.toString('utf-8');
  const jsonData = JSON.parse(jsonText);
  
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
  
  return { 
    headers, 
    rows, 
    summary, 
    dataTypes, 
    fileId,
    totalRows: rows.length 
  };
}

async function importExcelFromBuffer(buffer: Buffer, fileId: string): Promise<DataImportResult> {
  const workbook = XLSX.read(buffer);
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
  
  return { 
    headers, 
    rows, 
    summary, 
    dataTypes, 
    fileId,
    totalRows: rows.length 
  };
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

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileName } = await request.json();
    
    if (!fileId || !fileName) {
      return NextResponse.json(
        { error: 'fileId and fileName are required' },
        { status: 400 }
      );
    }

    const importResult = await importDataFromStoredFile(fileId, fileName);
    
    // Convert rows back to objects for frontend consumption
    const dataObjects = importResult.rows.map(row => {
      const obj: any = {};
      importResult.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return NextResponse.json({
      success: true,
      data: {
        headers: importResult.headers,
        rows: dataObjects,
        summary: importResult.summary,
        dataTypes: importResult.dataTypes,
        totalRows: importResult.totalRows
      }
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Data import API endpoint' });
}