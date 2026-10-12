// Client-side data import utilities

export interface DataImportResult {
  headers: string[];
  rows: any[];
  summary: string;
  dataTypes: Record<string, string>;
  totalRows: number;
  fileId?: string;
}

// Client-side function to import data from stored file
export async function importDataFromStoredFile(fileId: string, fileName: string): Promise<DataImportResult> {
  try {
    console.log('Starting data import for file ID:', fileId, 'fileName:', fileName);
    
    const response = await fetch('/api/import-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId, fileName }),
    });
    
    console.log('Import response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse import error response as JSON');
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Import successful, data rows:', result.data?.totalRows);
    return result.data;
  } catch (error) {
    console.error('Import error details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Could not reach import server. Please check your connection.');
    }
    throw error;
  }
}

// Function to generate data-aware prompts for client use
export function generateDataImportPrompt(importResult: DataImportResult, userPrompt: string): string {
  const { headers, summary, dataTypes, fileId } = importResult;
  
  let prompt = `${userPrompt}\n\n`;
  prompt += `## 📊 DATA IMPORT INFORMATION\n\n`;
  prompt += `**Data Summary**: ${summary}\n\n`;
  
  prompt += `**Data Structure**:\n`;
  headers.forEach(header => {
    const type = dataTypes[header];
    prompt += `- ${header} (${type})\n`;
  });
  
  prompt += `\n**IMPORTANT - DATA ACCESS INSTRUCTIONS**:\n`;
  prompt += `The data has been uploaded and can be accessed via API call.\n`;
  prompt += `To fetch the data in your dashboard, use this code pattern:\n\n`;
  
  prompt += `\`\`\`javascript\n`;
  prompt += `// Fetch the data from the API\n`;
  prompt += `const [data, setData] = useState([]);\n`;
  prompt += `const [loading, setLoading] = useState(true);\n\n`;
  prompt += `useEffect(() => {\n`;
  prompt += `  async function loadData() {\n`;
  prompt += `    try {\n`;
  prompt += `      const response = await fetch('/api/import-data', {\n`;
  prompt += `        method: 'POST',\n`;
  prompt += `        headers: { 'Content-Type': 'application/json' },\n`;
  prompt += `        body: JSON.stringify({ fileId: '${fileId}', fileName: '${headers[0] ? 'data.csv' : 'data.json'}' })\n`;
  prompt += `      });\n`;
  prompt += `      const result = await response.json();\n`;
  prompt += `      setData(result.data.rows);\n`;
  prompt += `    } catch (error) {\n`;
  prompt += `      console.error('Error loading data:', error);\n`;
  prompt += `    } finally {\n`;
  prompt += `      setLoading(false);\n`;
  prompt += `    }\n`;
  prompt += `  }\n`;
  prompt += `  loadData();\n`;
  prompt += `}, []);\n`;
  prompt += `\`\`\`\n\n`;
  
  prompt += `**Column Names Available**:\n`;
  prompt += headers.map(h => `- ${h}`).join('\n') + '\n\n';
  
  prompt += `Please create a comprehensive dashboard that:\n`;
  prompt += `1. Fetches the actual data using the API pattern provided\n`;
  prompt += `2. Creates interactive charts and visualizations\n`;
  prompt += `3. Includes KPI cards with real calculations\n`;
  prompt += `4. Provides filtering and sorting capabilities\n`;
  prompt += `5. Handles loading states while data is being fetched\n\n`;
  
  prompt += `Make sure to use the exact column names listed above and implement proper error handling for data loading.`;
  
  return prompt;
}