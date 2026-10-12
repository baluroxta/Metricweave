# 📊 MetricWeave AI

<p align="center">
  <strong>From raw data to clear decisions.</strong>
</p>

<p align="center">
  <em>Developed by Kandala Guru Balaji</em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#architecture--tech-stack">Tech Stack</a> •
  <a href="#power-bi-desktop-export">Power BI Export</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#running-tests">Testing</a> •
  <a href="#license--attribution">Attribution & License</a>
</p>

---

## 🚀 Overview

**MetricWeave AI** is an enterprise AI analytics platform that converts raw CSV and Excel datasets into interactive business dashboards and genuine **Microsoft Power BI Desktop (`.pbip`)** projects.

Users upload a CSV or XLSX file. The application profiles data completeness, detects duplicate rows, infers 8 data types, recommends tailored business templates (Sales, Finance, HR, Marketing, Executive Overview), calculates 100% deterministic KPIs and interactive charts, and exports a production-grade Power BI project ready to open with a double-click.

---

## ✨ Key Features (Genuinely Implemented)

### 1. Robust Data Ingestion & Quality Profiling
- **Formats Supported**: CSV (`.csv`), Excel (`.xlsx`, `.xls`), and JSON (`.json`).
- **Automatic Column Type Inference**: Integer, Decimal, Currency (`$`, `€`, `£`), Date, DateTime, Boolean, Categorical, Text, and Unique Identifiers.
- **Data Quality Score**: Calculates overall completeness (0–100%), duplicate row detection, null cell counts, and provides actionable recommendations.
- **Interactive Data Preview**: Searchable, paginated table preview with column summary statistics (min, max, mean, distinct count).

### 2. Five Adaptive Business Templates
Templates dynamically adapt to the uploaded dataset without fabricating synthetic data:
- **Sales Analytics**: Total Revenue, Total Orders, Average Order Value (AOV), Revenue by Month (area/line), Revenue by Category (bar), Regional Share of Sales (donut), and Top 5 Performers.
- **Finance Analytics**: Total Revenue, Total Expenses, Net Operating Profit, Profit Margin %, Revenue vs. Expense trends over time, and Cost Center breakdowns.
- **HR Analytics**: Workforce Headcount, Department Breakdown, Average Compensation, Hiring Velocity over time, and Tenure distributions.
- **Marketing Analytics**: Total Ad Spend, Total Conversions, Conversion Rate %, Cost Per Acquisition (CPA), Channel Performance comparison, and Acquisition timeline.
- **Executive Overview**: High-level synthesized KPIs, Key Trendline, Category Contribution, Health Scorecard, and an Evidence-based Executive Briefing.

### 3. Deterministic Analytics Engine & Visualizations
- Real, testable arithmetic calculations: `sum`, `avg`, `min`, `max`, `count`, `distinctCount`, `safeDivide`, period-over-period trends.
- Interactive **Recharts** visualizations: Bar charts, Horizontal ranked bars, Line charts, Area charts, and Donut charts.
- Customization: Rename chart titles, toggle chart types, and re-map axes.

### 4. Real Microsoft Power BI Project (.pbip) Export
MetricWeave AI generates Microsoft’s official **Power BI Project (`.pbip`)** standard:
- `<ProjectName>.pbip`: Root project descriptor.
- `<ProjectName>.Report/`: Visual containers, layout coordinates (1280x720 canvas), and `definition.pbir`.
- `<ProjectName>.SemanticModel/`: Complete Microsoft Tabular Object Model (`model.bim`, TMSL 1567 compatibility), table schemas, column types, and embedded **DAX business measures**.
- `data/dataset.csv`: Cleaned companion data file referenced by relative Power Query M script.
- `measures.dax` & `transform.m`: Ready-to-paste formulas for manual model enrichment.
- Packaged in a structured `.zip` archive for immediate download.

### 5. AI Copilot with Graceful Offline Degradation
- **With API Key (`TOGETHER_API_KEY`)**: Provides natural language answers and executive summaries using Meta Llama 3.1 8B via Together AI without exposing raw sensitive data rows.
- **Without API Key**: Operates seamlessly in 100% deterministic offline mode with zero crashes, computing evidence-based narrative summaries directly from actual numbers.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 16.1.1 (App Router) with React 19 and TypeScript 5
- **Styling**: Tailwind CSS 3.4.17 with Radix UI Themes and next-themes (Dark/Light mode)
- **Data Visualizations**: Recharts 2.15.4
- **Parsing**: Papa Parse 5.5.3 (CSV) and SheetJS / xlsx 0.18.5 (Excel)
- **Packaging**: JSZip 3.10.2 (Power BI Project archive generator)
- **Database & Persistence**: Resilient multi-tier persistence (Local disk / in-memory cache, with optional Neon PostgreSQL via Prisma 6.2.1)
- **Testing**: Vitest 5.0.3

---

## 📊 Power BI Desktop Export

### Why PBIP?
The legacy `.pbix` format is a proprietary binary container with compressed VertiPaq internal databases; creating `.pbix` server-side without Windows Power BI Desktop running as an automation host leads to file corruption. 

In contrast, **PBIP (Power BI Project)** is Microsoft's modern, open, fully documented standard introduced specifically for developer workflows and programmatic generation.

### How to Open the Exported Project in Power BI Desktop:
1. Click **Export to Power BI** in the MetricWeave AI dashboard and download the `.zip` package.
2. Extract the `.zip` archive to a folder on your computer.
3. Open Microsoft Power BI Desktop (December 2023 release or newer).
4. Double-click the **`<ProjectName>.pbip`** file, OR select **File → Open Report → Browse** and choose the `.pbip` file.
5. Click **Refresh** on the Home ribbon to update the model from `data/dataset.csv`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+ (Node v22.16 supported)
- npm 9+ or 10+

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kandala-guru-balaji/metricweave-ai.git
   cd metricweave
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Note: MetricWeave AI runs completely without any API keys! All core uploading, profiling, calculations, Recharts visuals, and Power BI PBIP exports work 100% out-of-the-box in offline deterministic mode.*

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests & Build Verification

Run the automated test suite powered by Vitest:
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Run production build:
```bash
npm run build
```

---

## 📋 Environment Variables Reference

| Variable | Description | Required | Default / Fallback |
| :--- | :--- | :--- | :--- |
| `TOGETHER_API_KEY` | Together AI API key for Meta Llama 3.1 8B Copilot | ❌ Optional | Deterministic rule-based insights |
| `DATABASE_URL` | Neon / PostgreSQL connection string | ❌ Optional | Local file and in-memory cache |
| `S3_UPLOAD_*` | AWS S3 credentials for file storage | ❌ Optional | Local disk storage in `uploads/` |

---

## ⚖️ Developer Attribution & License

**MetricWeave AI © 2026 | Developed by Kandala Guru Balaji**

- **Developer Attribution**: Designed, architected, and developed by **Kandala Guru Balaji**. All business templates, deterministic calculation engine, data profiling studio, Power BI PBIP export pipeline, and responsive UI were developed by Kandala Guru Balaji.
- **License**: Licensed under the [MIT License](LICENSE).
- **No Affiliation**: MetricWeave AI is an independent product developed by Kandala Guru Balaji with no affiliation with external consulting groups or agencies.