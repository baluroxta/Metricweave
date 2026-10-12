import dedent from "dedent";

export const dashboardExamples = {
  "sales dashboard": {
    prompt: "Create a sales dashboard with revenue charts and KPI cards",
    response: dedent(`
      I'll create a comprehensive sales dashboard with KPI cards and various chart types using a grid system.

      \`\`\`tsx{filename=sales-dashboard.tsx}
      import { useState } from 'react'
      import { Card, Text, Strong, Select, Grid, Box, Flex } from '@radix-ui/themes'
      import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
      import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react'

      const salesData = [
        { month: 'Jan', revenue: 45000, orders: 120, customers: 85 },
        { month: 'Feb', revenue: 52000, orders: 140, customers: 92 },
        { month: 'Mar', revenue: 48000, orders: 135, customers: 88 },
        { month: 'Apr', revenue: 61000, orders: 165, customers: 105 },
        { month: 'May', revenue: 55000, orders: 150, customers: 98 },
        { month: 'Jun', revenue: 67000, orders: 180, customers: 115 }
      ];

      const productData = [
        { name: 'Product A', value: 35, color: '#8884d8' },
        { name: 'Product B', value: 25, color: '#82ca9d' },
        { name: 'Product C', value: 20, color: '#ffc658' },
        { name: 'Product D', value: 20, color: '#ff7300' }
      ];

      export default function SalesDashboard() {
        const [timeRange, setTimeRange] = useState('6months');

        const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
        const avgOrderValue = totalRevenue / totalOrders;
        const totalCustomers = salesData.reduce((sum, item) => sum + item.customers, 0);

        return (
          <Box className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <Flex justify="between" align="center" className="mb-8">
              <Box>
                <Strong size="8" className="text-gray-900">Sales Dashboard</Strong>
                <Text as="p" size="4" color="gray" className="mt-2">
                  Monitor your sales performance and key metrics
                </Text>
              </Box>
              <Select.Root value={timeRange} onValueChange={setTimeRange}>
                <Select.Trigger className="w-40" />
                <Select.Content>
                  <Select.Item value="30days">Last 30 Days</Select.Item>
                  <Select.Item value="3months">Last 3 Months</Select.Item>
                  <Select.Item value="6months">Last 6 Months</Select.Item>
                  <Select.Item value="1year">Last Year</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* KPI Cards */}
            <Grid columns="4" gap="6" className="mb-8">
              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Revenue</Text>
                    <Strong size="6" className="text-green-600">
                      \${totalRevenue.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
                    </Text>
                  </Box>
                  <Box className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Orders</Text>
                    <Strong size="6" className="text-blue-600">
                      {totalOrders.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" /> +8.2%
                    </Text>
                  </Box>
                  <Box className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Avg Order Value</Text>
                    <Strong size="6" className="text-purple-600">
                      \${Math.round(avgOrderValue).toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" /> +3.8%
                    </Text>
                  </Box>
                  <Box className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Customers</Text>
                    <Strong size="6" className="text-orange-600">
                      {totalCustomers}
                    </Strong>
                    <Text size="2" color="green" className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" /> +15.3%
                    </Text>
                  </Box>
                  <Box className="p-3 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </Box>
                </Flex>
              </Card>
            </Grid>

            {/* Charts Grid */}
            <Grid columns="2" gap="6" className="mb-6">
              {/* Revenue Trend */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Revenue Trend</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [\`$\${value.toLocaleString()}\`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Product Sales Distribution */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Product Sales Distribution</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
                    >
                      {productData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Bottom Charts */}
            <Grid columns="2" gap="6">
              {/* Orders and Customers */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Orders & Customers</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                    <Bar dataKey="customers" fill="#82ca9d" name="Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Comparison */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Monthly Performance</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Box>
        )
      }
      \`\`\`

      This sales dashboard follows the specified design rules:

      1. **Header Section**: Clear title and time range selector
      2. **KPI Cards Row**: Four key performance indicators with icons and trend indicators
      3. **Grid System**: All charts use CSS Grid for responsive layout
      4. **Chart Types**: Line charts, bar charts, pie charts, and area charts (no progress bars)
      5. **Data Analysis Focus**: Emphasizes business metrics and trends
      6. **Professional Design**: Clean, modern interface with proper spacing and colors
      
      The dashboard provides comprehensive sales insights with revenue trends, product distribution, customer metrics, and comparative analysis.
    `),
  },
  
  "analytics dashboard": {
    prompt: "Create a web analytics dashboard with user engagement metrics",
    response: dedent(`
      I'll create a comprehensive web analytics dashboard with KPI cards and various charts using a grid system.

      \`\`\`tsx{filename=analytics-dashboard.tsx}
      import { useState } from 'react'
      import { Card, Text, Strong, Select, Grid, Box, Flex } from '@radix-ui/themes'
      import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
      import { Eye, Users, Clock, MousePointer } from 'lucide-react'

      const analyticsData = [
        { date: '2024-01-01', pageviews: 1250, users: 850, sessions: 920, bounceRate: 0.35 },
        { date: '2024-01-02', pageviews: 1380, users: 920, sessions: 1010, bounceRate: 0.32 },
        { date: '2024-01-03', pageviews: 1120, users: 780, sessions: 850, bounceRate: 0.38 },
        { date: '2024-01-04', pageviews: 1450, users: 980, sessions: 1080, bounceRate: 0.30 },
        { date: '2024-01-05', pageviews: 1680, users: 1120, sessions: 1250, bounceRate: 0.28 },
        { date: '2024-01-06', pageviews: 1580, users: 1050, sessions: 1180, bounceRate: 0.31 },
        { date: '2024-01-07', pageviews: 1720, users: 1180, sessions: 1320, bounceRate: 0.26 }
      ];

      const deviceData = [
        { name: 'Desktop', value: 45, color: '#8884d8' },
        { name: 'Mobile', value: 35, color: '#82ca9d' },
        { name: 'Tablet', value: 20, color: '#ffc658' }
      ];

      const topPages = [
        { page: '/home', views: 3250, percentage: 28 },
        { page: '/products', views: 2180, percentage: 19 },
        { page: '/about', views: 1950, percentage: 17 },
        { page: '/contact', views: 1420, percentage: 12 },
        { page: '/blog', views: 1100, percentage: 9 }
      ];

      export default function AnalyticsDashboard() {
        const [dateRange, setDateRange] = useState('7days');

        const totalPageviews = analyticsData.reduce((sum, item) => sum + item.pageviews, 0);
        const totalUsers = analyticsData.reduce((sum, item) => sum + item.users, 0);
        const totalSessions = analyticsData.reduce((sum, item) => sum + item.sessions, 0);
        const avgBounceRate = analyticsData.reduce((sum, item) => sum + item.bounceRate, 0) / analyticsData.length;
        const avgSessionDuration = 4.2; // minutes

        return (
          <Box className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <Flex justify="between" align="center" className="mb-8">
              <Box>
                <Strong size="8" className="text-gray-900">Analytics Dashboard</Strong>
                <Text as="p" size="4" color="gray" className="mt-2">
                  Track your website performance and user engagement
                </Text>
              </Box>
              <Select.Root value={dateRange} onValueChange={setDateRange}>
                <Select.Trigger className="w-40" />
                <Select.Content>
                  <Select.Item value="7days">Last 7 Days</Select.Item>
                  <Select.Item value="30days">Last 30 Days</Select.Item>
                  <Select.Item value="90days">Last 90 Days</Select.Item>
                  <Select.Item value="1year">Last Year</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* KPI Cards */}
            <Grid columns="4" gap="6" className="mb-8">
              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Pageviews</Text>
                    <Strong size="6" className="text-blue-600">
                      {totalPageviews.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="mt-1">+15.2% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Unique Users</Text>
                    <Strong size="6" className="text-green-600">
                      {totalUsers.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="mt-1">+8.7% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Avg Session Duration</Text>
                    <Strong size="6" className="text-purple-600">
                      {avgSessionDuration}m
                    </Strong>
                    <Text size="2" color="green" className="mt-1">+12.3% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Bounce Rate</Text>
                    <Strong size="6" className="text-orange-600">
                      {(avgBounceRate * 100).toFixed(1)}%
                    </Strong>
                    <Text size="2" color="red" className="mt-1">-5.2% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-orange-100 rounded-lg">
                    <MousePointer className="w-6 h-6 text-orange-600" />
                  </Box>
                </Flex>
              </Card>
            </Grid>

            {/* Main Charts Grid */}
            <Grid columns="2" gap="6" className="mb-6">
              {/* Traffic Trend */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Traffic Trend</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Area type="monotone" dataKey="pageviews" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Pageviews" />
                    <Area type="monotone" dataKey="users" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Device Distribution */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Device Distribution</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Bottom Grid */}
            <Grid columns="2" gap="6">
              {/* Sessions and Bounce Rate */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Sessions & Bounce Rate</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} name="Sessions" />
                    <Line yAxisId="right" type="monotone" dataKey="bounceRate" stroke="#82ca9d" strokeWidth={2} name="Bounce Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Top Pages */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Top Pages</Strong>
                <Box className="space-y-4">
                  {topPages.map((page, index) => (
                    <Flex key={index} justify="between" align="center" className="py-2">
                      <Box className="flex-1">
                        <Text weight="medium">{page.page}</Text>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: \`\${page.percentage}%\` }}
                          ></div>
                        </div>
                      </Box>
                      <Box className="ml-4 text-right">
                        <Strong size="3">{page.views.toLocaleString()}</Strong>
                        <Text size="2" color="gray" className="block">{page.percentage}%</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Box>
        )
      }
      \`\`\`

      This analytics dashboard follows all the specified design rules:

      1. **Header Section**: Clear title with date range selector
      2. **KPI Cards Row**: Four essential web analytics metrics with icons
      3. **Grid System**: Responsive CSS Grid layout throughout
      4. **Chart Types**: Area charts, pie charts, line charts (no progress bars)
      5. **Data Analysis Focus**: Web analytics metrics and user behavior insights
      6. **Professional Design**: Clean interface with proper spacing and visual hierarchy

      The dashboard provides comprehensive analytics insights including traffic trends, device distribution, session metrics, and top-performing pages.
    `),
  },

  "financial dashboard": {
    prompt: "Create a financial dashboard with expense tracking and budget analysis",
    response: dedent(`
      I'll create a comprehensive financial dashboard with KPI cards and various charts using a grid system.

      \`\`\`tsx{filename=financial-dashboard.tsx}
      import { useState } from 'react'
      import { Card, Text, Strong, Select, Grid, Box, Flex } from '@radix-ui/themes'
      import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
      import { DollarSign, TrendingUp, CreditCard, PiggyBank } from 'lucide-react'

      const financialData = [
        { month: 'Jan', income: 8500, expenses: 6200, savings: 2300, budget: 6000 },
        { month: 'Feb', income: 8800, expenses: 6500, savings: 2300, budget: 6000 },
        { month: 'Mar', income: 8600, expenses: 5900, savings: 2700, budget: 6000 },
        { month: 'Apr', income: 9200, expenses: 6800, savings: 2400, budget: 6000 },
        { month: 'May', income: 8900, expenses: 6100, savings: 2800, budget: 6000 },
        { month: 'Jun', income: 9500, expenses: 6400, savings: 3100, budget: 6000 }
      ];

      const expenseCategories = [
        { name: 'Housing', value: 35, amount: 2240, color: '#8884d8' },
        { name: 'Food', value: 20, amount: 1280, color: '#82ca9d' },
        { name: 'Transportation', value: 15, amount: 960, color: '#ffc658' },
        { name: 'Utilities', value: 12, amount: 768, color: '#ff7300' },
        { name: 'Entertainment', value: 10, amount: 640, color: '#8dd1e1' },
        { name: 'Other', value: 8, amount: 512, color: '#d084d0' }
      ];

      const investments = [
        { type: 'Stocks', value: 45000, growth: 12.5 },
        { type: 'Bonds', value: 25000, growth: 4.2 },
        { type: 'Real Estate', value: 180000, growth: 8.7 },
        { type: 'Cash', value: 15000, growth: 1.5 }
      ];

      export default function FinancialDashboard() {
        const [timeframe, setTimeframe] = useState('6months');

        const totalIncome = financialData.reduce((sum, item) => sum + item.income, 0);
        const totalExpenses = financialData.reduce((sum, item) => sum + item.expenses, 0);
        const totalSavings = financialData.reduce((sum, item) => sum + item.savings, 0);
        const netWorth = investments.reduce((sum, item) => sum + item.value, 0);

        return (
          <Box className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <Flex justify="between" align="center" className="mb-8">
              <Box>
                <Strong size="8" className="text-gray-900">Financial Dashboard</Strong>
                <Text as="p" size="4" color="gray" className="mt-2">
                  Track your financial health and manage your budget
                </Text>
              </Box>
              <Select.Root value={timeframe} onValueChange={setTimeframe}>
                <Select.Trigger className="w-40" />
                <Select.Content>
                  <Select.Item value="3months">Last 3 Months</Select.Item>
                  <Select.Item value="6months">Last 6 Months</Select.Item>
                  <Select.Item value="1year">Last Year</Select.Item>
                  <Select.Item value="all">All Time</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* KPI Cards */}
            <Grid columns="4" gap="6" className="mb-8">
              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Income</Text>
                    <Strong size="6" className="text-green-600">
                      \${totalIncome.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="mt-1">+5.8% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Expenses</Text>
                    <Strong size="6" className="text-red-600">
                      \${totalExpenses.toLocaleString()}
                    </Strong>
                    <Text size="2" color="red" className="mt-1">+2.1% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-red-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Total Savings</Text>
                    <Strong size="6" className="text-blue-600">
                      \${totalSavings.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="mt-1">+18.2% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-blue-100 rounded-lg">
                    <PiggyBank className="w-6 h-6 text-blue-600" />
                  </Box>
                </Flex>
              </Card>

              <Card className="p-6">
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" color="gray" weight="medium">Net Worth</Text>
                    <Strong size="6" className="text-purple-600">
                      \${netWorth.toLocaleString()}
                    </Strong>
                    <Text size="2" color="green" className="mt-1">+8.9% vs last period</Text>
                  </Box>
                  <Box className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </Box>
                </Flex>
              </Card>
            </Grid>

            {/* Main Charts Grid */}
            <Grid columns="2" gap="6" className="mb-6">
              {/* Income vs Expenses */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Income vs Expenses</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [\`$\${value.toLocaleString()}\`]} />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Income" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Expense Categories */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Expense Categories</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [\`$\${props.payload.amount}\`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Bottom Grid */}
            <Grid columns="2" gap="6">
              {/* Savings Trend */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Savings Trend</Strong>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [\`$\${value.toLocaleString()}\`]} />
                    <Line type="monotone" dataKey="savings" stroke="#8884d8" strokeWidth={3} name="Savings" />
                    <Line type="monotone" dataKey="budget" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" name="Budget Target" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Investment Portfolio */}
              <Card className="p-6">
                <Strong size="4" className="mb-4 block">Investment Portfolio</Strong>
                <Box className="space-y-4">
                  {investments.map((investment, index) => (
                    <Flex key={index} justify="between" align="center" className="py-3 border-b border-gray-100 last:border-b-0">
                      <Box>
                        <Text weight="medium" size="3">{investment.type}</Text>
                        <Text size="2" color="gray">\${investment.value.toLocaleString()}</Text>
                      </Box>
                      <Box className="text-right">
                        <Text 
                          size="3" 
                          weight="medium"
                          className={investment.growth > 0 ? 'text-green-600' : 'text-red-600'}
                        >
                          {investment.growth > 0 ? '+' : ''}{investment.growth}%
                        </Text>
                        <Text size="2" color="gray">Annual Return</Text>
                      </Box>
                    </Flex>
                  ))}
                  <Flex justify="between" align="center" className="pt-3 border-t-2 border-gray-200">
                    <Strong size="4">Total Portfolio</Strong>
                    <Strong size="4" className="text-purple-600">
                      \${netWorth.toLocaleString()}
                    </Strong>
                  </Flex>
                </Box>
              </Card>
            </Grid>
          </Box>
        )
      }
      \`\`\`

      This financial dashboard follows all the specified design rules:

      1. **Header Section**: Clear title with timeframe selector
      2. **KPI Cards Row**: Four essential financial metrics with appropriate icons
      3. **Grid System**: Responsive CSS Grid layout for all sections
      4. **Chart Types**: Area charts, pie charts, line charts (no progress bars)
      5. **Data Analysis Focus**: Financial metrics, budget tracking, and investment analysis
      6. **Professional Design**: Clean, modern interface with financial color coding

      The dashboard provides comprehensive financial insights including income/expense analysis, budget tracking, expense categorization, savings trends, and investment portfolio performance.
    `),
  }
};

// Add dashboard examples to the main examples object
export const extendedExamples = {
  ...dashboardExamples
};