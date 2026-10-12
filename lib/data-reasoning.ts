import { ParsedData } from './data-parser';

export interface DataInsights {
  businessContext: string;
  keyMetrics: KPIRecommendation[];
  chartRecommendations: ChartRecommendation[];
  analyticalInsights: string[];
  dashboardStructure: DashboardStructure;
  dataQualityIssues: string[];
}

export interface KPIRecommendation {
  metric: string;
  description: string;
  calculation: string;
  importance: 'high' | 'medium' | 'low';
  cardType: 'number' | 'percentage' | 'currency' | 'trend' | 'comparison';
  columns: string[];
}

export interface ChartRecommendation {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'histogram' | 'funnel';
  title: string;
  description: string;
  xAxis: string;
  yAxis: string | string[];
  groupBy?: string;
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median';
  reasoning: string;
  priority: number;
}

export interface DashboardStructure {
  layout: 'single-column' | 'two-column' | 'grid' | 'mixed';
  sections: DashboardSection[];
  filters: FilterRecommendation[];
}

export interface DashboardSection {
  title: string;
  type: 'kpi-row' | 'chart-grid' | 'detailed-table' | 'trend-analysis';
  position: number;
  description: string;
}

export interface FilterRecommendation {
  column: string;
  type: 'dropdown' | 'date-range' | 'multi-select' | 'search' | 'slider';
  priority: number;
  defaultValue?: any;
}

export class DataReasoningEngine {
  private data: ParsedData;
  private insights: DataInsights;

  constructor(data: ParsedData) {
    this.data = data;
    this.insights = this.analyzeData();
  }

  private analyzeData(): DataInsights {
    const businessContext = this.inferBusinessContext();
    const keyMetrics = this.identifyKeyMetrics();
    const chartRecommendations = this.recommendCharts();
    const analyticalInsights = this.generateAnalyticalInsights();
    const dashboardStructure = this.designDashboardStructure();
    const dataQualityIssues = this.assessDataQuality();

    return {
      businessContext,
      keyMetrics,
      chartRecommendations,
      analyticalInsights,
      dashboardStructure,
      dataQualityIssues
    };
  }

  private inferBusinessContext(): string {
    const { headers } = this.data;
    const columnNames = headers.map(h => h.toLowerCase());
    
    // Business domain detection based on column patterns
    if (this.hasColumns(columnNames, ['revenue', 'sales', 'profit', 'orders'])) {
      return 'sales-commerce';
    } else if (this.hasColumns(columnNames, ['users', 'sessions', 'pageviews', 'clicks'])) {
      return 'web-analytics';
    } else if (this.hasColumns(columnNames, ['employee', 'salary', 'department', 'hire'])) {
      return 'human-resources';
    } else if (this.hasColumns(columnNames, ['inventory', 'stock', 'product', 'warehouse'])) {
      return 'inventory-management';
    } else if (this.hasColumns(columnNames, ['customer', 'ticket', 'support', 'issue'])) {
      return 'customer-support';
    } else if (this.hasColumns(columnNames, ['campaign', 'impressions', 'ctr', 'conversion'])) {
      return 'marketing';
    } else if (this.hasColumns(columnNames, ['expense', 'budget', 'cost', 'accounting'])) {
      return 'financial';
    } else if (this.hasColumns(columnNames, ['project', 'task', 'milestone', 'deadline'])) {
      return 'project-management';
    } else {
      return 'general-business';
    }
  }

  private hasColumns(columnNames: string[], keywords: string[]): boolean {
    return keywords.some(keyword => 
      columnNames.some(col => col.includes(keyword))
    );
  }

