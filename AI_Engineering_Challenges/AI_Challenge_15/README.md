# AI Challenge 15 — Multi-Tenant Configuration Platform
## Papaya Core-Config Studio

Welcome to **Papaya Core-Config Studio** — a next-generation, high-fidelity Multi-Tenant configuration workbench built using **Next.js 15, TypeScript, and Glassmorphic Vanilla CSS**. 

This platform serves as a zero-code onboarding portal for new insurance companies (tenants). Each tenant can fully customize their branding identities, processing SLA days, document requirements, approval tiers, automatic routing rules, custom templates, and dynamic submission fields.

---

## 📂 Project Structure

- `app/`: Core Next.js router setup
  - `layout.tsx`: Configures typography presets using Google Fonts (`Outfit` + `Inter`).
  - `globals.css`: Implements premium dark-mode styling variables, scrollbars, and fine borders.
  - `page.tsx`: Orchestrates state synchronizations with `localStorage` (CRUD, History tracking, rollbacks).
- `components/`: Premium reusable UI components
  - `BrandPreview.tsx`: Renders the live mockup client card with the insurer's primary colors.
  - `TenantForm.tsx`: Tabbed configuration wizard with robust field validation.
  - `ClaimSimulator.tsx`: Sandbox playground to test-run claims and visualize evaluations.
  - `TenantDiff.tsx`: Side-by-side comparative diff grid isolating operational deltas.
  - `TenantHistory.tsx`: Interactive timeline of version snapshots and one-click rollbacks.
- `data/`: Seeds and interfaces
  - `mockTenants.ts`: Config schemas and default seed configurations for Tenants A, B, and C.
- `utils/`: Engine logic
  - `engine.ts`: Dynamic claims processor executing SLA math, tier evaluation, custom field parsing, and email renders.
  - `diff.ts`: Compiles discrepancies between configs for the Diff matrix.
- `scripts/verify.ts`: Standalone execution validation script.

---

## ⚡ Setup & Launching Locally

To install and run this application locally, ensure you have **Node.js** (v18+) and **npm** installed:

### 1. Install Workspace Dependencies
From this directory, run:
```bash
npm install
```

### 2. Launch Local Development Server
Boot up the dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Run Automated Validation Engine
To run our deterministic CLI test submitting the same outpatient claim across our 3 seeded tenants, execute:
```bash
npx tsx scripts/verify.ts
```

---

## 🔍 Predefined Tenant Rules Evaluation

Our claims engine evaluates our 3 predefined tenants in accordance with the specific operational criteria:

### 1. Tenant A — "SafeGuard Insurance" (Corporate)
- **Rules Profile**: 3 claim types enabled (OUTPATIENT, INPATIENT, DENTAL), auto-approves up to $20,000, multi-tier manual routing (Assessor ➜ Team Lead ➜ Director), email notifications, and enforces a required `Employee ID` custom field.
- **SLA Values**: Outpatient (5 business days), Inpatient (10 business days).

### 2. Tenant B — "HealthFirst" (Retail)
- **Rules Profile**: All 5 claim types active, auto-approves up to $5,000, 2-tier manual routing (Assessor ➜ Manager), email and SMS notifications, no custom submission fields required.
- **SLA Values**: 7 business days for all types.

### 3. Tenant C — "GovHealth" (Government)
- **Rules Profile**: 2 claim types active, auto-approval set to $0 (all claims require review), single-tier routing (Committee), email and webhook notifications, and enforces two required custom fields: `Department` and `Budget Code`.
- **SLA Values**: 15 business days for all types.

---

## 🆕 Onboarding a 4th Tenant (Zero Code Changes)

Onboarding a 4th insurer is fully handled dynamically via the Admin UI, requiring **absolutely zero source code modifications**:

1. Click the blue **"Onboard New Insurer"** button in the header.
2. In the tabbed wizard:
   - **Branding**: Name: `DirectCover`, Brand Colors: `#8b5cf6` (Primary) and `#ec4899` (Secondary), Logo URL: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=120&h=120&q=80`.
   - **Operations**: Enable `DENTAL` claims, set SLA to `3` business days, set required documents to `Dental Treatment Plan, Receipt`.
   - **Approval Rules**: Set auto-approval threshold to `$8,000`. Add a custom manual routing tier: role `VP of Benefits` for claims between `$8,000` and `$50,000`.
   - **Notifications**: Check channel `email` and `SMS`, then input a custom message template.
   - **Custom Fields**: Click "Add Custom Field". Set ID to `policyCardNumber`, Label to `Policy Card Number`, Type to `text`, and check `Required`.
3. Click **"Save Configuration"**.
   - DirectCover is now live in the Insurers selector panel!
4. Navigate to the **Claim Sandbox Playground**:
   - Select `DirectCover`. Note that the custom fields section automatically renders a **Policy Card Number** input.
   - Submit a test Dental claim for `$12,000` without entering a card number ➜ Note that the custom field validation safely raises a missing field error!
   - Provide a mock card number and click submit ➜ The claim is successfully processed, routing it directly to the custom `VP of Benefits` tier, calculating a 3 business-day SLA deadline, and generating the custom SMS template!

---

## 🗑️ Removing an Insurer

To maintain a clean workbench, you can remove outdated or redundant insurer configurations:
1. Select the insurer in the active list on the left sidebar.
2. Under **Selected Insurer Summary**, click the red **Remove** button.
3. Confirm the action in the browser warning prompt.
   * **Safety Limits**: The platform prevents deleting if it is the last remaining insurer configuration, ensuring there is always at least one active tenant to drive the simulator.
   * **Selector Cleanup**: Once deleted, all comparison slots and sandbox selection dropdowns will automatically reset and bind to another active insurer to prevent layout breaks.
