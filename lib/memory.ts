import { getPrisma } from "./prisma";

export interface DashboardPattern {
  id: string;
  dataSchema: string; // JSON string of column names and types
  userIntent: string; // The original user prompt
  successfulElements: string[]; // Chart types and components that worked well
  commonMistakes: string[]; // Things that didn't work or caused errors
  bestPractices: string[]; // Successful patterns for similar data
  createdAt: Date;
}

export interface MemoryContext {
  dataColumns: string[];
  dataTypes: Record<string, string>;
  userPrompt: string;
  chartTypes?: string[];
  errors?: string[];
  businessContext?: string;
  recommendedCharts?: string[];
  recommendedKPIs?: string[];
  fileId?: string;
}

// Add a new table to the database for storing memory patterns
export async function storeDashboardPattern(
  context: MemoryContext,
  successfulElements: string[],
  commonMistakes: string[] = [],
  bestPractices: string[] = []
): Promise<void> {
  try {
    const prisma = getPrisma();
    
    const dataSchema = JSON.stringify({
      columns: context.dataColumns,
      types: context.dataTypes
    });
    
    await prisma.dashboardMemory.create({
      data: {
        dataSchema,
        userIntent: context.userPrompt,
        successfulElements: JSON.stringify(successfulElements),
        commonMistakes: JSON.stringify(commonMistakes),
        bestPractices: JSON.stringify(bestPractices),
      }
    });
  } catch (error) {
    console.error('Error storing dashboard pattern:', error);
    // Don't fail the request if memory storage fails
  }
}

export async function getRelevantPatterns(context: MemoryContext): Promise<DashboardPattern[]> {
  try {
    const prisma = getPrisma();
    
    // Get recent patterns from the last 30 days
    const recentPatterns = await prisma.dashboardMemory.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    // Filter patterns by similarity to current context
    const relevantPatterns = recentPatterns
      .map(pattern => {
        const schema = JSON.parse(pattern.dataSchema);
        const similarity = calculateSimilarity(context, schema);
        return { pattern, similarity };
      })
      .filter(({ similarity }) => similarity > 0.3) // Only patterns with >30% similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Top 5 most similar patterns
      .map(({ pattern }) => ({
        id: pattern.id,
        dataSchema: pattern.dataSchema,
        userIntent: pattern.userIntent,
        successfulElements: JSON.parse(pattern.successfulElements),
        commonMistakes: JSON.parse(pattern.commonMistakes),
        bestPractices: JSON.parse(pattern.bestPractices),
        createdAt: pattern.createdAt
      }));
    
    return relevantPatterns;
  } catch (error) {
    console.error('Error retrieving patterns:', error);
    return [];
  }
}

function calculateSimilarity(context: MemoryContext, storedSchema: any): number {
  const contextColumns = new Set(context.dataColumns.map(col => col.toLowerCase()));
  const storedColumns = new Set(storedSchema.columns.map((col: string) => col.toLowerCase()));
  
  // Calculate Jaccard similarity for column names
  const intersection = new Set([...contextColumns].filter(x => storedColumns.has(x)));
  const union = new Set([...contextColumns, ...storedColumns]);
  const columnSimilarity = intersection.size / union.size;
  
  // Calculate data type similarity
  const contextTypes = Object.values(context.dataTypes);
  const storedTypes = Object.values(storedSchema.types);
  const typeSimilarity = calculateArraySimilarity(contextTypes, storedTypes);
  
  // Weight column similarity more heavily than type similarity
  return columnSimilarity * 0.7 + typeSimilarity * 0.3;
}

