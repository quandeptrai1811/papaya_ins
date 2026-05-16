# AI Challenge 04: Insurance Glossary Search App

A high-performance, offline-capable Single Page Application (SPA) designed to help members quickly look up complex insurance terminology.

## Features

- **Instant Search**: Real-time filtering by term name or definition.
- **Search Highlighting**: Highlights matching text directly within the search results for quick scanning.
- **Alphabet Quick-Jump**: A sticky sidebar allowing users to jump directly to terms starting with a specific letter. (Intelligently disables letters with no matching terms).
- **Expandable Categories**: Terms are grouped by category (General Insurance, Claims, Coverage, etc.). Categories function as accordions to keep the UI clean.
- **Cross-Linked Term Modal**: Clicking a term reveals its full definition and clickable "Related Terms". Clicking a related term seamlessly navigates to the new definition without closing the modal.
- **Offline Capable**: All 45+ terms are statically bundled. Once loaded, the app requires zero server requests.

## Technology Stack

- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: Vanilla CSS with CSS Variables (`app/globals.css`)
- **Typography**: Google Fonts (Outfit)

## How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Because this app utilizes standard Next.js features, it can be seamlessly deployed on Vercel or Netlify with zero configuration. Simply import the repository and deploy.
