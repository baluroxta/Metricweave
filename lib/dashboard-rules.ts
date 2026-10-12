// Dashboard Design Rules and Guidelines for DashGen

export const DASHBOARD_RULES = {
  // Mandatory Layout Structure
  LAYOUT: {
    HEADER_REQUIRED: true,
    KPI_CARDS_DEFAULT: true, // Unless user explicitly says no
    GRID_SYSTEM_REQUIRED: true,
    STRUCTURE_ORDER: [
      'Header Section',
      'KPI Cards Row', 
      'Charts Grid',
      'Additional Content Grid'
    ]
  },

  // Data Visualization Rules
  CHARTS: {
    ALLOWED_TYPES: [
      'line',
      'bar', 
      'pie',
      'area',
      'scatter',
      'heatmap',
      'histogram',
      'funnel'
    ],
    FORBIDDEN_TYPES: [
      'progress', // Never use progress bars for data analysis
      'gauge',
      'speedometer'
    ],
    REQUIREMENTS: {
      RESPONSIVE_CONTAINER: true,
      TOOLTIPS: true,
      LEGENDS: true,
      PROPER_LABELS: true,
      MEANINGFUL_TITLES: true
    }
  },

  // KPI Cards Rules
  KPI_CARDS: {
    MINIMUM_COUNT: 3,
    MAXIMUM_COUNT: 6,
    REQUIRED_ELEMENTS: [
      'metric_value',
      'metric_label', 
      'trend_indicator',
      'icon'
    ],
    RECOMMENDED_METRICS: [
      'revenue',
      'growth_rate',
      'user_count',
      'conversion_rate',
      'avg_order_value',
      'total_sessions'
    ]
  },

  // Layout and Design Rules  
  DESIGN: {
    GRID_SYSTEM: {
      USE_CSS_GRID: true,
      RADIX_GRID_PREFERRED: true,
      RESPONSIVE_BREAKPOINTS: true,
      CONSISTENT_GAPS: true
    },
    SPACING: {
      CARD_PADDING: 'p-6',
      GRID_GAPS: 'gap-6',
      SECTION_MARGINS: 'mb-8'
    },
    COLORS: {
      CONSISTENT_SCHEME: true,
      ACCESSIBLE_CONTRAST: true,
      SEMANTIC_COLORS: true // green for positive, red for negative
    }
  },

  // Interactive Elements
  INTERACTIVITY: {
    FILTERS: {
      DATE_RANGES: true,
      DROPDOWN_SELECTS: true,
      SEARCH_INPUTS: true,
      MULTI_SELECT: true
    },
    REQUIRED_FEATURES: [
      'hover_tooltips',
      'clickable_elements', 
      'responsive_charts',
      'filter_interactions'
    ]
  },

  // Content Requirements
  CONTENT: {
    HEADER: {
      TITLE_REQUIRED: true,
      DESCRIPTION_RECOMMENDED: true,
      CONTROLS_SECTION: true // filters, date pickers, etc.
    },
    CHARTS: {
      TITLES_REQUIRED: true,
      AXIS_LABELS: true,
      DATA_SOURCES: true,
      ERROR_HANDLING: true
    }
  }
};

export const DASHBOARD_TEMPLATES = {
  SALES: {
    required_kpis: ['total_revenue', 'total_orders', 'avg_order_value', 'customer_count'],
    recommended_charts: ['revenue_trend', 'product_distribution', 'monthly_comparison'],
    filters: ['date_range', 'product_category', 'sales_channel']
  },
  
  ANALYTICS: {
    required_kpis: ['total_pageviews', 'unique_users', 'session_duration', 'bounce_rate'],
    recommended_charts: ['traffic_trend', 'device_distribution', 'top_pages'],
    filters: ['date_range', 'traffic_source', 'device_type']
  },

  FINANCIAL: {
    required_kpis: ['total_income', 'total_expenses', 'net_savings', 'net_worth'],
    recommended_charts: ['income_vs_expenses', 'expense_categories', 'savings_trend'],
    filters: ['time_period', 'category', 'account_type']
  },

  HR: {
    required_kpis: ['total_employees', 'new_hires', 'turnover_rate', 'avg_salary'],
    recommended_charts: ['headcount_trend', 'department_distribution', 'performance_metrics'],
    filters: ['department', 'date_range', 'employee_level']
  }
};

// Validation functions
export const validateDashboardStructure = (component: string): boolean => {
  const hasHeader = component.includes('header') || component.includes('Header');
  const hasKPICards = component.includes('KPI') || component.includes('Card');
  const hasCharts = component.includes('Chart') || component.includes('Recharts');
  const hasGrid = component.includes('Grid') || component.includes('grid');
  
  return hasHeader && hasKPICards && hasCharts && hasGrid;
};

export const validateChartTypes = (component: string): boolean => {
  const forbiddenTypes = DASHBOARD_RULES.CHARTS.FORBIDDEN_TYPES;
  return !forbiddenTypes.some(type => 
    component.toLowerCase().includes(type.toLowerCase())
  );
};