# Papaya Insurance Claims Submission Wizard

This is a premium, fully responsive, multi-step **Next.js & TypeScript** claims submission application built for AI Engineering Challenge 07. It provides members with a seamless, high-fidelity wizard interface to submit Outpatient, Inpatient, and Dental insurance claims.

---

## 🌟 Key Features

1. **Structured Multi-Step Pipeline**:
   - **Step 1: Select Claim Type**: Large, tactile category cards for Outpatient, Inpatient, and Dental claims with high-contrast active states.
   - **Step 2: Member & Policy Information**: Pre-filled verified member details, with a fluid toggle and selector to submit claims on behalf of registered dependents.
   - **Step 3: Diagnosis & Treatment**:
     - *Autocomplete ICD-10 Search*: High-performance query filtering against standard medical codes with search highlight markers.
     - *Provider Suggestions*: Auto-suggests nearby hospitals and clinics on-the-fly.
     - *Dynamic Inpatient Calculations*: Calculates and displays length-of-stay (days) automatically based on admission and discharge dates.
   - **Step 4: Document Uploads**:
     - Interactive drag-and-drop zones tailored specifically for the chosen claim type (e.g. Discharge Summaries for Inpatient, Treatment Plans for Dental).
     - Simulated dynamic progress bar transitions, strict 10MB size capping, and file format validation (PDF, JPG, PNG).
   - **Step 5: Review & Submit**:
     - Consolidates all entered data in a readable preview with pencil shortcuts to jump back and edit any step instantly.
     - Enforces a legal declaration checkbox before allowing submission.
     - Renders a clean submission confirmation modal with dynamic claim reference numbers and an instant "Submit Another" reset trigger.

2. **Responsive Visual System**:
   - Meticulously designed for seamless transitions across **Mobile, Tablet, and Desktop** devices.
   - Built using a glassmorphic aesthetic, sleek border glows, smooth state animations, and a rich, custom dark/light neutral palette.

3. **TypeScript Porting**:
   - Fully typed props interfaces (`StepIndicatorProps`, `Step1Props`, etc.), ref elements, and form state schemas.
   - Completely resolved implicit ref-return callback warnings and Date time coercions.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (globals.css) featuring media queries, flexbox/grid layout systems, custom scrollbars, and interactive transitions.
- **Typography**: Google Fonts (Outfit)

---

## 📂 Project Structure

```
AI_Challenge_07/
  app/
    layout.tsx      ← Outfit font, metadata, baseline viewport settings
    page.tsx        ← Orchestrator tracking state, step routing, and submission logic
    globals.css     ← Design token system, responsive media queries, step-cards CSS
  components/
    StepIndicator.tsx ← Sticky step progress bar tracking current/active/completed phases
    Step1ClaimType.tsx ← Claim category selector card layout
    Step2Member.tsx    ← Pre-filled policy inputs with dependent selector triggers
    Step3Diagnosis.tsx ← ICD-10 autocomplete search dropdown and date math
    Step4Documents.tsx ← Drag-and-drop slots with simulated upload progress bars
    Step5Review.tsx    ← Fully cross-linked confirmation overview and submit modal
  data/
    icd10Codes.ts   ← Bundled dictionary of standard medical diagnosis codes
    mockData.ts     ← Mock registered dependents and hospital suggestions
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
Open [http://localhost:3000](http://localhost:3000) in your web browser to submit a claim.