function calculateArraySimilarity(arr1: any[], arr2: any[]): number {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

export function generateMemoryEnhancedPrompt(
  originalPrompt: string,
  patterns: DashboardPattern[]
): string {
  if (patterns.length === 0) {
    return originalPrompt;
  }
  
  let enhancedPrompt = originalPrompt + "\n\n";
  enhancedPrompt += "Based on similar dashboards created before, here are some recommendations:\n\n";
  
  // Collect successful elements
  const allSuccessfulElements = patterns.flatMap(p => p.successfulElements);
  const uniqueSuccessfulElements = [...new Set(allSuccessfulElements)];
  
  if (uniqueSuccessfulElements.length > 0) {
    enhancedPrompt += "✅ Recommended components that work well with similar data:\n";
    uniqueSuccessfulElements.slice(0, 5).forEach(element => {
      enhancedPrompt += `- ${element}\n`;
    });
    enhancedPrompt += "\n";
  }
  
  // Collect common mistakes to avoid
  const allMistakes = patterns.flatMap(p => p.commonMistakes);
  const uniqueMistakes = [...new Set(allMistakes)];
  
  if (uniqueMistakes.length > 0) {
    enhancedPrompt += "⚠️ Common issues to avoid:\n";
    uniqueMistakes.slice(0, 3).forEach(mistake => {
      enhancedPrompt += `- ${mistake}\n`;
    });
    enhancedPrompt += "\n";
  }
  
  // Collect best practices
  const allBestPractices = patterns.flatMap(p => p.bestPractices);
  const uniqueBestPractices = [...new Set(allBestPractices)];
  
  if (uniqueBestPractices.length > 0) {
    enhancedPrompt += "💡 Best practices for this type of data:\n";
    uniqueBestPractices.slice(0, 3).forEach(practice => {
      enhancedPrompt += `- ${practice}\n`;
    });
    enhancedPrompt += "\n";
  }
  
  enhancedPrompt += "Please incorporate these learnings into your dashboard design.";
  
  return enhancedPrompt;
}

// Function to extract insights from successful dashboard code
export function extractSuccessfulElements(code: string): string[] {
  const elements: string[] = [];
  
  // Look for chart components
  if (code.includes('LineChart')) elements.push('Line charts for trends');
  if (code.includes('BarChart')) elements.push('Bar charts for comparisons');
  if (code.includes('PieChart')) elements.push('Pie charts for distributions');
  if (code.includes('AreaChart')) elements.push('Area charts for cumulative data');
  if (code.includes('ScatterChart')) elements.push('Scatter plots for correlations');
  
  // Look for UI patterns
  if (code.includes('Card') && code.includes('metric')) elements.push('Metric cards for KPIs');
  if (code.includes('Select') && code.includes('filter')) elements.push('Dropdown filters');
  if (code.includes('DatePicker') || code.includes('date')) elements.push('Date range selectors');
  if (code.includes('Grid') || code.includes('grid')) elements.push('Grid layouts');
  if (code.includes('responsive')) elements.push('Responsive design patterns');
  
  // Look for data patterns
  if (code.includes('aggregate') || code.includes('group')) elements.push('Data aggregation');
  if (code.includes('sort') || code.includes('filter')) elements.push('Data filtering and sorting');
  if (code.includes('useState') && code.includes('filter')) elements.push('Interactive filtering');
  
  return elements;
}

// Function to extract common mistakes from error messages
export function extractCommonMistakes(errors: string[]): string[] {
  const mistakes: string[] = [];
  
  errors.forEach(error => {
    if (error.includes('undefined') && error.includes('map')) {
      mistakes.push('Check data arrays before mapping');
    }
    if (error.includes('Cannot read property') && error.includes('data')) {
      mistakes.push('Validate data structure before use');
    }
    if (error.includes('ResponsiveContainer')) {
      mistakes.push('Wrap charts in ResponsiveContainer');
    }
    if (error.includes('dataKey')) {
      mistakes.push('Verify dataKey matches actual column names');
    }
    if (error.includes('height') || error.includes('width')) {
      mistakes.push('Set explicit dimensions for charts');
    }
  });
  
  return [...new Set(mistakes)]; // Remove duplicates
}

// Function to create enhanced memory context with reasoning insights
export function createEnhancedMemoryContext(
  dataColumns: string[],
  dataTypes: Record<string, string>,
  userPrompt: string,
  reasoningInsights?: any
): MemoryContext {
  const context: MemoryContext = {
    dataColumns,
    dataTypes,
    userPrompt
  };

  if (reasoningInsights) {
    context.businessContext = reasoningInsights.businessContext;
    context.recommendedCharts = reasoningInsights.chartRecommendations?.map((chart: any) => 
      `${chart.type}: ${chart.title}`
    );
    context.recommendedKPIs = reasoningInsights.keyMetrics?.map((kpi: any) => 
      `${kpi.metric} (${kpi.cardType})`
    );
  }

  return context;
}