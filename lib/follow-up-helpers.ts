// Follow-up system helpers for DashGen

export function detectFollowUpIntent(userMessage: string): {
  isFollowUp: boolean;
  intent: 'add' | 'modify' | 'fix' | 'style' | 'general';
  confidence: number;
} {
  const message = userMessage.toLowerCase();
  
  // Keywords that indicate follow-up requests
  const addKeywords = ['add', 'include', 'insert', 'create', 'new', 'also', 'table', 'chart', 'card', 'filter'];
  const modifyKeywords = ['change', 'modify', 'update', 'edit', 'replace', 'swap', 'different'];
  const fixKeywords = ['fix', 'error', 'bug', 'broken', 'not working', 'issue', 'problem'];
  const styleKeywords = ['color', 'style', 'theme', 'design', 'appearance', 'ui', 'ux', 'layout'];
  
  // Check for add intent
  const addMatches = addKeywords.filter(keyword => message.includes(keyword)).length;
  const modifyMatches = modifyKeywords.filter(keyword => message.includes(keyword)).length;
  const fixMatches = fixKeywords.filter(keyword => message.includes(keyword)).length;
  const styleMatches = styleKeywords.filter(keyword => message.includes(keyword)).length;
  
  const totalMatches = addMatches + modifyMatches + fixMatches + styleMatches;
  
  if (totalMatches === 0) {
    return { isFollowUp: false, intent: 'general', confidence: 0 };
  }
  
  // Determine primary intent
  let intent: 'add' | 'modify' | 'fix' | 'style' | 'general' = 'general';
  let maxMatches = 0;
  
  if (addMatches > maxMatches) { intent = 'add'; maxMatches = addMatches; }
  if (modifyMatches > maxMatches) { intent = 'modify'; maxMatches = modifyMatches; }
  if (fixMatches > maxMatches) { intent = 'fix'; maxMatches = fixMatches; }
  if (styleMatches > maxMatches) { intent = 'style'; maxMatches = styleMatches; }
  
  const confidence = Math.min(totalMatches / 3, 1); // Normalize to 0-1
  
  return {
    isFollowUp: totalMatches > 0,
    intent,
    confidence
  };
}

export function generateFollowUpInstructions(intent: string, userRequest: string): string {
  const baseInstructions = `
  This is a follow-up request. CRITICAL: DO NOT regenerate the entire dashboard from scratch!
  
  User Request: "${userRequest}"
  `;
  
  switch (intent) {
    case 'add':
      return baseInstructions + `
      TASK: ADD the requested feature to the existing dashboard.
      - Keep ALL existing KPI cards, charts, and layout exactly as they are
      - Add the new feature (table, chart, filter, etc.) in an appropriate location
      - Maintain the existing grid system and responsive design
      - Use the same data structure and variable names
      - Only add new imports if absolutely necessary
      `;
      
    case 'modify':
      return baseInstructions + `
      TASK: MODIFY the specified part of the dashboard.
      - Keep the overall structure and layout intact
      - Only change the specific element requested
      - Preserve all other functionality and styling
      - Maintain data consistency
      `;
      
    case 'fix':
      return baseInstructions + `
      TASK: FIX the reported issue in the dashboard.
      - Identify and fix the specific problem mentioned
      - Keep all other functionality working
      - Maintain the existing design and layout
      - Test that the fix doesn't break other features
      `;
      
    case 'style':
      return baseInstructions + `
      TASK: UPDATE the styling/appearance of the dashboard.
      - Keep all functionality and data handling exactly the same
      - Only modify the visual aspects (colors, layout, typography, etc.)
      - Ensure the changes are consistent across the entire dashboard
      - Maintain responsiveness and accessibility
      `;
      
    default:
      return baseInstructions + `
      TASK: Address the user's request while preserving the existing dashboard.
      - Analyze what changes are needed
      - Make minimal modifications to achieve the goal
      - Keep the overall structure and functionality intact
      `;
  }
}

export function extractDashboardContext(existingCode: string): {
  componentName: string;
  hasKPICards: boolean;
  hasCharts: boolean;
  hasFilters: boolean;
  hasTable: boolean;
  dataVariables: string[];
  chartTypes: string[];
} {
  // Extract component name
  const componentMatch = existingCode.match(/export default function (\w+)/);
  const componentName = componentMatch ? componentMatch[1] : 'Dashboard';
  
  // Detect features
  const hasKPICards = /Card.*KPI|Card.*metric|metric.*Card/i.test(existingCode);
  const hasCharts = /Chart|Recharts|LineChart|BarChart|PieChart/i.test(existingCode);
  const hasFilters = /Select|Filter|Dropdown/i.test(existingCode);
  const hasTable = /table|Table|tbody|thead/i.test(existingCode);
  
  // Extract data variables
  const dataMatches = existingCode.match(/const (\w+Data) = \[/g) || [];
  const dataVariables = dataMatches.map(match => match.replace(/const (\w+) = \[/, '$1'));
  
  // Extract chart types
  const chartMatches = existingCode.match(/<(\w+Chart)/g) || [];
  const chartTypes = chartMatches.map(match => match.replace(/<(\w+)Chart/, '$1'));
  
  return {
    componentName,
    hasKPICards,
    hasCharts,
    hasFilters,
    hasTable,
    dataVariables,
    chartTypes
  };
}