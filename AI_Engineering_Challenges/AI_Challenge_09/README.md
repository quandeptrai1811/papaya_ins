# Papaya Insurance Claims Analytics Dashboard

This is a highly interactive, responsive, and type-safe **Next.js & TypeScript** application built for AI Engineering Challenge 09. It serves as a comprehensive dashboard for underwriters and claim managers to analyze and visualize a mock dataset of 5,000 insurance claims.

---

## 🌟 Key Features

1. **Granular KPI Summaries**:
   - Live aggregation of Total Claims, overall Approval Rate, Average Processing Time (days), and Total Approved Payout (THB).
2. **Interactive Visualizations (Recharts)**:
   - **Status Distribution (Donut Chart)**: Fast insight into Approved, Rejected, Under Review, and Pending percentages.
   - **Timeline Trends (Line Chart)**: Dynamic timeline plotting with a toggle to aggregate by either Week or Month.
   - **Top 10 Diagnoses by Frequency & Cost (Bar Charts)**: Horizontal bar charts highlighting hotspots. *Clicking any bar instantly filters the claim list below (interactive drill-down!)*.
   - **Insurer Performance (Grouped Bar Chart)**: Compares approval ratios across multiple insurance providers.
   - **Processing Time Distribution (Histogram)**: Displays claim processing duration frequencies.
3. **Multidimensional Filters**:
   - Instant client-side filtering by date range, claim type, insurer, country, and claim status.
4. **Sortable & Paginated Claims Grid**:
   - Displays all claims with full pagination, multi-column sorting (amount, date, status, etc.), and a **CSV Export** button.
5. **High Fidelity Skewed Dataset**:
   - Uses a pre-generated log-normal cost distribution (5,000 claims) designed via a custom generator script. This matches real-world insurance claim data (dense clustering of small outpatient claims with a long tail of expensive inpatient hospitalization claims).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Visualizations**: Recharts
- **Styling**: Vanilla CSS (globals.css) with CSS variables, a sleek modern Dark theme, glassmorphism card panels, and responsive grid layouts.
- **Typography**: Google Fonts (Outfit)

---

## 📂 Project Structure

```
AI_Challenge_09/
  app/
    layout.tsx      ← Outfit font, metadata, viewport settings
    page.tsx        ← Dashboard layout, state orchestration, and page wrapper
    globals.css     ← Design system, dark mode CSS variables, interactive hovers
  components/
    FilterBar.tsx   ← Datepicker and multi-select filter controls
    KpiCards.tsx    ← Summarized metric card panel
    StatusDonut.tsx ← Recharts Pie/Donut claim status distribution
    ClaimsOverTime.tsx ← Recharts Line claims trend over time with aggregation toggle
    DiagFreqBar.tsx ← Recharts horizontal diagnosis frequency bar chart (with drill-down)
    DiagCostBar.tsx ← Recharts horizontal diagnosis total cost bar chart (with drill-down)
    ProcessingHist.tsx ← Recharts claims processing duration frequency distribution
    InsurerBar.tsx  ← Recharts insurer approval rate comparison
    ClaimsTable.tsx ← Paginated table grid with column headers sorting and CSV exporter
  lib/
    computeKpis.ts  ← Pure functions for calculating KPI numbers
    filterData.ts   ← Helper for filtering claim arrays
  public/
    claims.json     ← Statically bundled 5,000-claim log-normal dataset
  scripts/
    generate-data.mjs ← Node.js dataset generation script
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Build & Run Production Bundle
```bash
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to interact with the dashboard.

---

## 📈 Skewed Dataset Engine

The project includes an optimized dataset generator in `scripts/generate-data.mjs` that produces a log-normal cost curve, ensuring realistic claim simulations:
- Mostly cheap, frequent outpatient visits (500 to 2,000 THB).
- Rare, highly expensive inpatient surgeries (up to 300,000 THB).
- Randomly distributed processing times (0 to 14 days) and status metrics.
