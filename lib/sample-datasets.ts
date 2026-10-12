export interface SampleDatasetInfo {
  id: string;
  name: string;
  domain: "sales" | "finance" | "hr" | "marketing";
  description: string;
  csvContent: string;
}

export const SAMPLE_DATASETS: SampleDatasetInfo[] = [
  {
    id: "sample-sales",
    name: "Global Retail & E-Commerce Sales",
    domain: "sales",
    description: "Multi-regional sales transactions with orders, revenue, discounts, product categories, and customer segments.",
    csvContent: `Order_ID,Order_Date,Customer_Segment,Region,Product_Category,Product_Name,Quantity,Unit_Price,Discount,Revenue
ORD-1001,2024-01-05,Corporate,North America,Technology,Quantum Ultrabook,2,1200.00,0.05,2280.00
ORD-1002,2024-01-08,Consumer,Europe,Furniture,Ergonomic Mesh Chair,4,350.00,0.00,1400.00
ORD-1003,2024-01-14,Small Business,Asia Pacific,Technology,Wireless Noise-Canceling Hub,5,180.00,0.10,810.00
ORD-1004,2024-01-20,Consumer,North America,Office Supplies,Premium Gel Pen Set,12,24.50,0.00,294.00
ORD-1005,2024-02-02,Corporate,Europe,Technology,4K Curved Monitor,3,550.00,0.05,1567.50
ORD-1006,2024-02-11,Consumer,Latin America,Furniture,Standing Desk Converter,2,420.00,0.10,756.00
ORD-1007,2024-02-18,Small Business,North America,Office Supplies,Laser Toner Cartridge,6,85.00,0.00,510.00
ORD-1008,2024-02-25,Corporate,Asia Pacific,Technology,Quantum Ultrabook,4,1200.00,0.08,4416.00
ORD-1009,2024-03-03,Consumer,Europe,Office Supplies,Heavy-Duty Shredder,1,210.00,0.00,210.00
ORD-1010,2024-03-12,Small Business,North America,Furniture,Executive Leather Armchair,2,680.00,0.15,1156.00
ORD-1011,2024-03-19,Corporate,Latin America,Technology,Smart Conferencing Speaker,3,290.00,0.00,870.00
ORD-1012,2024-03-27,Consumer,North America,Technology,Quantum Ultrabook,1,1200.00,0.00,1200.00
ORD-1013,2024-04-02,Small Business,Europe,Furniture,Ergonomic Mesh Chair,6,350.00,0.12,1848.00
ORD-1014,2024-04-10,Corporate,North America,Technology,4K Curved Monitor,5,550.00,0.10,2475.00
ORD-1015,2024-04-16,Consumer,Asia Pacific,Office Supplies,Premium Gel Pen Set,15,24.50,0.00,367.50
ORD-1016,2024-04-24,Corporate,Europe,Furniture,Standing Desk Converter,4,420.00,0.05,1596.00
ORD-1017,2024-05-04,Small Business,Latin America,Technology,Wireless Noise-Canceling Hub,8,180.00,0.15,1224.00
ORD-1018,2024-05-12,Consumer,North America,Furniture,Executive Leather Armchair,1,680.00,0.00,680.00
ORD-1019,2024-05-20,Corporate,Asia Pacific,Technology,Quantum Ultrabook,3,1200.00,0.05,3420.00
ORD-1020,2024-05-29,Consumer,Europe,Technology,Smart Conferencing Speaker,2,290.00,0.00,580.00`,
  },
  {
    id: "sample-finance",
    name: "Corporate Financial & Operating Expenses",
    domain: "finance",
    description: "Financial journal ledger with monthly revenues, operating costs, departments, and category cost centers.",
    csvContent: `Period,Date,Department,Cost_Center,Expense_Category,Revenue,Operating_Expense,Net_Income
2024-Q1,2024-01-31,Engineering,R&D,Cloud Infrastructure,185000.00,42000.00,143000.00
2024-Q1,2024-01-31,Sales,Sales Ops,Travel & Client Dining,0.00,18500.00,-18500.00
2024-Q1,2024-01-31,Marketing,Growth,Paid Search Advertising,0.00,35000.00,-35000.00
2024-Q1,2024-02-28,Engineering,Product,Specialized SaaS Licenses,210000.00,12800.00,197200.00
2024-Q1,2024-02-28,Operations,Facilities,Office Lease & Utilities,0.00,24000.00,-24000.00
2024-Q1,2024-02-28,Sales,Commissions,Sales Incentive Bonuses,0.00,38000.00,-38000.00
2024-Q1,2024-03-31,Engineering,R&D,Security Audit & Compliance,245000.00,15000.00,230000.00
2024-Q1,2024-03-31,Marketing,Branding,Industry Summit Sponsorship,0.00,29000.00,-29000.00
2024-Q2,2024-04-30,Engineering,R&D,Cloud Infrastructure,260000.00,46500.00,213500.00
2024-Q2,2024-04-30,Sales,Sales Ops,Sales Enablement Tools,0.00,14200.00,-14200.00
2024-Q2,2024-04-30,Operations,Legal,External Legal Counsel,0.00,16500.00,-16500.00
2024-Q2,2024-05-31,Engineering,Product,AI Model Inference Credits,285000.00,52000.00,233000.00
2024-Q2,2024-05-31,Marketing,Growth,Social Ad Campaigns,0.00,41000.00,-41000.00
2024-Q2,2024-05-31,Operations,Facilities,Office Lease & Utilities,0.00,24000.00,-24000.00
2024-Q2,2024-06-30,Engineering,R&D,Developer Hardware Refresh,310000.00,34000.00,276000.00
2024-Q2,2024-06-30,Sales,Commissions,Sales Incentive Bonuses,0.00,46000.00,-46000.00`,
  },
  {
    id: "sample-hr",
    name: "Enterprise Workforce & Talent Demographics",
    domain: "hr",
    description: "Employee directory containing departments, job roles, compensation, tenure, and performance ratings.",
    csvContent: `Employee_ID,Full_Name,Department,Job_Role,Hire_Date,Tenure_Years,Annual_Salary,Performance_Rating,Employment_Type,Location
EMP-501,Elena Rostova,Engineering,Senior Backend Engineer,2021-03-15,3.2,142000,4.8,Full-Time,Remote
EMP-502,David Chen,Product,Lead Product Manager,2020-07-01,3.9,155000,4.9,Full-Time,San Francisco
EMP-503,Amina Diallo,Marketing,Growth Marketing Specialist,2022-01-10,2.4,88000,4.2,Full-Time,New York
EMP-504,Marcus Vance,Sales,Enterprise Account Executive,2019-11-04,4.6,125000,4.6,Full-Time,Chicago
EMP-505,Priya Sharma,Engineering,DevOps Lead,2021-09-20,2.7,148000,4.7,Full-Time,Remote
EMP-506,Lucas Gomez,Design,Senior UX Designer,2022-05-18,2.1,118000,4.5,Full-Time,Austin
EMP-507,Hannah Scott,HR,Talent Acquisition Partner,2023-02-01,1.3,79000,4.1,Full-Time,New York
EMP-508,Kenji Sato,Engineering,Staff Infrastructure Architect,2018-04-12,5.9,178000,5.0,Full-Time,San Francisco
EMP-509,Rachel Green,Sales,SDR Team Lead,2022-10-05,1.7,72000,4.3,Full-Time,Chicago
EMP-510,Mateo Ruiz,Customer Success,Customer Success Manager,2021-12-01,2.5,84000,4.4,Full-Time,Remote
EMP-511,Zoe Williams,Product,Technical Product Specialist,2023-06-15,1.0,92000,4.0,Full-Time,San Francisco
EMP-512,Liam Murphy,Engineering,Frontend Engineer,2022-08-22,1.8,112000,4.6,Full-Time,Remote
EMP-513,Chloe Bennett,Marketing,Content Strategist,2023-04-10,1.2,76000,4.2,Full-Time,New York
EMP-514,Noah Taylor,Finance,Financial Analyst,2022-03-01,2.3,95000,4.5,Full-Time,Chicago
EMP-515,Sophia Rossi,Engineering,QA Automation Lead,2020-10-15,3.6,128000,4.7,Full-Time,Remote`,
  },
  {
    id: "sample-marketing",
    name: "Omnichannel Marketing Campaigns",
    domain: "marketing",
    description: "Paid and organic digital acquisition campaign metrics tracking clicks, spend, leads, and conversion efficiency.",
    csvContent: `Campaign_ID,Campaign_Name,Channel,Start_Date,Impressions,Clicks,Ad_Spend,Conversions,Attributed_Revenue
CMP-201,Brand Awareness Q1,Google Search,2024-01-10,145000,8200,4500.00,320,16500.00
CMP-202,Retargeting Summit,LinkedIn Ads,2024-01-15,62000,2100,5200.00,180,14200.00
CMP-203,Product Launch Wave,Meta Ads,2024-02-01,280000,14500,7800.00,540,28500.00
CMP-204,Organic SEO Push,Organic Search,2024-02-10,95000,6400,0.00,290,11800.00
CMP-205,Email Drip Series,Email Marketing,2024-02-20,42000,5800,450.00,410,22400.00
CMP-206,Spring Promo Blast,Google Search,2024-03-05,190000,11200,6200.00,480,24800.00
CMP-207,Executive Webinar,LinkedIn Ads,2024-03-18,54000,1950,4900.00,210,18600.00
CMP-208,Partner Co-Marketing,Affiliate,2024-04-02,78000,4200,1800.00,195,9200.00
CMP-209,Summer Sale Blitz,Meta Ads,2024-04-15,310000,16800,9100.00,620,34500.00
CMP-210,Newsletter Feature,Email Marketing,2024-05-01,48000,6900,500.00,490,26800.00
CMP-211,High-Intent Keywords,Google Search,2024-05-15,165000,9800,5800.00,430,22100.00
CMP-212,Talent & Culture Spotlight,YouTube Video,2024-05-25,120000,3400,2200.00,85,3800.00`,
  },
];
