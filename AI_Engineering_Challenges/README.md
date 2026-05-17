# AI Engineering Challenges

---

## 📋 Challenge Suite Overview

| Challenge | Name & Description                                                                                                                | Tech Stack                           | Production URL (Vercel)                        | Source Code (GitHub)                                                                                               |    Status    |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :----------: |
| **01**    | [**Plan Comparison Page**](#1-plan-comparison-page) <br> Side-by-side comparison of Bronze, Silver, Gold plans.                   | HTML5, CSS3 (Vanilla), Google Fonts  | [Live Demo](https://papaya-ins-01.vercel.app/) | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_01) | ✅ Completed |
| **02**    | [**Claims Data Cleanup**](#2-claims-data-cleanup--report) <br> Dependency-free Python ETL script cleaning messy claims.           | Python 3 (Pure - zero libraries)     | _N/A (CLI Tool)_                               | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_02) | ✅ Completed |
| **03**    | [**Claim Notification Templates**](#3-claim-notification-email-templates) <br> Responsive lifecycle emails + variable previewer.  | Next.js, TypeScript, CSS Variables   | [Live Demo](https://papaya-ins-03.vercel.app/) | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_03) | ✅ Completed |
| **04**    | [**Insurance Glossary Search**](#4-insurance-glossary-search-app) <br> Offline-first search with alphabet jump & modals.          | Next.js, TypeScript, React           | [Live Demo](https://papaya-ins-04.vercel.app/) | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_04) | ✅ Completed |
| **05**    | [**Policy Summary Generator**](#5-policy-summary-generator) <br> Structured JSON policy parser with A4 Print-to-PDF styles.       | Next.js, TypeScript, CSS Print Rules | [Live Demo](https://papaya-ins-05.vercel.app/) | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_05) | ✅ Completed |
| **06**    | [**Policy Benefits Calculator**](#6-policy-benefits-calculator) <br> Chronological benefits engine with complex deductibles.      | Node.js, TypeScript, Jest            | _N/A (Engine/Library)_                         | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_06) | ✅ Completed |
| **07**    | [**Claims Intake Wizard**](#7-claims-intake-wizard) <br> 5-step wizard with ICD-10 autocomplete & uploader progress.              | Next.js, TypeScript, Lucide Icons    | [Live Demo](https://papaya-ins-07.vercel.app/) | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_07) | ✅ Completed |
| **09**    | [**Claims Analytics Dashboard**](#9-claims-analytics-dashboard) <br> High-fidelity charts visualizer for 5,000 log-normal claims. | Next.js, TypeScript, Recharts        | [Live Demo](https://papaya-ins-09.vercel.app/) | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_09) | ✅ Completed |
| **10**    | [**Fraud Detection Engine**](#10-fraud-detection-scoring-engine) <br> Multi-pass fraud analyzer executing 8 mathematical rules.   | Node.js, TypeScript, Jest            | _N/A (Engine/Library)_                         | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_10) | ✅ Completed |
| **12**    | [**Regulatory Rule Engine**](#12-multi-country-regulatory-rule-engine) <br> Decoupled multi-country rules engine parsing JSON configs. | Node.js, TypeScript, Jest            | _N/A (Engine/Library)_                         | [Source Folder](https://github.com/quandeptrai1811/papaya_ins/tree/main/AI_Engineering_Challenges/AI_Challenge_12) | ✅ Completed |

---

## 🛠️ Challenge Summaries & Solutions

### 1. Plan Comparison Page

- **Challenge File:** [AI_Challenge_01.md](./AI_Challenge_01/AI_Challenge_01.md)
- **Requirements:**
    - Build a side-by-side comparison table for 3 plans (Bronze, Silver, Gold).
    - Include visual indicators for included vs. not-included benefits.
    - Highlight the best value in each row (e.g., highest limit, lowest copay).
    - Add a "Recommended" badge on the Silver tier based on value-for-money ratio.
    - Ensure a fully responsive layout that stacks vertically on mobile.
- **Solution Implementation:**
    - Crafted an elegant static webpage using pure semantic HTML5 and Vanilla CSS3.
    - Embedded the premium `Outfit` font family.
    - Included a responsive CSS Grid system that adapts flawlessly between multi-column desktop tables and clean vertical cards on mobile.
    - Visualized limits and highlights using custom SVG icon indicators for tick-marks/crosses.
- **Production URL:** [https://papaya-ins-01.vercel.app/](https://papaya-ins-01.vercel.app/)
- **Code Path:** [AI_Challenge_01 Folder](./AI_Challenge_01)

---

### 2. Claims Data Cleanup & Report

- **Challenge File:** [AI_Challenge_02.md](./AI_Challenge_02/AI_Challenge_02.md)
- **Requirements:**
    - Generate a messy dataset of 500 claims containing typical data quality issues (duplicates, inconsistent text casings, typos in category structures, missing values, negative or stringified amounts, mixed currency types, and non-standard dates).
    - Write a dependency-free Python script to parse, clean, and validate all rows.
    - Output a clean, standardized CSV and write a data quality report detailing cleaning metrics and summaries.
- **Solution Implementation:**
    - Engineered two scripts: `generate_data.py` (which creates a highly realistic, messy CSV containing intentional errors in ~20% of rows) and `clean_data.py` (which cleans it).
    - Relies **entirely on Python's built-in modules** (`csv`, `datetime`, `collections`, `re`, `os`), ensuring a zero-dependency setup.
    - Normalizes text casing, maps typos (e.g., `Outpateint`, `OP` ➜ `OUTPATIENT`), handles various date structures into standard ISO 8601 (`YYYY-MM-DD`), and strips formatting anomalies.
    - Generates a beautifully structured data quality statistics report (`report.md`) detailing total rows parsed, duplicates removed, and aggregates (average claim size by type, top 5 diagnoses).
- **Code Path:** [AI_Challenge_02 Folder](./AI_Challenge_02)

---

### 3. Claim Notification Email Templates

- **Challenge File:** [AI_Challenge_03.md](./AI_Challenge_03/AI_Challenge_03.md)
- **Requirements:**
    - Code 6 high-fidelity, responsive HTML email templates covering the full claim lifecycle: Submitted, Documents Received, Under Review, Approved, Rejected, and Payment Sent.
    - Create a web application to live-preview the templates, dynamically inject sample data variables via `{{placeholders}}`, and toggle desktop/mobile viewport scales.
- **Solution Implementation:**
    - Created a gorgeous Next.js and TypeScript preview application featuring a premium glassmorphic visual style.
    - Developed 6 responsive, styled HTML email templates (located in `public/templates`) optimized for compatibility across modern email clients.
    - Built an interactive React editor sidebar that dynamically updates template fields (such as claim amount, provider name, reject reasons, etc.) with real-time UI re-renders.
    - Included a responsive viewport frame tool wrapping an iframe, enabling instant desktop/tablet/mobile simulator previewing.
- **Production URL:** [https://papaya-ins-03.vercel.app/](https://papaya-ins-03.vercel.app/)
- **Code Path:** [AI_Challenge_03 Folder](./AI_Challenge_03)

---

### 4. Insurance Glossary Search App

- **Challenge File:** [AI_Challenge_04.md](./AI_Challenge_04/AI_Challenge_04.md)
- **Requirements:**
    - Build a Single Page Application (SPA) to search 45+ complex insurance terms.
    - Implement real-time search filtering with matching text highlights.
    - Include an alphabet quick-jump sidebar that dynamically disables letters with no matching terms.
    - Render terms grouped under expandable categories.
    - Add a cross-linked definition modal allowing users to click "Related Terms" to browse without closing the window.
- **Solution Implementation:**
    - Programmed an offline-first Next.js & TypeScript application.
    - Integrated matching highlight patterns using a custom React parser regex.
    - Implemented an alphabet-index quick-jump system with scrolling coordinates that automatically dims letters with zero matching terms.
    - Built a fluid modal interface supporting nested cross-linked terms navigation with a history stack for full back-navigation compatibility.
- **Production URL:** [https://papaya-ins-04.vercel.app/](https://papaya-ins-04.vercel.app/)
- **Code Path:** [AI_Challenge_04 Folder](./AI_Challenge_04)

---

### 5. Policy Summary Generator

- **Challenge File:** [AI_Challenge_05.md](./AI_Challenge_05/AI_Challenge_05.md)
- **Requirements:**
    - Build a dynamic page that accepts a complex nested JSON policy file and outputs a clean, well-formatted, print-ready document.
    - Support different policy schemas without hardcoding (e.g. Inpatient, Outpatient, Dental, waiting periods, exclusions).
    - Format monetary numbers and currencies gracefully.
    - Highlight wait times/exclusions with warnings.
    - Optimize layout specifically for print/A4 PDF generation.
- **Solution Implementation:**
    - Developed a Next.js and TypeScript visual parser that recursively reads complex nested structures into clear HTML summary tables.
    - Created a policy switcher featuring two distinct mock profiles (`Corporate Health Plus` and `SME Basic Coverage`) to prove data mapping flexibility.
    - Incorporated locale currency parsing using `Intl.NumberFormat` to support THB and VND.
    - Wrote robust `@media print` CSS configurations that strip sidebars, controls, and headers while maintaining layout columns and background colors for a clean A4 PDF export.
- **Production URL:** [https://papaya-ins-05.vercel.app/](https://papaya-ins-05.vercel.app/)
- **Code Path:** [AI_Challenge_05 Folder](./AI_Challenge_05)

---

### 6. Policy Benefits Calculator

- **Challenge File:** [AI_Challenge_06.md](./AI_Challenge_06/AI_Challenge_06.md)
- **Requirements:**
    - Write an insurance claims benefit calculation engine in Node.js/TypeScript.
    - Chronologically process a series of claim expenses.
    - Apply policy exclusions, waiting periods, global deductibles, annual visit caps, sub-limits (per-visit, per-day, per-event), annual sub-limits, multi-tier percentage/flat copays, and total annual policy limits.
- **Solution Implementation:**
    - Programmed a highly modular claims processing pipeline in pure TypeScript.
    - Manages active state consumption (remaining deductibles, visit counts, annual limits) sequentially so that earlier claims affect subsequent claims.
    - Implements stacked financial arithmetic: global deductibles absorption ➜ sub-benefit capping ➜ flat copay subtraction ➜ percentage copay computation ➜ main annual limit capping.
    - Tested using a rigorous suite of **14 Jest unit assertions** verifying chronological calculations on a series of 20 detailed expenses.
- **Code Path:** [AI_Challenge_06 Folder](./AI_Challenge_06)

---

### 7. Claims Intake Wizard

- **Challenge File:** [AI_Challenge_07.md](./AI_Challenge_07/AI_Challenge_07.md)
- **Requirements:**
    - Design a multi-step Claims Wizard supporting Outpatient, Inpatient, and Dental claims.
    - Step 1: Select Claim Type.
    - Step 2: Member & Dependent Selector.
    - Step 3: Autocomplete ICD-10 Search, treatment dates, and automatic duration calculator for Inpatient stays.
    - Step 4: Contextual Drag-and-Drop Document Uploader (changing required items by claim type), size checking, and upload progress triggers.
    - Step 5: Summary review screen with jump-back pencil edit options, legal consent, and submission confirmation overlay.
- **Solution Implementation:**
    - Built a stunning Next.js & TypeScript multi-step wizard application utilizing Vanilla CSS.
    - Includes autocomplete ICD-10 diagnosis search highlighting queries.
    - Performs on-the-fly admission duration calculation using strict Date timestamp math.
    - Handles contextual document requirements (Discharge Summary for Inpatient, Referral Letter for Outpatient, Treatment Plan for Dental) using interactive drag-and-drop state machines with fake progress transitions.
    - Features quick-edit links allowing direct backtracking to specific steps, complete with a clean validation feedback loop.
- **Production URL:** [https://papaya-ins-07.vercel.app/](https://papaya-ins-07.vercel.app/)
- **Code Path:** [AI_Challenge_07 Folder](./AI_Challenge_07)

---

### 9. Claims Analytics Dashboard

- **Challenge File:** [AI_Challenge_09.md](./AI_Challenge_09/AI_Challenge_09.md)
- **Requirements:**
    - Build an interactive metrics dashboard analyzing 5,000 mock claims.
    - Support high-level aggregate KPI cards (payouts, approval rates, durations).
    - Render charts: Status Distribution (Donut), Claims over Time (Line, grouped by Week/Month), Top 10 diagnoses by cost and frequency (Bar), Insurer Performance (Bar), and Duration frequency (Histogram).
    - Implement full filtering (date range, type, insurer, country) and drill-down interactions (clicking a diagnosis bar filters the data table instantly).
    - Include a paginated, sortable claim grid with CSV export.
- **Solution Implementation:**
    - Engineered a premium dark-themed Dashboard with glassmorphic cards in Next.js & TypeScript using `recharts`.
    - Designed an optimized Node.js data generation script (`scripts/generate-data.mjs`) executing log-normal cost distribution functions to simulate high-frequency outpatient claims mixed with a long-tail of expensive inpatient procedures.
    - Programmed custom drill-down state variables: clicking any diagnosis or status segment instantly recalculates the entire dashboard KPIs and narrows down the claims table.
    - Features robust column headers sorting, pagination, and instant CSV generation.
- **Production URL:** [https://papaya-ins-09.vercel.app/](https://papaya-ins-09.vercel.app/)
- **Code Path:** [AI_Challenge_09 Folder](./AI_Challenge_09)

---

### 10. Fraud Detection Scoring Engine

- **Challenge File:** [AI_Challenge_10.md](./AI_Challenge_10/AI_Challenge_10.md)
- **Requirements:**
    - Create a rules-based fraud detection engine in TypeScript processing 2,000 claims.
    - Execute 8 specific rules: Exact Duplicate, Rapid Re-submission (sliding window), Upcoding (standard deviation math), Unbundling (bundle mappings), Phantom Billing (burst provider counts), Weekend Anomaly (activity ratios), Diagnosis-Procedure Mismatch, and Amount Clustering (threshold checks).
    - Provide itemized, weighted risk evidence.
    - Target recall ≥ 70%, False Positive Rate ≤ 20%, and run execution < 30 seconds.
- **Solution Implementation:**
    - Developed an ultra-fast, two-pass rules execution engine in pure TypeScript.
    - **Pass 1:** Aggregates provider, member, and procedural statistics in O(N) linear time to establish normal billing baselines.
    - **Pass 2:** Scores each claim individually using weighted rule matrices, appending descriptive text evidence for each triggered pattern.
    - Bundles a deterministic generation script (`scripts/generate_data.ts`) to seed 2,000 normal claims embedding exactly 200 stealthy fraud cases.
    - **Results achieved:**
        - **Recall:** `78.10%` (Target: ≥ 70%)
        - **False Positive Rate:** `6.50%` (Target: ≤ 20%)
        - **Speed:** `86ms` (Target: < 30 seconds)
    - Verified using **17 comprehensive unit tests** in Jest.
- **Code Path:** [AI_Challenge_10 Folder](./AI_Challenge_10)

---

### 12. Multi-Country Regulatory Rule Engine

- **Challenge File:** [AI_Challenge_12.md](./AI_Challenge_12/AI_Challenge_12.md)
- **Requirements:**
    - Build a configurable regulatory rules engine where country-specific rules are defined dynamically via decoupled JSON configuration files.
    - Handle 5 distinct rule types: document requirements, processing SLA checking, waiting periods, data privacy masking, and coverage mandates.
    - Enforce rules across three core countries (Thailand, Vietnam, Hong Kong) with realistic regulatory policies.
    - Support effective date rule versioning and rule diff comparisons between countries.
- **Solution Implementation:**
    - Programmed a decoupled rule evaluator structure in pure Node.js & TypeScript.
    - Implemented rule filtering based on the claim's `submission_date` relative to the rule's active lifecycle (`effective_date` & `expiry_date`).
    - Engineered highly specific evaluation returns carrying actionable remediation actions and precise validation failure texts.
    - Formulated a comprehensive diff comparison module that groups rules by type to print structural policy differences.
    - Delivered a full interactive CLI supporting `npm start` (validate 15 test claims), `view <country>`, `diff <countryA> <countryB>`, and a skeleton `singapore.json` configuration demonstrating zero-code country onboarding.
    - Tested using **17 rigorous Jest unit assertions** verifying all edge cases.
- **Code Path:** [AI_Challenge_12 Folder](./AI_Challenge_12)

---

## 🚀 Running Any Project Locally

All web/Next.js projects follow the standard Next.js lifecycle. Backend engine projects run via Node.js/TypeScript.

### 🌐 Next.js Web Projects (03, 04, 05, 07, 09)

1. Navigate to the project directory:
    ```bash
    cd AI_Challenge_[number]
    ```
2. Install standard node modules:
    ```bash
    npm install
    ```
3. Boot up the local development server:
    ```bash
    npm run dev
    ```
4. Open [http://localhost:3000](http://localhost:3000) to view the application.

### 🐍 Python Data Project (02)

1. Navigate to the folder:
    ```bash
    cd AI_Challenge_02
    ```
2. Clean messy CSV data and output standard reports:
    ```bash
    python3 clean_data.py
    ```
3. Check the `output/` folder for clean CSV files and metrics reports.

### 💻 Node.js Engine & CLI Projects (06, 10, 12)

1. Navigate to the project directory:
    ```bash
    cd AI_Challenge_[number]
    ```
2. Install the dev dependencies:
    ```bash
    npm install
    ```
3. Run the primary test engine:
    ```bash
    npm start
    ```
4. Execute the unit test assertions using Jest:
    ```bash
    npm test
    ```