  private identifyKeyMetrics(): KPIRecommendation[] {
    const metrics: KPIRecommendation[] = [];
    const { headers, dataTypes } = this.data;
    const numericColumns = headers.filter(h => ['integer', 'float'].includes(dataTypes[h]));
    const dateColumns = headers.filter(h => dataTypes[h] === 'date');
    
    // Revenue/Sales metrics
    const revenueColumns = this.findColumnsByKeywords(headers, ['revenue', 'sales', 'income', 'earnings']);
    revenueColumns.forEach(col => {
      metrics.push({
        metric: `Total ${this.formatColumnName(col)}`,
        description: `Sum of all ${col.toLowerCase()} values`,
        calculation: `SUM(${col})`,
        importance: 'high',
        cardType: 'currency',
        columns: [col]
      });
      
      if (dateColumns.length > 0) {
        metrics.push({
          metric: `${this.formatColumnName(col)} Growth`,
          description: `Month-over-month growth in ${col.toLowerCase()}`,
          calculation: `((Current Month ${col} - Previous Month ${col}) / Previous Month ${col}) * 100`,
          importance: 'high',
          cardType: 'percentage',
          columns: [col, dateColumns[0]]
        });
      }
    });

    // Count-based metrics
    metrics.push({
      metric: 'Total Records',
      description: 'Total number of data entries',
      calculation: 'COUNT(*)',
      importance: 'medium',
      cardType: 'number',
      columns: []
    });

    // Average metrics for numeric columns
    numericColumns.slice(0, 3).forEach(col => {
      if (!revenueColumns.includes(col)) {
        metrics.push({
          metric: `Average ${this.formatColumnName(col)}`,
          description: `Mean value of ${col.toLowerCase()}`,
          calculation: `AVG(${col})`,
          importance: 'medium',
          cardType: 'number',
          columns: [col]
        });
      }
    });

    // Conversion rate if applicable
    const conversionColumns = this.findColumnsByKeywords(headers, ['conversion', 'success', 'completed']);
    if (conversionColumns.length > 0) {
      metrics.push({
        metric: 'Conversion Rate',
        description: 'Percentage of successful conversions',
        calculation: `(SUM(conversions) / COUNT(*)) * 100`,
        importance: 'high',
        cardType: 'percentage',
        columns: conversionColumns
      });
    }

    return metrics.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  }

  private recommendCharts(): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const { headers, dataTypes } = this.data;
    const numericColumns = headers.filter(h => ['integer', 'float'].includes(dataTypes[h]));
    const dateColumns = headers.filter(h => dataTypes[h] === 'date');
    const categoryColumns = headers.filter(h => dataTypes[h] === 'string');
    
    let priority = 10;

