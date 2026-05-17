# Papaya Insurance Glossary Search App

This is a high-performance, offline-capable **Next.js & TypeScript** Single Page Application (SPA) designed to help members quickly look up complex insurance terminology. Built for AI Engineering Challenge 04.

---

## 🌟 Key Features

- **Instant Search**: Real-time filtering by term name or definition.
- **Search Highlighting**: Highlights matching text directly within the search results for quick scanning.
- **Alphabet Quick-Jump**: A sticky sidebar allowing users to jump directly to terms starting with a specific letter. (Intelligently disables letters with no matching terms).
- **Expandable Categories**: Terms are grouped by category (General Insurance, Claims, Coverage, etc.). Categories function as accordions to keep the UI clean.
- **Cross-Linked Term Modal**: Clicking a term reveals its full definition and clickable "Related Terms". Clicking a related term seamlessly navigates to the new definition without closing the modal.
- **TypeScript Strong Typing**: Integrated a strict `Term` data model and type assertions, resolving HTML scroll casting issues and type-safety boundaries.
- **Offline Capable**: All 45+ terms are statically bundled. Once loaded, the app requires zero server requests.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Vanilla CSS with CSS Variables (`app/globals.css`)
- **Typography**: Google Fonts (Outfit)

---

## 📂 Directory Layout

- `app/page.tsx`: The primary orchestrator handling search queries, alphabet quick-jump, and state.
- `components/Highlight.tsx`: A type-safe text highlighter component highlighting search matching queries.
- `components/TermModal.tsx`: A cross-linked modal explaining terms and mapping to related definitions.
- `data/glossary.ts`: Bundles the full list of terms matching the `Term` interface.

---

## 🚀 How to Run Locally

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
Open [http://localhost:3000](http://localhost:3000) in your browser.