    // Time series charts (if date columns exist)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      numericColumns.slice(0, 2).forEach(numCol => {
        charts.push({
          type: 'line',
          title: `${this.formatColumnName(numCol)} Trend Over Time`,
          description: `Track ${numCol.toLowerCase()} changes over time`,
          xAxis: dateColumns[0],
          yAxis: numCol,
          aggregation: this.getAppropriateAggregation(numCol),
          reasoning: 'Time series data is best visualized with line charts to show trends',
          priority: priority--
        });
      });
    }

    // Category distribution charts
    if (categoryColumns.length > 0 && numericColumns.length > 0) {
      const topCategoryCol = categoryColumns[0];
      const uniqueValues = this.getUniqueValueCount(topCategoryCol);
      
      if (uniqueValues <= 8) {
        charts.push({
          type: 'pie',
          title: `${this.formatColumnName(numericColumns[0])} by ${this.formatColumnName(topCategoryCol)}`,
          description: `Distribution of ${numericColumns[0].toLowerCase()} across ${topCategoryCol.toLowerCase()} categories`,
          xAxis: topCategoryCol,
          yAxis: numericColumns[0],
          aggregation: this.getAppropriateAggregation(numericColumns[0]),
          reasoning: 'Pie charts work well for showing distribution across a small number of categories',
          priority: priority--
        });
      } else {
        charts.push({
          type: 'bar',
          title: `Top ${this.formatColumnName(topCategoryCol)} by ${this.formatColumnName(numericColumns[0])}`,
          description: `Compare ${numericColumns[0].toLowerCase()} across ${topCategoryCol.toLowerCase()}`,
          xAxis: topCategoryCol,
          yAxis: numericColumns[0],
          aggregation: this.getAppropriateAggregation(numericColumns[0]),
          reasoning: 'Bar charts are ideal for comparing values across many categories',
          priority: priority--
        });
      }
    }

    // Correlation analysis for numeric columns
    if (numericColumns.length >= 2) {
      charts.push({
        type: 'scatter',
        title: `${this.formatColumnName(numericColumns[0])} vs ${this.formatColumnName(numericColumns[1])}`,
        description: `Explore correlation between ${numericColumns[0].toLowerCase()} and ${numericColumns[1].toLowerCase()}`,
        xAxis: numericColumns[0],
        yAxis: numericColumns[1],
        aggregation: 'sum',
        reasoning: 'Scatter plots reveal relationships and correlations between numeric variables',
        priority: priority--
      });
    }

    // Histogram for distribution analysis
    if (numericColumns.length > 0) {
      charts.push({
        type: 'histogram',
        title: `${this.formatColumnName(numericColumns[0])} Distribution`,
        description: `Show the distribution pattern of ${numericColumns[0].toLowerCase()} values`,
        xAxis: numericColumns[0],
        yAxis: 'frequency',
        aggregation: 'count',
        reasoning: 'Histograms help understand the distribution and patterns in numeric data',
        priority: priority--
      });
    }

    // Multi-dimensional analysis
    if (categoryColumns.length >= 2 && numericColumns.length > 0) {
      charts.push({
        type: 'bar',
        title: `${this.formatColumnName(numericColumns[0])} by ${this.formatColumnName(categoryColumns[0])} and ${this.formatColumnName(categoryColumns[1])}`,
        description: `Multi-dimensional analysis of ${numericColumns[0].toLowerCase()}`,
        xAxis: categoryColumns[0],
        yAxis: numericColumns[0],
        groupBy: categoryColumns[1],
        aggregation: this.getAppropriateAggregation(numericColumns[0]),
        reasoning: 'Grouped bar charts show relationships across multiple categorical dimensions',
        priority: priority--
      });
    }

    return charts.sort((a, b) => b.priority - a.priority);
  }

  private generateAnalyticalInsights(): string[] {
    const insights: string[] = [];
    const { headers, dataTypes, rows } = this.data;
    
    // Data volume insights
    insights.push(`Dataset contains ${rows.length} records across ${headers.length} dimensions`);
    
    // Data type distribution
    const typeCount = Object.values(dataTypes).reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (typeCount.integer || typeCount.float) {
      insights.push(`${(typeCount.integer || 0) + (typeCount.float || 0)} numeric columns available for quantitative analysis`);
    }
    
    if (typeCount.date) {
      insights.push(`${typeCount.date} date columns enable time-series and trend analysis`);
    }
    
    if (typeCount.string) {
      insights.push(`${typeCount.string} categorical columns provide grouping and segmentation opportunities`);
    }

    // Business-specific insights
    const businessContext = this.insights?.businessContext || this.inferBusinessContext();
    switch (businessContext) {
      case 'sales-commerce':
        insights.push('Sales data detected - focus on revenue trends, customer segments, and product performance');
        break;
      case 'web-analytics':
        insights.push('Web analytics data - emphasize user behavior, conversion funnels, and traffic sources');
        break;
      case 'human-resources':
        insights.push('HR data identified - highlight workforce metrics, performance trends, and departmental analysis');
        break;
      case 'marketing':
        insights.push('Marketing data found - prioritize campaign performance, ROI analysis, and audience insights');
        break;
      default:
        insights.push('General business data - recommend comprehensive overview with key metrics and trends');
    }

    // Data complexity insights
    const numericColumns = headers.filter(h => ['integer', 'float'].includes(dataTypes[h]));
    if (numericColumns.length > 5) {
      insights.push('Rich numeric data suggests opportunity for advanced analytics and correlation analysis');
    }

    return insights;
  }

  private designDashboardStructure(): DashboardStructure {
    const { headers, dataTypes } = this.data;
    const numericColumns = headers.filter(h => ['integer', 'float'].includes(dataTypes[h]));
    const categoryColumns = headers.filter(h => dataTypes[h] === 'string');
    const dateColumns = headers.filter(h => dataTypes[h] === 'date');

    const sections: DashboardSection[] = [
      {
        title: 'Key Performance Indicators',
        type: 'kpi-row',
        position: 1,
        description: 'High-level metrics and performance indicators'
      }
    ];

    if (dateColumns.length > 0) {
      sections.push({
        title: 'Trends & Time Analysis',
        type: 'trend-analysis',
        position: 2,
        description: 'Time-based trends and historical analysis'
      });
    }

    sections.push({
      title: 'Analytical Charts',
      type: 'chart-grid',
      position: 3,
      description: 'Detailed charts and visualizations'
    });

    if (headers.length > 8) {
      sections.push({
        title: 'Detailed Data',
        type: 'detailed-table',
        position: 4,
        description: 'Comprehensive data table with filtering'
      });
    }

    const filters: FilterRecommendation[] = [];
    
    // Date range filter (highest priority)
    if (dateColumns.length > 0) {
      filters.push({
        column: dateColumns[0],
        type: 'date-range',
        priority: 10
      });
    }

    // Category filters
    categoryColumns.slice(0, 3).forEach((col, index) => {
      const uniqueCount = this.getUniqueValueCount(col);
      filters.push({
        column: col,
        type: uniqueCount <= 20 ? 'dropdown' : 'search',
        priority: 9 - index
      });
    });

    return {
      layout: numericColumns.length > 4 ? 'grid' : 'two-column',
      sections,
      filters: filters.sort((a, b) => b.priority - a.priority)
    };
  }

  private assessDataQuality(): string[] {
    const issues: string[] = [];
    const { headers, rows, dataTypes } = this.data;

    // Check for missing data
    headers.forEach(header => {
      const nullCount = rows.filter(row => {
        const value = row[headers.indexOf(header)];
        return value === null || value === undefined || value === '';
      }).length;
      
      const missingPercentage = (nullCount / rows.length) * 100;
      if (missingPercentage > 10) {
        issues.push(`${header} has ${missingPercentage.toFixed(1)}% missing values`);
      }
    });

    // Check for data inconsistencies
    const categoryColumns = headers.filter(h => dataTypes[h] === 'string');
    categoryColumns.forEach(col => {
      const uniqueCount = this.getUniqueValueCount(col);
      if (uniqueCount > rows.length * 0.8) {
        issues.push(`${col} has very high cardinality (${uniqueCount} unique values) - consider grouping`);
      }
    });

    // Check data volume
    if (rows.length < 10) {
      issues.push('Dataset is very small - some statistical analyses may not be reliable');
    }

    return issues;
  }

  private getUniqueValueCount(column: string): number {
    const columnIndex = this.data.headers.indexOf(column);
    const values = this.data.rows.map(row => row[columnIndex]);
    return new Set(values.filter(v => v !== null && v !== undefined && v !== '')).size;
  }

  private findColumnsByKeywords(headers: string[], keywords: string[]): string[] {
    return headers.filter(header => 
      keywords.some(keyword => 
        header.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  private formatColumnName(column: string): string {
    return column.split(/[-_\s]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private getAppropriateAggregation(column: string): 'sum' | 'avg' | 'count' | 'max' | 'min' {
    const lowerCol = column.toLowerCase();
    if (lowerCol.includes('revenue') || lowerCol.includes('sales') || lowerCol.includes('total')) {
      return 'sum';
    } else if (lowerCol.includes('rate') || lowerCol.includes('average') || lowerCol.includes('score')) {
      return 'avg';
    } else if (lowerCol.includes('count') || lowerCol.includes('number')) {
      return 'count';
    } else {
      return 'sum'; // Default for most business metrics
    }
  }

  // Public methods to access insights
  public getInsights(): DataInsights {
    return this.insights;
  }

  public getRecommendedCharts(): ChartRecommendation[] {
    return this.insights.chartRecommendations;
  }

  public getKeyMetrics(): KPIRecommendation[] {
    return this.insights.keyMetrics;
  }

  public getDashboardStructure(): DashboardStructure {
    return this.insights.dashboardStructure;
  }

  public generateIntelligentPrompt(userPrompt: string): string {
    const insights = this.getInsights();
    
    let enhancedPrompt = `${userPrompt}\n\n`;
    enhancedPrompt += `## 📊 INTELLIGENT DATA ANALYSIS\n\n`;
    
    // Business context
    enhancedPrompt += `**Business Context**: ${this.getBusinessContextDescription(insights.businessContext)}\n\n`;
    
    // Key metrics section
    enhancedPrompt += `**🎯 Recommended KPIs** (implement these as metric cards):\n`;
    insights.keyMetrics.slice(0, 4).forEach((kpi, index) => {
      enhancedPrompt += `${index + 1}. **${kpi.metric}**: ${kpi.description} (${kpi.cardType} format)\n`;
    });
    enhancedPrompt += `\n`;
    
    // Chart recommendations
    enhancedPrompt += `**📈 Recommended Charts** (implement these visualizations):\n`;
    insights.chartRecommendations.slice(0, 4).forEach((chart, index) => {
      enhancedPrompt += `${index + 1}. **${chart.type.toUpperCase()} Chart**: ${chart.title}\n`;
      enhancedPrompt += `   - X-axis: ${chart.xAxis}, Y-axis: ${chart.yAxis}\n`;
      enhancedPrompt += `   - Reasoning: ${chart.reasoning}\n`;
    });
    enhancedPrompt += `\n`;
    
    // Dashboard structure
    enhancedPrompt += `**🏗️ Dashboard Structure**:\n`;
    insights.dashboardStructure.sections.forEach((section, index) => {
      enhancedPrompt += `${index + 1}. ${section.title}: ${section.description}\n`;
    });
    enhancedPrompt += `\n`;
    
    // Filters
    if (insights.dashboardStructure.filters.length > 0) {
      enhancedPrompt += `**🔍 Recommended Filters**:\n`;
      insights.dashboardStructure.filters.slice(0, 3).forEach(filter => {
        enhancedPrompt += `- ${filter.column} (${filter.type})\n`;
      });
      enhancedPrompt += `\n`;
    }
    
    // Data insights
    enhancedPrompt += `**💡 Key Insights**:\n`;
    insights.analyticalInsights.forEach(insight => {
      enhancedPrompt += `- ${insight}\n`;
    });
    enhancedPrompt += `\n`;
    
    // Data quality warnings
    if (insights.dataQualityIssues.length > 0) {
      enhancedPrompt += `**⚠️ Data Quality Notes**:\n`;
      insights.dataQualityIssues.forEach(issue => {
        enhancedPrompt += `- ${issue}\n`;
      });
      enhancedPrompt += `\n`;
    }
    
    enhancedPrompt += `**📋 Implementation Instructions**:\n`;
    enhancedPrompt += `- Use the exact column names from the data: ${this.data.headers.join(', ')}\n`;
    enhancedPrompt += `- Implement responsive design with proper spacing\n`;
    enhancedPrompt += `- Add interactive elements like hover effects and tooltips\n`;
    enhancedPrompt += `- Use appropriate color schemes for data visualization\n`;
    enhancedPrompt += `- Include loading states and error handling\n`;
    enhancedPrompt += `- Make the dashboard fully functional with sample data integration\n\n`;
    
    enhancedPrompt += `Please create a comprehensive dashboard that implements these intelligent recommendations based on the data analysis.`;
    
    return enhancedPrompt;
  }

  private getBusinessContextDescription(context: string): string {
    const descriptions: Record<string, string> = {
      'sales-commerce': 'E-commerce/Sales data - Focus on revenue optimization and customer insights',
      'web-analytics': 'Web Analytics - Emphasize user behavior and conversion optimization',
      'human-resources': 'Human Resources - Highlight workforce analytics and performance metrics',
      'inventory-management': 'Inventory Management - Focus on stock levels and supply chain efficiency',
      'customer-support': 'Customer Support - Emphasize ticket resolution and satisfaction metrics',
      'marketing': 'Marketing Analytics - Focus on campaign performance and ROI',
      'financial': 'Financial Data - Emphasize budgets, expenses, and financial health',
      'project-management': 'Project Management - Focus on timelines, resources, and deliverables',
      'general-business': 'General Business Data - Comprehensive overview with key insights'
    };
    
    return descriptions[context] || descriptions['general-business'];
  }
}

export function createDataReasoningEngine(data: ParsedData): DataReasoningEngine {
  return new DataReasoningEngine(data);
}